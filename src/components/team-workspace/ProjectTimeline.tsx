'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdBy: {
    id: string;
    name: string;
  };
  attendees: {
    id: string;
    name: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  reminders: {
    time: Date;
    sent: boolean;
  }[];
}

interface ProjectTimelineProps {
  teamId: string;
}

export function ProjectTimeline({ teamId }: ProjectTimelineProps) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    attendees: [] as { id: string; name: string }[],
    reminders: [] as { time: Date }[],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/team/events?teamId=${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (teamId) {
      fetchEvents();
    }
  }, [teamId]);

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/team/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          ...newEvent,
          createdBy: {
            id: session?.user?.id,
            name: session?.user?.name,
          },
        }),
      });

      if (response.ok) {
        const createdEvent = await response.json();
        setEvents(prev => [...prev, createdEvent]);
        setShowEventForm(false);
        setNewEvent({
          title: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          attendees: [],
          reminders: [],
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (eventId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/team/events/${eventId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev =>
          prev.map(event =>
            event._id === eventId ? updatedEvent : event
          )
        );
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (
        date.getFullYear() === eventStart.getFullYear() &&
        date.getMonth() === eventStart.getMonth() &&
        date.getDate() >= eventStart.getDate() &&
        date.getDate() <= eventEnd.getDate()
      );
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Project Timeline</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  view === 'month'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  view === 'week'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  view === 'day'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowEventForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Event
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric',
              }).format(currentDate)}
            </h3>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday =
              date.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] bg-white p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      isToday
                        ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <button
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 truncate"
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Event</h3>
              <button
                onClick={() => setShowEventForm(false)}
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
                  value={newEvent.title}
                  onChange={e =>
                    setNewEvent(prev => ({ ...prev, title: e.target.value }))
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
                  value={newEvent.description}
                  onChange={e =>
                    setNewEvent(prev => ({
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
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={newEvent.startDate.toISOString().slice(0, 16)}
                    onChange={e =>
                      setNewEvent(prev => ({
                        ...prev,
                        startDate: new Date(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={newEvent.endDate.toISOString().slice(0, 16)}
                    onChange={e =>
                      setNewEvent(prev => ({
                        ...prev,
                        endDate: new Date(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleCreateEvent}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedEvent.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {formatDate(new Date(selectedEvent.startDate))} -{' '}
                  {formatDate(new Date(selectedEvent.endDate))}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="h-5 w-5" />
                <span>
                  {formatTime(new Date(selectedEvent.startDate))} -{' '}
                  {formatTime(new Date(selectedEvent.endDate))}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Attendees
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedEvent.attendees.map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {attendee.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          attendee.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : attendee.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {attendee.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <BellIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Reminders
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedEvent.reminders.map((reminder, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {formatDate(new Date(reminder.time))} at{' '}
                        {formatTime(new Date(reminder.time))}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          reminder.sent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reminder.sent ? 'Sent' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedEvent.attendees.find(
                a => a.id === session?.user?.id
              )?.status === 'pending' && (
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={() =>
                      handleUpdateEvent(selectedEvent._id, 'accepted')
                    }
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateEvent(selectedEvent._id, 'declined')
                    }
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 