import { describe, expect, beforeAll, afterAll, beforeEach, it } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearDatabase, createTestData, mockSession } from '../setup';
import { Project } from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';

describe('Project and Milestone Features', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Project Management', () => {
    it('should create a new project', async () => {
      const { team } = await createTestData();
      
      const projectData = {
        name: 'New Project',
        description: 'Project Description',
        team: team._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: team.owner
      };

      const project = await Project.create(projectData);
      expect(project).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.status).toBe('planning');
      expect(project.progress).toBe(0);
    });

    it('should update project progress based on milestone completion', async () => {
      const { project } = await createTestData();
      
      // Add two more milestones
      project.milestones.push(
        {
          title: 'Milestone 2',
          description: 'Description 2',
          dueDate: new Date(),
          status: 'pending',
          assignedTo: []
        },
        {
          title: 'Milestone 3',
          description: 'Description 3',
          dueDate: new Date(),
          status: 'pending',
          assignedTo: []
        }
      );

      await project.save();

      // Complete one milestone
      project.milestones[0].status = 'completed';
      await project.save();

      // Calculate expected progress (1 out of 3 milestones completed)
      const expectedProgress = Math.round((1 / 3) * 100);
      expect(project.progress).toBe(expectedProgress);
    });

    it('should enforce project date validation', async () => {
      const { team } = await createTestData();
      
      const invalidProjectData = {
        name: 'Invalid Project',
        description: 'Description',
        team: team._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start date after end date
        endDate: new Date(),
        createdBy: team.owner
      };

      await expect(Project.create(invalidProjectData)).rejects.toThrow();
    });
  });

  describe('Milestone Management', () => {
    it('should add a milestone to a project', async () => {
      const { project } = await createTestData();
      
      const newMilestone = {
        title: 'New Milestone',
        description: 'Milestone Description',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        assignedTo: []
      };

      project.milestones.push(newMilestone);
      await project.save();

      const updatedProject = await Project.findById(project._id);
      expect(updatedProject?.milestones).toHaveLength(2);
      expect(updatedProject?.milestones[1].title).toBe(newMilestone.title);
    });

    it('should update milestone status', async () => {
      const { project } = await createTestData();
      
      project.milestones[0].status = 'in-progress';
      await project.save();

      const updatedProject = await Project.findById(project._id);
      expect(updatedProject?.milestones[0].status).toBe('in-progress');
    });

    it('should validate milestone dates against project timeline', async () => {
      const { project } = await createTestData();
      
      const invalidMilestone = {
        title: 'Invalid Milestone',
        description: 'Description',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due date after project end date
        status: 'pending',
        assignedTo: []
      };

      project.milestones.push(invalidMilestone);
      await expect(project.save()).rejects.toThrow();
    });
  });

  describe('Project Queries', () => {
    it('should fetch projects with populated references', async () => {
      await createTestData();
      
      const projects = await Project.find()
        .populate('team', 'name')
        .populate('createdBy', 'name email')
        .populate('milestones.assignedTo', 'name email');

      expect(projects).toBeDefined();
      expect(projects[0].team).toHaveProperty('name');
      expect(projects[0].createdBy).toHaveProperty('email');
    });

    it('should filter projects by status', async () => {
      const { team } = await createTestData();
      
      // Create additional projects with different statuses
      await Project.create([
        {
          name: 'Completed Project',
          description: 'Description',
          team: team._id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: team.owner,
          status: 'completed'
        },
        {
          name: 'On Hold Project',
          description: 'Description',
          team: team._id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: team.owner,
          status: 'on-hold'
        }
      ]);

      const completedProjects = await Project.find({ status: 'completed' });
      expect(completedProjects).toHaveLength(1);
      expect(completedProjects[0].name).toBe('Completed Project');
    });
  });
}); 