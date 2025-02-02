import { redis } from '@/lib/services/redis';
import { Document } from '@/models/Document';
import { Project } from '@/models/Project';
import { Team } from '@/models/Team';
import mongoose from 'mongoose';

interface ActivityMetrics {
  documentsCreated: number;
  documentsEdited: number;
  projectsCreated: number;
  milestonesCompleted: number;
  activeUsers: number;
}

interface ResourceMetrics {
  totalStorage: number;
  storageUsed: number;
  documentsCount: number;
  projectsCount: number;
  teamsCount: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  activeCollaborations: number;
  concurrentEdits: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async trackActivity(userId: string, action: string, details: Record<string, any>): Promise<void> {
    try {
      const activity = {
        userId,
        action,
        details,
        timestamp: new Date()
      };

      await redis.lpush('activity_log', JSON.stringify(activity));
      await redis.ltrim('activity_log', 0, 999); // Keep last 1000 activities
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw new Error('Failed to track activity');
    }
  }

  async getActivityMetrics(timespan: number = 24 * 60 * 60): Promise<ActivityMetrics> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - timespan * 1000);

      const [
        documentsCreated,
        documentsEdited,
        projectsCreated,
        milestonesCompleted,
        activeUsers
      ] = await Promise.all([
        Document.countDocuments({ createdAt: { $gte: startTime } }),
        Document.countDocuments({ updatedAt: { $gte: startTime } }),
        Project.countDocuments({ createdAt: { $gte: startTime } }),
        Project.aggregate([
          {
            $match: {
              'milestones.status': 'completed',
              'milestones.completedAt': { $gte: startTime }
            }
          },
          { $unwind: '$milestones' },
          {
            $match: {
              'milestones.status': 'completed',
              'milestones.completedAt': { $gte: startTime }
            }
          },
          { $count: 'total' }
        ]).then(result => result[0]?.total || 0),
        this.getActiveUsers(timespan)
      ]);

      return {
        documentsCreated,
        documentsEdited,
        projectsCreated,
        milestonesCompleted,
        activeUsers
      };
    } catch (error) {
      console.error('Error getting activity metrics:', error);
      throw new Error('Failed to get activity metrics');
    }
  }

  async getResourceMetrics(): Promise<ResourceMetrics> {
    try {
      const [documentsCount, projectsCount, teamsCount] = await Promise.all([
        Document.countDocuments(),
        Project.countDocuments(),
        Team.countDocuments()
      ]);

      // Calculate storage metrics (example implementation)
      const storageUsed = await Document.aggregate([
        {
          $group: {
            _id: null,
            totalSize: {
              $sum: {
                $strLenBytes: '$content'
              }
            }
          }
        }
      ]).then(result => result[0]?.totalSize || 0);

      return {
        totalStorage: 5 * 1024 * 1024 * 1024, // 5GB example limit
        storageUsed,
        documentsCount,
        projectsCount,
        teamsCount
      };
    } catch (error) {
      console.error('Error getting resource metrics:', error);
      throw new Error('Failed to get resource metrics');
    }
  }

  async getPerformanceMetrics(timespan: number = 5 * 60): Promise<PerformanceMetrics> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - timespan * 1000);

      // Get performance data from Redis
      const [responseTimesStr, errorsStr, activeCollabsStr] = await Promise.all([
        redis.lrange('response_times', 0, -1),
        redis.lrange('errors', 0, -1),
        redis.scard('active_collaborations')
      ]);

      // Parse response times and calculate average
      const responseTimes = responseTimesStr
        .map(Number)
        .filter(time => !isNaN(time));
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      // Calculate error rate
      const errors = errorsStr.filter(error => {
        const timestamp = JSON.parse(error).timestamp;
        return new Date(timestamp) >= startTime;
      });
      const errorRate = (errors.length / timespan) * 100;

      // Get concurrent edits count
      const concurrentEdits = await this.getConcurrentEdits();

      return {
        averageResponseTime,
        errorRate,
        activeCollaborations: typeof activeCollabsStr === 'number' ? activeCollabsStr : 0,
        concurrentEdits
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  private async getActiveUsers(timespan: number): Promise<number> {
    try {
      const startTime = new Date(Date.now() - timespan * 1000);
      const activeUsers = await Document.distinct('lastEditedBy', {
        updatedAt: { $gte: startTime }
      });
      return activeUsers.length;
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to get active users count');
    }
  }

  private async getConcurrentEdits(): Promise<number> {
    try {
      const activeEditors = await redis.smembers('active_editors');
      return activeEditors.length;
    } catch (error) {
      console.error('Error getting concurrent edits:', error);
      throw new Error('Failed to get concurrent edits count');
    }
  }

  async trackResponseTime(route: string, duration: number): Promise<void> {
    try {
      await redis.lpush('response_times', duration.toString());
      await redis.ltrim('response_times', 0, 999); // Keep last 1000 response times
    } catch (error) {
      console.error('Error tracking response time:', error);
    }
  }

  async trackError(error: Error, context: Record<string, any>): Promise<void> {
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date()
      };
      await redis.lpush('errors', JSON.stringify(errorLog));
      await redis.ltrim('errors', 0, 999); // Keep last 1000 errors
    } catch (error) {
      console.error('Error tracking error:', error);
    }
  }
} 