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
    date: 'Tuesday 22 April 2025 @ 10:00 GMT',
    topic: 'Introducing Cloud-Based Tools Available on WEkEO for Efficient Analysis of Earth Observation Data',
    speaker: {
      name: 'Dr. Hayley Evers-King',
      bio: 'Hayley is a leading marine applications expert at EUMETSAT, supporting ocean-related satellite data use under the Copernicus Programme. Her expertise spans sensor validation, algorithm development, and applications in marine ecosystems, aquaculture, and climate services. She is also an advocate for open-source tools and creative science communication.',
      photo: '/images/webinar/hayley-king.jpg',
    },
    zoomLink: 'https://us06web.zoom.us/j/81666319733?pwd=t3Vc3d1SkEcJxTbqdfhbid3Sm8VmB7.1',
  },
  {
    date: 'Thursday 4 April 2025 @ 10:00 GMT',
    topic: 'Fostering Digital Entrepreneurship in Higher Education: The Role of Earth Observation Technologies',
    speaker: {
      name: 'Professor Gayane Faye',
      bio: 'Gayane is a pioneer in spatial remote sensing and led the development of Senegal\'s first satellite, GANDESAT-1A. He heads the SENSAT programme and drives innovation in Earth observation for environmental and disaster management across West Africa.',
      photo: '/images/webinar/gayan-faye.jpg',
    },
    zoomLink: 'https://us06web.zoom.us/j/86505593439?pwd=Tw3dB39ndOEb8HlIKD2n0Ww7sJ9s3s.1',
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