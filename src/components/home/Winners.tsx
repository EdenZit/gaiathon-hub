'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TrophyIcon } from '@heroicons/react/24/outline';

interface Winner {
  name: string;
  image: string;
  category: string;
}

const winners: Winner[] = [
  {
    name: 'H.E. Dr. Ouattara Special Award',
    image: '/images/gaiathon_winners/gomoa-win.png',
    category: 'Gomoa GAIA Club'
  },
  {
    name: 'Addis Ababa Sc. & Tech. University',
    image: '/images/gaiathon_winners/digit-first.png',
    category: 'IoT Systems 1st Place'
  },
  {
    name: 'University of Lome',
    image: '/images/gaiathon_winners/iot-second.png',
    category: 'IoT Systems 2nd Place'
  },
  {
    name: 'Higher School of Comm. of Tunis',
    image: '/images/gaiathon_winners/iot-first.png',
    category: 'Digital Innovation 1st Place'
  },
  {
    name: 'Technical University of Kenya',
    image: '/images/gaiathon_winners/digit-second.png',
    category: 'Digital Innovation 2nd Place'
  },
  {
    name: 'The British University in Egypt',
    image: '/images/gaiathon_winners/social-win.png',
    category: 'Social Impact Award'
  }
];

export function Winners() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % winners.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: {
      x: 1000,
      opacity: 0
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: {
      zIndex: 0,
      x: -1000,
      opacity: 0
    }
  };

  return (
    <div className="py-24 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Impactful Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <TrophyIcon className="h-16 w-16 text-yellow-500 mr-4" />
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              GAIAthon'25 Winners
            </h2>
            <TrophyIcon className="h-16 w-16 text-yellow-500 ml-4" />
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrating the brilliant minds and innovative solutions that emerged victorious in Africa's premier Earth Observation hackathon
          </p>
        </motion.div>

        {/* Rolling Images Section */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Winner Image */}
                    <div className="flex-shrink-0 relative">
                      <div className="relative h-64 w-64 rounded-xl overflow-hidden">
                        <Image
                          src={winners[currentIndex].image}
                          alt={winners[currentIndex].name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 256px, 256px"
                          priority
                        />
                      </div>
                      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                        <TrophyIcon className="h-4 w-4" />
                        Winner
                      </div>
                    </div>
                    
                    {/* Winner Details */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {winners[currentIndex].name}
                      </h3>
                      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 mb-4">
                        {winners[currentIndex].category}
                      </div>
                      <p className="text-gray-600 text-lg">
                        Congratulations to our outstanding winners who demonstrated exceptional innovation, 
                        technical expertise, and commitment to solving real-world environmental challenges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {winners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to winner ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Info */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Images automatically change every 10 seconds • Click dots to navigate manually
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
