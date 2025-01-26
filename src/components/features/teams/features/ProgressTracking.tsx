'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  UserCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    email: string;
    name: string;
  };
  createdBy: string;
  dueDate: string;
  completedAt?: string;
  dependencies: string[];
  comments: Array<{
    author: {
      email: string;
      name: string;
    };
    content: string;
    timestamp: string;
  }>;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  tasks: string[];
  status: 'pending' | 'completed';
}

interface ProgressTrackingProps {
  teamId: string;
  isTeamLeader: boolean;
}

export default function ProgressTracking({ teamId, isTeamLeader }: ProgressTrackingProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my_tasks' | 'completed'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/tasks`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks);
          setMilestones(data.milestones);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [teamId]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/team/${teamId}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskApproval = async (taskId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/team/${teamId}/tasks/${taskId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'my_tasks') {
      return task.assignedTo.email === session?.user?.email;
    }
    if (filter === 'completed') {
      return task.status === 'completed';
    }
    return true;
  });

  const calculateProgress = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-sm text-gray-500">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(task => task.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
            <div className="flex rounded-lg shadow-sm">
              {(['all', 'my_tasks', 'completed'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg
                    ${filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-200`}
                >
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              ))}
            </div>
          </div>
          {isTeamLeader && (
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              New Task
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {filteredTasks.map(task => (
            <div key={task._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value as Task['status'])}
                    className={`text-sm font-medium rounded-full px-3 py-1 border
                      ${task.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : task.status === 'review'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : task.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                </div>
                {isTeamLeader && task.status === 'review' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskApproval(task._id, true)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircleIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleTaskApproval(task._id, false)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">{task.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <UserCircleIcon className="h-4 w-4" />
                  {task.assignedTo.name}
                </div>
                <div className="flex items-center gap-1">
                  <FlagIcon className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Milestones</h2>
          {isTeamLeader && (
            <button
              onClick={() => setShowNewMilestoneForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              New Milestone
            </button>
          )}
        </div>
        <div className="p-4 space-y-4">
          {milestones.map(milestone => (
            <div key={milestone._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                <span className={`text-sm font-medium rounded-full px-3 py-1
                  ${milestone.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{milestone.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FlagIcon className="h-4 w-4" />
                  Due {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <ChartBarIcon className="h-4 w-4" />
                  {milestone.tasks.length} Tasks
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 