'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const faqData = [
  {
    question: "What is GAIAthon?",
    answer: "GAIAthon is an annual innovative challenge organised by Edenway Foundation. It aims to harness the capabilities of university students across Africa to promote digital stewardship for sustainability."
  },
  {
    question: "Who can participate in GAIAthon '25?",
    answer: "GAIAthon '25 is this year's innovation challenge, open to all students enrolled at African universities. Participants must form teams of two or more members, ensuring gender inclusivity."
  },
  {
    question: "How can teams register for GAIAthon '25?",
    answer: "Teams can register online by completing the registration form available at www.gaiaclubs.org."
  },
  {
    question: "What are the topics for GAIAthon '25?",
    answer: "The topics for GAIAthon '25 are related to monitoring coastal and marine environment, land and water resources."
  },
  {
    question: "What types of data and tools can teams use for their projects?",
    answer: "Teams are encouraged to access Dunia and WEkEO sites for EO data and other resources."
  },
  {
    question: "What is the solution development timeline for GAIAthon '25?",
    answer: "Each team will have 6 weeks to develop their solution."
  },
  {
    question: "When and where will the GAIAthon '25 awards ceremony take place?",
    answer: "The GAIAthon '25 Awards Ceremony is referred to as GAIAfest and this will take place in Accra, Ghana from 18 – 21 August 2025."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about GAIAthon '25
          </p>
        </div>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className={clsx(
                'bg-white rounded-xl shadow-sm overflow-hidden',
                'border border-gray-100 hover:border-blue-100 transition-colors',
                'transform transition duration-200',
                openIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              )}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                <ChevronDownIcon 
                  className={clsx(
                    'w-5 h-5 text-gray-500',
                    'transform transition-transform duration-200',
                    openIndex === index ? 'rotate-180' : ''
                  )}
                />
              </button>
              <div
                className={clsx(
                  'overflow-hidden transition-all duration-200',
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                )}
              >
                <div className="p-6 pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 