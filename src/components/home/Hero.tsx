'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { MotionDiv } from '@/components/motion';
import { FaRocket, FaUsers, FaGlobe, FaArrowRight } from 'react-icons/fa6';

const stats = [
  { label: 'Universities', value: '16', icon: FaUsers },
  { label: 'Countries', value: '12', icon: FaGlobe },
  { label: 'Projects', value: '50+', icon: FaRocket },
];

export function Hero() {
  const scrollToTracks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById('innovation-tracks');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#0A192F] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-transparent to-green-900/30" />
        <Image
          src="/images/eo.png"
          alt="Earth Observation Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 py-16 sm:py-24 md:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7">
              <MotionDiv
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="block text-gray-200">Innovate for</span>
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                    Africa's Future
                  </span>
                </h1>
                <p className="mt-6 text-lg text-gray-300 sm:text-xl max-w-3xl">
                  Join Africa's premier Earth Observation hackathon, where brilliant minds unite to develop innovative solutions for environmental challenges using cutting-edge technology.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className={clsx(
                      'inline-flex items-center justify-center px-6 py-3',
                      'rounded-lg bg-blue-600 text-base font-medium text-white',
                      'shadow-lg shadow-blue-600/30',
                      'transition-all duration-300 ease-in-out',
                      'hover:bg-blue-500 hover:shadow-blue-500/30 hover:scale-105'
                    )}
                  >
                    Register Now
                  </Link>
                  <Link
                    href="#innovation-tracks"
                    onClick={scrollToTracks}
                    className={clsx(
                      'inline-flex items-center justify-center px-6 py-3',
                      'rounded-lg bg-gray-800 text-base font-medium text-gray-300',
                      'border border-gray-700',
                      'transition-all duration-300 ease-in-out',
                      'hover:bg-gray-700 hover:text-white hover:scale-105'
                    )}
                  >
                    Learn More
                  </Link>
                </div>
              </MotionDiv>
            </div>

            {/* Right Column - Map and Stats */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <MotionDiv
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="relative"
              >
                {/* Map with clickable area */}
                <div className="relative">
                  <Link 
                    href="/company/events/participating-countries"
                    className="block group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A192F] shadow-2xl">
                      {/* Transparent overlay to make entire area clickable */}
                      <div className="absolute inset-0 z-20" aria-hidden="true"></div>
                      
                      <Image
                        src="/images/maps/africa-participants.png"
                        alt="Map of participating African countries"
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent" />
                      
                      {/* Stats Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none z-10">
                        <div className="grid grid-cols-3 gap-4">
                          {stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="text-center"
                            >
                              <stat.icon className="h-6 w-6 mx-auto text-blue-400 mb-2" />
                              <div className="text-2xl font-bold text-white">{stat.value}</div>
                              <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-blue-400 group-hover:text-blue-300 transition-colors">
                        Tap to Explore GAIAthon'25 Participating Institutions!
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 