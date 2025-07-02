'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface Finalist {
  name: string;
  country: string;
  photo: string;
  institution: string;
}

const finalists: Finalist[] = [
  {
    name: 'Sustainable Innovators',
    country: 'Benin',
    photo: '/images/finalists/Sustainable-Innovators.png',
    institution: 'National University of Sciences, Technologies, Engineering, and Mathematics'
  },
  {
    name: 'Green Pulse',
    country: 'Cameroon',
    photo: '/images/finalists/Green-Pulse.png',
    institution: 'University de Dschang'
  },
  {
    name: 'Pharaonic Minds',
    country: 'Egypt',
    photo: '/images/finalists/PharaonicMinds.png',
    institution: 'The British University of Egypt'
  },
  {
    name: 'EcoFarmIQ',
    country: 'Ethiopia',
    photo: '/images/finalists/EcoFarmIQ.png',
    institution: 'Addis Ababa Science and Technology University'
  },
  {
    name: 'Mavericks',
    country: 'Ghana',
    photo: '/images/finalists/Mavericks.png',
    institution: 'University of Ghana'
  },
  {
    name: 'CAD',
    country: 'Ghana',
    photo: '/images/finalists/CAD.png',
    institution: 'Kwame Nkrumah University of Science and Technology'
  },
  {
    name: 'Intellectual Powerhouse',
    country: 'Ghana',
    photo: '/images/finalists/Intellectual_Powerhouse.png',
    institution: 'University of Mines and Technology'
  },
  {
    name: 'GCTU-XI',
    country: 'Ghana',
    photo: '/images/finalists/GCTU_XI.png',
    institution: 'Ghana Communication Technology University'
  },
  {
    name: 'Geovisionaries',
    country: 'Kenya',
    photo: '/images/finalists/GeoVisionaries.png',
    institution: 'Technical University of Kenya'
  },
  {
    name: 'Zeroday',
    country: 'Malawi',
    photo: '/images/finalists/Zeroday.png',
    institution: 'University of Business and Applied Sciences'
  },
  {
    name: 'Team_FUTA',
    country: 'Nigeria',
    photo: '/images/finalists/Falcon-FUTA.png',
    institution: 'Obafemi Awolowo University & Federal University of Technology Akure'
  },
  {
    name: 'IUPA-LaboEA',
    country: 'Senegal',
    photo: '/images/finalists/IUPA-LaboEA.png',
    institution: 'Universite Cheikh Anta Diop'
  },
  {
    name: 'Terra Vigil',
    country: 'Togo',
    photo: '/images/finalists/TerraVigit.png',
    institution: 'Université de Lomé'
  },
  {
    name: 'Tak_Tic',
    country: 'Tunisia',
    photo: '/images/finalists/TakTik.png',
    institution: 'Higher School of Communication'
  },
  {
    name: 'NextGen Geominds',
    country: 'Uganda',
    photo: '/images/finalists/NextGen-Geominds.png',
    institution: 'Makerere University'
  }
];

export function Finalists() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % finalists.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % finalists.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + finalists.length) % finalists.length);
    setIsAutoPlaying(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
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
            GAIAthon'25 Finalists
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Meet the Finalist Teams from African Universities Competing for the GAIAthon Grand Prize
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0 relative">
                    <div className="relative h-48 w-48 rounded-xl overflow-hidden">
                      <Image
                        src={finalists[currentIndex].photo}
                        alt={finalists[currentIndex].name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 192px, 192px"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <TrophyIcon className="h-4 w-4" />
                      Finalist
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {finalists[currentIndex].name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {finalists[currentIndex].country}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {finalists[currentIndex].institution}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {currentIndex + 1} of {finalists.length} Finalists
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous finalist"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next finalist"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {finalists.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to finalist ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 