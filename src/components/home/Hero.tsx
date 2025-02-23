import { clsx } from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { FaRocket, FaUsers, FaGlobe } from 'react-icons/fa6';

const stats = [
  { label: 'Universities', value: '16', icon: FaUsers },
  { label: 'Countries', value: '12', icon: FaGlobe },
  { label: 'Projects', value: '100+', icon: FaRocket },
];

export function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
      
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
            <div className="sm:text-center lg:text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block">Welcome to</span>{' '}
                      <span className="block text-blue-600">GAIAthon-Hub</span>
                    </h1>
                    <div className="relative w-[100px] h-[100px] flex-shrink-0">
                      <Image
                        src="/images/globe.gif"
                        alt="Rotating Earth Globe"
                        width={100}
                        height={100}
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    The unified platform for the 2025 GAIA Incubation Challenge, bringing together university students across Africa to innovate and create impactful solutions.
                  </p>

                  {/* CTA Buttons */}
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/register"
                        className={clsx(
                          'w-full flex items-center justify-center px-8 py-3',
                          'border border-transparent text-base font-medium rounded-md',
                          'text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10',
                          'transition-all duration-200 transform hover:scale-105'
                        )}
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="/resources/faq"
                        className={clsx(
                          'w-full flex items-center justify-center px-8 py-3',
                          'border border-transparent text-base font-medium rounded-md',
                          'text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10',
                          'transition-all duration-200 transform hover:scale-105'
                        )}
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Map Thumbnail */}
                <div className="hidden lg:block flex-shrink-0 w-[300px]">
                  <Link
                    href="/company/events/participating-countries"
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#0A192F] shadow-lg hover:shadow-xl transition-shadow">
                      <Image
                        src="/images/maps/africa-participants.png"
                        alt="Map of participating African countries"
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Click to explore participating countries
                    </p>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <stat.icon className="h-6 w-6 mx-auto text-blue-600" />
                    <div className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 