import { Metadata } from 'next';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | GAIAthon-Hub',
  description: 'Get in touch with us for any questions or support regarding GAIAthon-Hub.',
};

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Have questions about GAIAthon-Hub? We're here to help. Reach out to us using the contact information below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>
                
                <dl className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-6 w-6 text-navy-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1">
                        <a 
                          href="mailto:info@edenwayfoundation.com" 
                          className="text-navy-600 hover:text-navy-800 font-medium flex items-center group"
                        >
                          info@edenwayfoundation.com
                          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </dd>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <PhoneIcon className="h-6 w-6 text-navy-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-gray-900">+233 (0) 550 22 44 22</dd>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MapPinIcon className="h-6 w-6 text-navy-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-gray-900">Accra, Ghana</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-navy-700 rounded-2xl shadow-lg overflow-hidden text-white">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">How we can help</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white">Technical Support</h3>
                    <p className="mt-2 text-navy-200">
                      Having issues with the platform? Send us an email with details about your problem.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white">Partnerships</h3>
                    <p className="mt-2 text-navy-200">
                      Interested in partnering with GAIAthon-Hub? We'd love to hear from you.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white">General Inquiries</h3>
                    <p className="mt-2 text-navy-200">
                      For any other questions or information, please don't hesitate to reach out.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <a
                      href="mailto:info@edenwayfoundation.com"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-navy-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-700 focus:ring-white transition-colors duration-200"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-500">
              We aim to respond to all inquiries within 24-48 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 