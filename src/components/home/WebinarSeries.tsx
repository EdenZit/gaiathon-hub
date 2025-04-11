'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface Speaker {
  name: string;
  bio: string;
  photo: string;
}

interface Webinar {
  date: string;
  topic: string;
  speaker: Speaker;
  zoomLink?: string;
}

const webinars: Webinar[] = [
  {
    date: 'Tuesday 15 April 2025 @ 10:00 GMT',
    topic: 'Enhancing Fisheries Management in the Gulf of Guinea: Leveraging Earth Observation Data for Sustainable Practice',
    speaker: {
      name: 'Dr. Kwame Agyekum',
      bio: 'Kwame serves as the Project Manager of the GMES and Africa programme for the North and West African coastal states. He integrates satellite data with ocean modelling to address illegal fishing in West Africa. His Earth Observation (EO)-driven tools provide coastal states with actionable insights to enhance maritime security, fisheries management and oil spill monitoring.',
      photo: '/images/webinar/kwame-agyekum.jpg',
    },
    zoomLink: 'https://us06web.zoom.us/j/89400316941?pwd=wJ8rgJUQn2CiKrPnw5AVsbDaX17eYj.1',
  },
  {
    date: 'Thursday 17 April 2025 @ 10:00 GMT',
    topic: 'Harnessing Earth Observation for Sustainable Development: The GMES and Africa Programme',
    speaker: {
      name: 'Mr. Hamdi Kacem',
      bio: 'Hamdi is a sustainable development leader with 20+ years\' experience, spearheads GMES & Africa\'s Technical Assistance Team at the African Union Commission. He bridges geospatial tech and partnerships to advance Earth Observation solutions for Africa\'s environmental and resource challenges.',
      photo: '/images/webinar/hamdi-kacem.jpg',
    },
    zoomLink: 'https://us06web.zoom.us/j/83817773048?pwd=QgOOym5X3dPD4YO7sjyZUHDewha0pg.1',
  },
  {
    date: 'Tuesday 8 April 2025 @ 10:00 GMT',
    topic: 'Empowering African Youth through GAIA Initiatives: A Pathway to Technological Innovation',
    speaker: {
      name: 'Prof. George Wiafe',
      bio: '',
      photo: '',
    },
  },
  {
    date: 'Thursday 10 April 2025 @ 10:00 GMT',
    topic: 'From Prototype to Profit: Building an EO and IoT Start-up in Africa',
    speaker: {
      name: 'Mr. Meshack Ndiritu',
      bio: '',
      photo: '',
    },
  },
];

export function WebinarSeries() {
  return (
    <div className="bg-gray-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            GAIAthon'25 Webinar Series
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join our expert speakers as they share insights and knowledge to enhance your GAIAthon journey
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-2">
          {webinars.map((webinar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center text-sm text-blue-600 mb-4">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>{webinar.date}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {webinar.topic}
                </h3>

                {webinar.speaker.photo && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden">
                        <Image
                          src={webinar.speaker.photo}
                          alt={webinar.speaker.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 96px, 96px"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{webinar.speaker.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{webinar.speaker.bio}</p>
                    </div>
                  </div>
                )}

                {!webinar.speaker.photo && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">{webinar.speaker.name}</h4>
                  </div>
                )}

                {webinar.zoomLink && (
                  <div className="mt-6">
                    <Link
                      href={webinar.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <VideoCameraIcon className="h-5 w-5 mr-2" />
                      Join Webinar
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 