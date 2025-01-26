import type { Metadata } from 'next';
import { CalendarDaysIcon, MegaphoneIcon, ClockIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: "GAIAthon'25 Updates | GAIAthon-Hub",
  description: 'Stay updated with the latest announcements, events, and important dates for GAIAthon 2025.',
};

const upcomingEvents = [
  {
    title: 'Registration Opens',
    date: 'March 1, 2025',
    description: 'Team registration begins for GAIAthon 2025. Form your teams and prepare your documents.',
    type: 'registration'
  },
  {
    title: 'Orientation Session',
    date: 'March 15, 2025',
    description: 'Virtual orientation for all registered teams. Introduction to platforms and resources.',
    type: 'virtual'
  },
  {
    title: 'Workshop Series Begins',
    date: 'March 20, 2025',
    description: 'Weekly technical workshops on Earth Observation tools and methodologies.',
    type: 'workshop'
  }
];

const announcements = [
  {
    title: 'New Partnership Announcement',
    date: 'January 15, 2025',
    content: 'We are excited to announce our new partnership with leading Earth Observation organizations to provide enhanced data access for participants.'
  },
  {
    title: 'Technical Requirements Update',
    date: 'January 10, 2025',
    content: 'Updated technical specifications and requirements for GAIAthon 2025 projects have been released.'
  },
  {
    title: 'Mentorship Program Launch',
    date: 'January 5, 2025',
    content: 'Applications for our mentorship program are now open. Connect with industry experts throughout your GAIAthon journey.'
  }
];

const importantDates = [
  { date: 'March 1, 2025', event: 'Registration Opens' },
  { date: 'April 15, 2025', event: 'Registration Closes' },
  { date: 'May 1, 2025', event: 'Project Development Begins' },
  { date: 'June 15, 2025', event: 'Project Submissions Due' },
  { date: 'July 1, 2025', event: 'Finalists Announced' },
  { date: 'August 18-21, 2025', event: 'GAIAfest Awards Ceremony' }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            GAIAthon'25 Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about the latest events, announcements, and important dates for GAIAthon 2025
          </p>
        </div>

        {/* Upcoming Events Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-lg font-semibold text-gray-900 mb-2">{event.title}</div>
                <div className="text-blue-600 font-medium mb-3">{event.date}</div>
                <p className="text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <MegaphoneIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
          </div>
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                  <span className="text-sm text-gray-500">{announcement.date}</span>
                </div>
                <p className="text-gray-600">{announcement.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Important Dates Section */}
        <section>
          <div className="flex items-center mb-8">
            <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Important Dates</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {importantDates.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-[120px] font-medium text-blue-600">{item.date}</div>
                  <div className="text-gray-900">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 