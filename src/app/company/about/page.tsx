import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaUsers, FaLightbulb, FaHandshake } from 'react-icons/fa6';

export const metadata: Metadata = {
  title: 'About Us - GAIAthon-Hub',
  description: 'Learn about GAIA Clubs, our mission, programs, and how you can join our community.',
};

export default function AboutPage() {
  const features = [
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'Driving technological advancement and creative solutions in Earth Observation.',
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'Building a vibrant network of learners, researchers, and innovators.',
    },
    {
      icon: FaHandshake,
      title: 'Collaboration',
      description: 'Fostering partnerships and knowledge sharing across the globe.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800">
        <div className="absolute inset-0">
          <Image
            src="/images/earth-observation.jpg"
            alt="Earth Observation"
            fill
            className="object-cover mix-blend-overlay"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            About GAIA Clubs
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-100">
            Empowering communities through Earth Observation technology and innovation.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Mission</h2>
            <p className="mt-8 text-xl text-gray-500 leading-8">
              At GAIA Clubs, we believe in the power of technology to drive change and innovation in Earth Observation. 
              We invite you to become part of our vibrant community of learners, dreamers, and doers who are passionate 
              about leveraging technology for environmental monitoring and sustainable development.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-navy-500 rounded-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
              >
                <div className="flex justify-center">
                  <span className="rounded-lg inline-flex p-3 bg-navy-50 text-navy-700 ring-4 ring-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-center">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Programs</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We offer various programs and initiatives aimed at empowering individuals with technological 
              skills and knowledge in Earth Observation and environmental monitoring.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Program items can be added here */}
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="bg-green-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-green-200">Join our community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 