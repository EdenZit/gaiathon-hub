import type { Metadata } from 'next';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, UsersIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GAIAfest Programme | GAIAthon-Hub',
  description: 'Join us for the GAIAfest Awards Ceremony - A two-day celebration of innovation and excellence in Earth Observation technology.',
};

interface Event {
  time: string;
  title: string;
  description?: string;
  participants?: string[];
  type?: 'ceremony' | 'evaluation' | 'break' | 'presentation' | 'award';
}

interface DaySchedule {
  date: string;
  venue: string;
  action: string;
  events: Event[];
}

const programme: DaySchedule[] = [
  {
    date: 'Tuesday 19 August 2025',
    venue: 'US Embassy, Accra',
    action: 'Judges will engage with GAIAthon\'25 finalists',
    events: [
      {
        time: '0900 - 1000',
        title: 'Arrival of Guest & Registration',
        type: 'ceremony'
      },
      {
        time: '1000 - 1100',
        title: 'Opening Ceremony',
        description: '• Welcome Address – Reg. Environment Office\n• Introduction of Participants – All\n• Brief Presentation on GAIA Initiative – Edenway Foundation\n• Keynote Address – Excellency Charge d\'Affaires, US Embassy\n• Group Photograph',
        type: 'ceremony'
      },
      {
        time: '1100 - 1120',
        title: 'Evaluation of Digital Innovation Pitch Solutions',
        participants: ['Green Pulse (Cameroon)', 'Tak_Tic (Tunisia)', 'NextGen Geominds (Uganda)', 'Geovisionaries (Kenya)', 'Zeroday (Malawi)'],
        type: 'evaluation'
      },
      {
        time: '1120 - 1220',
        title: 'Break',
        type: 'break'
      },
      {
        time: '1220 - 1240',
        title: 'Evaluation of Digital Innovation Pitch Solutions',
        participants: ['Sustainable Innovators (Benin)', 'IUPA-LaboEA (Senegal)', 'Terra Vigil (Togo)', 'CAD (Ghana)', 'Intellectual Powerhouse (Ghana)'],
        type: 'evaluation'
      },
      {
        time: '1240 - 1340',
        title: 'Break',
        type: 'break'
      },
      {
        time: '1340 - 1400',
        title: 'Evaluation of Smart IoT System Pitch Solutions',
        participants: ['Pharaonic Minds (Egypt)', 'EcoFarmIQ (Ethiopia)', 'GCTU-XI (Ghana)', 'Mavericks (Ghana)', 'Team_FUTA (Nigeria)'],
        type: 'evaluation'
      },
      {
        time: '1400',
        title: 'Closing Ceremony',
        type: 'ceremony'
      },
      {
        time: '1400',
        title: 'Departure',
        type: 'ceremony'
      }
    ]
  },
  {
    date: 'Wednesday 20 August 2025',
    venue: 'Mensvic Hotel, East Legon',
    action: 'Public Participation in the Award Ceremony',
    events: [
      {
        time: '0830 - 1100',
        title: 'Arrival of Guests & Registration',
        description: '• Opening Ceremony\n• Welcome Address\n• Introduction of Chair & remarks by Chair\n• Statements by Partners (University of Ghana, US Embassy, Accra, Delegation of the European Union, African Space Agency)\n• Keynote Speaker – Minister for Environment, Science & Technology, Ghana\n• The GAIA Initiative & GAIAthon Series\n• Chair\'s closing remarks\n• Group Photograph\n• Snack break & Media Engagement',
        type: 'ceremony'
      },
      {
        time: '1100 - 1600',
        title: 'Presentations & Future of GAIA Initiative',
        description: '• Presentation 1: Digital Platforms and Interactive Applications\n• The Future of GAIA Initiative: Engagement with Stakeholders\n• Presentation 2: IoT-Enabled Smart Systems',
        type: 'presentation'
      },
      {
        time: '1400',
        title: 'Lunch',
        type: 'break'
      },
      {
        time: '1600 - 1900',
        title: 'Awards Ceremony & Cocktail',
        description: '• Welcome Address\n• Introduction of Chair and Remarks\n• Keynote Speaker – President of Council of African Space Agency\n• The GAIAthon Journey\n• Presentation to Coordinators & Certificates to their participants\n• Social Media Awards\n• GAIAthon\'25 Judges\n• Announcement of 1st & 2nd Place Winners & Prizes\n• Closing remarks by Chair\n• Vote of Thanks',
        type: 'award'
      }
    ]
  }
];

export default function ProgrammePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-4">
              GAIAfest Programme
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              A two-day celebration of innovation and excellence in Earth Observation technology
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5" />
                <span>August 19-20, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                <span>Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                <span>15 Finalist Teams</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Programme Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {programme.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Day {dayIndex + 1}</h2>
                    <p className="text-xl font-semibold">{day.date}</p>
                    <div className="mt-4 space-y-2 text-blue-100">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        <span>{day.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        <span>{day.action}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-white/20">0{dayIndex + 1}</div>
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="p-8">
                <div className="space-y-6">
                  {day.events.map((event, eventIndex) => (
                    <div key={eventIndex} className="relative">
                      {/* Timeline connector */}
                      {eventIndex < day.events.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      
                      <div className="flex gap-6">
                        {/* Time */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 bg-gray-50 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {event.type === 'ceremony' && <TrophyIcon className="h-5 w-5 text-yellow-500" />}
                                {event.type === 'evaluation' && <StarIcon className="h-5 w-5 text-blue-500" />}
                                {event.type === 'presentation' && <UsersIcon className="h-5 w-5 text-green-500" />}
                                {event.type === 'award' && <TrophyIcon className="h-5 w-5 text-yellow-500" />}
                                <span className="text-sm font-medium text-gray-500">{event.time}</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.type === 'ceremony' ? 'bg-yellow-100 text-yellow-800' :
                              event.type === 'evaluation' ? 'bg-blue-100 text-blue-800' :
                              event.type === 'presentation' ? 'bg-green-100 text-green-800' :
                              event.type === 'award' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Event'}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                          )}

                          {event.participants && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Participating Teams:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {event.participants.map((participant, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-600">{participant}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join Us for This Historic Event
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Witness the future of Earth Observation technology as 15 finalist teams from across Africa compete for the prestigious GAIAthon Grand Prize.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Back to Home
              </Link>
              <Link
                href="/#finalists"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                View Finalist Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 