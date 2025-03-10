'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IUpcomingEvent, IAnnouncement, IImportantDate } from '@/models/Announcement';

type FormSection = 'upcomingEvents' | 'announcements' | 'importantDates';

interface PageData {
  upcomingEvents: IUpcomingEvent[];
  announcements: IAnnouncement[];
  importantDates: IImportantDate[];
}

export default function EventsManagementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<FormSection>('upcomingEvents');
  const [pageData, setPageData] = useState<PageData>({
    upcomingEvents: [],
    announcements: [],
    importantDates: []
  });

  // Form states for each section
  const [upcomingEventForm, setUpcomingEventForm] = useState({
    topic: '',
    date: '',
    description: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    topic: '',
    date: '',
    description: ''
  });

  const [importantDateForm, setImportantDateForm] = useState({
    date: '',
    description: ''
  });

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (!res.ok) throw new Error('Failed to fetch page data');
      const data = await res.json();
      setPageData({
        upcomingEvents: data.upcomingEvents || [],
        announcements: data.announcements || [],
        importantDates: data.importantDates || []
      });
    } catch (err) {
      console.error('Error fetching page data:', err);
      setError('Failed to load page data');
    }
  };

  const handleSubmit = async (e: React.FormEvent, section: FormSection) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let newData = { ...pageData };

      switch (section) {
        case 'upcomingEvents':
          newData.upcomingEvents = [...pageData.upcomingEvents, {
            topic: upcomingEventForm.topic,
            date: new Date(upcomingEventForm.date),
            description: upcomingEventForm.description
          }];
          setUpcomingEventForm({ topic: '', date: '', description: '' });
          break;

        case 'announcements':
          newData.announcements = [...pageData.announcements, {
            topic: announcementForm.topic,
            date: new Date(announcementForm.date),
            description: announcementForm.description
          }];
          setAnnouncementForm({ topic: '', date: '', description: '' });
          break;

        case 'importantDates':
          newData.importantDates = [...pageData.importantDates, {
            date: new Date(importantDateForm.date),
            description: importantDateForm.description
          }];
          setImportantDateForm({ date: '', description: '' });
          break;
      }

      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Protection': '1'
        },
        body: JSON.stringify(newData)
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Response error:', res.status, error);
        throw new Error(error.message || `Failed to update page (Status: ${res.status})`);
      }

      setPageData(newData);
      router.refresh();
    } catch (err) {
      console.error('Error updating page:', err);
      setError(err instanceof Error ? err.message : 'Failed to update page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (section: FormSection, index: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const newData = { ...pageData };
      newData[section] = newData[section].filter((_, i) => i !== index);

      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setPageData(newData);
      router.refresh();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['upcomingEvents', 'announcements', 'importantDates'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeSection === section
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {section === 'upcomingEvents' ? 'Upcoming Events' :
               section === 'announcements' ? 'Announcements' : 'Important Dates'}
            </button>
          ))}
        </nav>
      </div>

      {/* Forms */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Upcoming Events Form */}
        {activeSection === 'upcomingEvents' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Upcoming Event</h2>
            <form onSubmit={(e) => handleSubmit(e, 'upcomingEvents')} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={upcomingEventForm.topic}
                  onChange={(e) => setUpcomingEventForm({ ...upcomingEventForm, topic: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  value={upcomingEventForm.date}
                  onChange={(e) => setUpcomingEventForm({ ...upcomingEventForm, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={upcomingEventForm.description}
                  onChange={(e) => setUpcomingEventForm({ ...upcomingEventForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Event'}
              </button>
            </form>

            {/* List of Upcoming Events */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Upcoming Events</h3>
              <div className="space-y-4">
                {pageData.upcomingEvents.map((event, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.topic}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="mt-1 text-gray-600">{event.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete('upcomingEvents', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Announcements Form */}
        {activeSection === 'announcements' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Announcement</h2>
            <form onSubmit={(e) => handleSubmit(e, 'announcements')} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={announcementForm.topic}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, topic: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  value={announcementForm.date}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Announcement'}
              </button>
            </form>

            {/* List of Announcements */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Announcements</h3>
              <div className="space-y-4">
                {pageData.announcements.map((announcement, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{announcement.topic}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(announcement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="mt-1 text-gray-600">{announcement.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete('announcements', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Important Dates Form */}
        {activeSection === 'importantDates' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Important Date</h2>
            <form onSubmit={(e) => handleSubmit(e, 'importantDates')} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={importantDateForm.date}
                  onChange={(e) => setImportantDateForm({ ...importantDateForm, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={importantDateForm.description}
                  onChange={(e) => setImportantDateForm({ ...importantDateForm, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Important Date'}
              </button>
            </form>

            {/* List of Important Dates */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Important Dates</h3>
              <div className="space-y-4">
                {pageData.importantDates.map((date, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(date.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="mt-1 text-gray-600">{date.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete('importantDates', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
} 