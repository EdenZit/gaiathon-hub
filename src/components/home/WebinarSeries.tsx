'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Speaker {
  name: string;
  bio: string;
  photo: string;
  date: string;
  topic: string;
  affiliation: string;
}

const webinars: Speaker[] = [
  {
    name: 'Professor George Wiafe',
    bio: 'Edenway Foundation',
    photo: '/images/webinar/george-wiafe.jpg',
    date: '8th April 2025',
    topic: 'Empowering African Youth through GAIA Initiatives: A Pathway to Technological Innovation',
    affiliation: 'Edenway Foundation'
  },
  {
    name: 'Mr. Meshack Ndiritu',
    bio: 'AfriOrbit Ltd',
    photo: '/images/webinar/meshack-ndiritu.jpg',
    date: '10th April 2025',
    topic: 'From Prototype to Profit: Building an EO and IoT Start-up in Africa',
    affiliation: 'AfriOrbit Ltd'
  },
  {
    name: 'Dr. Kwame Adu Agyekum',
    bio: 'Regional Marine Centre, UG',
    photo: '/images/webinar/kwame-agyekum.jpg',
    date: '15th April 2025',
    topic: 'Enhancing Fisheries Management in the Gulf of Guinea: Leveraging Earth Observation Data for Sustainable Practice',
    affiliation: 'Regional Marine Centre, UG'
  },
  {
    name: 'Mr. Hamdi Kacem',
    bio: 'GMES&A, African Union Commission',
    photo: '/images/webinar/hamdi-kacem.jpg',
    date: '17th April 2025',
    topic: 'Harnessing Earth Observation for Sustainable Development: The GMES and Africa Programme',
    affiliation: 'GMES&A, African Union Commission'
  },
  {
    name: 'Dr. Hayley Evers-King',
    bio: 'EUMETSAT',
    photo: '/images/webinar/hayley-king.jpg',
    date: '22nd April 2025',
    topic: 'Introducing Cloud-Based Tools Available on WEkEO for Efficient Analysis of Earth Observation',
    affiliation: 'EUMETSAT'
  },
  {
    name: 'Professor Gayane FAYE',
    bio: 'GMES & Africa Academic Network',
    photo: '/images/webinar/gayan-faye.jpg',
    date: '24th April 2025',
    topic: 'Fostering Digital Entrepreneurship in Higher Education: The Role of Earth Observation Technologies',
    affiliation: 'GMES & Africa Academic Network'
  },
  {
    name: 'Mr. Samuel Adranyi',
    bio: 'Crafted Climate Ltd',
    photo: '/images/webinar/samuel-adranyi.jpg',
    date: '29th April 2025',
    topic: 'Bridging Knowledge and Innovation: A Journey from Campus to IoT Entrepreneurship in Africa',
    affiliation: 'Crafted Climate Ltd'
  },
  {
    name: 'Dr. András Zlinszky',
    bio: 'Copernicus Data Space Ecosystem',
    photo: '/images/webinar/andras-zlinszky.jpg',
    date: '8th May 2025',
    topic: 'Getting started with Copernicus Data Space Ecosystem - tackling environmental challenges in Africa with free data and processing power',
    affiliation: 'Copernicus Data Space Ecosystem'
  }
];

export function WebinarSeries() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % webinars.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % webinars.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + webinars.length) % webinars.length);
    setIsAutoPlaying(false);
  };

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
          <p className="mt-4 text-lg text-gray-600 flex items-center justify-center gap-2">
            Watch the recorded sessions as our expert speakers share insights to enrich your GAIAthon journey. Now available on YouTube.
            <Link 
              href="https://www.youtube.com/@EdenwayFoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </Link>
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="relative h-48 w-48 rounded-xl overflow-hidden">
                    <Image
                      src={webinars[currentIndex].photo}
                      alt={webinars[currentIndex].name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 192px, 192px"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-blue-600 mb-2">
                    {webinars[currentIndex].date}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {webinars[currentIndex].topic}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {webinars[currentIndex].name}
                  </h4>
                  <p className="text-gray-600">
                    {webinars[currentIndex].affiliation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div className="flex justify-center mt-6 gap-2">
            {webinars.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 