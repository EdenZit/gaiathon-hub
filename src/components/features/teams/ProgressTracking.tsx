'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronRightIcon,
  UserCircleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  dueDate: Date;
  completedAt?: Date;
  dependencies?: string[];
  comments: {
    author: {
      id: string;
      name: string;
    };
    content: string;
    timestamp: Date;
  }[];
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  tasks: string[];
}

interface ProgressTrackingProps {
  teamId: string;
}

interface NewTask {
  title: string;
  description: string;
  priority: Task['priority'];
  assignedTo: string;
  dueDate: Date;
}

export function ProgressTracking({ teamId }: ProgressTrackingProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: new Date(),
  });
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
  });
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, milestonesResponse] = await Promise.all([
          fetch(`/api/team/tasks?teamId=${teamId}`),
          fetch(`/api/team/milestones?teamId=${teamId}`),
        ]);

        if (tasksResponse.ok && milestonesResponse.ok) {
          const [tasksData, milestonesData] = await Promise.all([
            tasksResponse.json(),
            milestonesResponse.json(),
          ]);

          setTasks(tasksData);
          setMilestones(milestonesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (teamId) {
      fetchData();

      // Initialize WebSocket connection
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      );

      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({ type: 'join-team', teamId }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'task-status-changed') {
          setTasks(prev =>
            prev.map(task =>
              task._id === data.taskId
                ? { ...task, status: data.status }
                : task
            )
          );
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [teamId]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/team/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          ...newTask,
          createdBy: {
            id: session?.user?.id,
            name: session?.user?.name,
          },
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks(prev => [...prev, createdTask]);
        setShowTaskForm(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          assignedTo: '',
          dueDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCreateMilestone = async () => {
    try {
      const response = await fetch('/api/team/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          ...newMilestone,
        }),
      });

      if (response.ok) {
        const createdMilestone = await response.json();
        setMilestones(prev => [...prev, createdMilestone]);
        setShowMilestoneForm(false);
        setNewMilestone({
          title: '',
          description: '',
          dueDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      socket?.send(JSON.stringify({
        type: 'task-update',
        taskId,
        status,
        userId: session?.user?.id,
        userName: session?.user?.name,
      }));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const response = await fetch(`/api/team/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          author: {
            id: session?.user?.id,
            name: session?.user?.name,
          },
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev =>
          prev.map(task =>
            task._id === taskId ? updatedTask : task
          )
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'all' ? true : task.status === filter
  );

  const calculateProgress = (milestone: Milestone) => {
    const milestoneTasks = tasks.filter(task =>
      milestone.tasks.includes(task._id)
    );
    if (milestoneTasks.length === 0) return 0;
    const completedTasks = milestoneTasks.filter(
      task => task.status === 'completed'
    ).length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow mr-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {(['all', 'pending', 'in_progress', 'completed', 'blocked'] as const).map(
              status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    filter === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          handleUpdateTaskStatus(
                            task._id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )
                        }
                        className={`rounded-full p-1 ${
                          task.status === 'completed'
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <CheckCircleIcon className="h-6 w-6" />
                      </button>
                      <div>
                        <h3
                          className={`text-lg font-medium ${
                            task.status === 'completed'
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`inline-flex items-center text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-500">
                        <UserCircleIcon className="h-5 w-5 mr-1" />
                        {task.assignedTo.name}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Details
                      <ChevronRightIcon className="h-5 w-5 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Sidebar */}
      <div className="w-96 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New
            </button>
          </div>
          <div className="space-y-4">
            {milestones.map(milestone => (
              <div
                key={milestone._id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {milestone.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      milestone.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {milestone.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {milestone.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <FlagIcon className="h-5 w-5 mr-1" />
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-500 mr-1" />
                    <span className="font-medium text-blue-600">
                      {calculateProgress(milestone)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${calculateProgress(milestone)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Task</h3>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={e =>
                    setNewTask(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={e =>
                    setNewTask(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={e =>
                      setNewTask(prev => ({
                        ...prev,
                        priority: e.target.value as Task['priority'],
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="assignedTo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assigned To
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={e =>
                      setNewTask(prev => ({
                        ...prev,
                        assignedTo: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTask.dueDate.toISOString().split('T')[0]}
                  onChange={e =>
                    setNewTask(prev => ({
                      ...prev,
                      dueDate: new Date(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleCreateTask}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Milestone</h3>
              <button
                onClick={() => setShowMilestoneForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="milestoneTitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="milestoneTitle"
                  value={newMilestone.title}
                  onChange={e =>
                    setNewMilestone(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="milestoneDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="milestoneDescription"
                  value={newMilestone.description}
                  onChange={e =>
                    setNewMilestone(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="milestoneDueDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="milestoneDueDate"
                  value={newMilestone.dueDate.toISOString().split('T')[0]}
                  onChange={e =>
                    setNewMilestone(prev => ({
                      ...prev,
                      dueDate: new Date(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleCreateMilestone}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedTask.title}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedTask.description}</p>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status.replace('_', ' ')}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-medium ${getPriorityColor(
                    selectedTask.priority
                  )}`}
                >
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-1" />
                  {selectedTask.assignedTo.name}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                </div>
                {selectedTask.completedAt && (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-1 text-green-500" />
                    Completed:{' '}
                    {new Date(selectedTask.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Comments
                </h4>
                <div className="space-y-4">
                  {selectedTask.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {comment.author.name[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {comment.content}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 