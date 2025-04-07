'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, UserIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface Speaker {
  name: string;
  bio: string;
  photo: string;
}

interface Webinar {
  date: string;
  topic: string;
  zoomLink: string;
  speaker: Speaker;
}

const webinars: Webinar[] = [
  {
    date: 'Tuesday 8 April 2025 @ 10:00 GMT',
    topic: 'Empowering African Youth through GAIA Initiatives: A Pathway to Technological Innovation',
    zoomLink: 'https://us06web.zoom.us/j/83837089885?pwd=iZtoD5XRLEBFAyG8U9iIju2JtfkzLa.1',
    speaker: {
      name: 'Professor George Wiafe',
      bio: 'George is the Founder of Edenway Foundation and initiator of the GAIA programme, Professor Wiafe empowers African youth with digital and Earth Observation skills to drive innovation, entrepreneurship, and sustainable development in under-represented communities.',
      photo: '/images/webinar/george-wiafe.jpg'
    }
  },
  {
    date: 'Thursday 10 April 2025 @ 10:00 GMT',
    topic: 'From Prototype to Profit: Building an EO and IoT Start-up in Africa',
    zoomLink: 'https://us06web.zoom.us/j/88368814873?pwd=n4VDP8HsITy6dWOtq7PIQdzZVgZ1fG.1',
    speaker: {
      name: 'Mr. Meshack Kinyua Ndiritu',
      bio: 'Meshack, architect of Africa\'s space policies, integrates AI and Earth Observation for continental growth. His leadership at GMES & Africa has trained thousands, fostering innovation in resource management and open-source tech.',
      photo: '/images/webinar/meshack-ndiritu.jpg'
    }
  }
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
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <CalendarIcon className="h-5 w-5" />
                  <span className="font-medium">{webinar.date}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {webinar.topic}
                </h3>

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

                <Link
                  href={webinar.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <VideoCameraIcon className="h-5 w-5" />
                  Join Webinar
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 