'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  BellIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  attendees: Array<{
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  reminders: Array<{
    time: string;
    type: 'email' | 'notification';
  }>;
}

interface ProjectTimelineProps {
  teamId: string;
  isTeamLeader: boolean;
}

type ViewType = 'month' | 'week' | 'day';

export default function ProjectTimeline({ teamId, isTeamLeader }: ProjectTimelineProps) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/calendar/events`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [teamId]);

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
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return date >= start && date <= end;
    });
  };

  const handleExportCalendar = async () => {
    try {
      const response = await fetch(`/api/team/${teamId}/calendar/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'team-calendar.ics';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting calendar:', error);
    }
  };

  const handleImportCalendar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/team/${teamId}/calendar/import`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error importing calendar:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Team Calendar</h2>
          <div className="flex rounded-lg shadow-sm">
            {(['month', 'week', 'day'] as ViewType[]).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg
                  ${viewType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-200`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTeamLeader && (
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              Add Event
            </button>
          )}
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={handleExportCalendar}
              className="p-2 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-l-lg"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <label className="p-2 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-r-lg cursor-pointer">
              <ArrowUpTrayIcon className="h-5 w-5" />
              <input
                type="file"
                accept=".ics"
                className="hidden"
                onChange={handleImportCalendar}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-sm font-medium text-gray-900">
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[100px] ${
                  date.getMonth() !== currentDate.getMonth()
                    ? 'text-gray-400'
                    : 'text-gray-900'
                }`}
              >
                <div className="font-medium">{date.getDate()}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <button
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left text-xs p-1 rounded bg-blue-50 text-blue-700 truncate hover:bg-blue-100"
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
    </div>
  );
} 