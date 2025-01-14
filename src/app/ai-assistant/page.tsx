import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Assistant | GAIAthon-Hub',
  description: 'Get help with your Earth Observation projects through our intelligent chatbot assistant.',
};

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI Assistant
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our intelligent AI assistant is coming soon to help you with your Earth Observation projects. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
} 