import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDaysIcon, MegaphoneIcon, StarIcon } from '@heroicons/react/24/outline';
import { connectDB } from '@/lib/mongodb';
import { AnnouncementPage, IUpcomingEvent, IAnnouncement, IImportantDate, IAnnouncementPage } from '@/models/Announcement';

export const metadata: Metadata = {
  title: 'GAIAthon Updates | GAIAthon-Hub',
  description: 'Stay updated with the latest announcements, events, and important dates for GAIAthon.',
};

interface PageData {
  upcomingEvents: IUpcomingEvent[];
  announcements: IAnnouncement[];
  importantDates: IImportantDate[];
}

async function getPageData(): Promise<PageData> {
  await connectDB();
  const data = (await AnnouncementPage.findOne().lean()) as IAnnouncementPage | null;
  return {
    upcomingEvents: data?.upcomingEvents || [],
    announcements: data?.announcements || [],
    importantDates: data?.importantDates || []
  };
}

export default async function EventsPage() {
  const pageData = await getPageData();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
            GAIAthon'25 Updates
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Stay informed about GAIAthon activities, announcements, and important dates
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Upcoming Events */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="space-y-6">
            {pageData.upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.topic}
                  </h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {pageData.upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming events at this time.</p>
            )}
          </div>
        </section>

        {/* Latest Announcements */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <MegaphoneIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Latest Announcements</h2>
          </div>
          <div className="space-y-6">
            {pageData.announcements.map((announcement, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {announcement.topic}
                  </h3>
                  <p className="text-gray-600 mb-4">{announcement.description}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {new Date(announcement.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {pageData.announcements.length === 0 && (
              <p className="text-gray-500 text-center py-4">No announcements at this time.</p>
            )}
          </div>
        </section>

        {/* Important Dates */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <StarIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Important Dates</h2>
          </div>
          <div className="space-y-4">
            {pageData.importantDates.map((date, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-bold text-blue-600">
                    {new Date(date.date).getDate()}
                  </span>
                  <span className="block text-sm text-blue-600">
                    {new Date(date.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{date.description}</p>
                </div>
              </div>
            ))}
            {pageData.importantDates.length === 0 && (
              <p className="text-gray-500 text-center py-4">No important dates at this time.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
} 