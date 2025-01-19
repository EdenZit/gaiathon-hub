import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Workspace | GAIAthon-Hub',
  description: 'Collaborate with your team in real-time, share resources, and track progress together.',
};

export default function TeamWorkspacePage() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Team Workspace
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our collaborative team workspace is coming soon. You'll be able to work with your team in real-time, share resources, and track progress together.
          </p>
        </div>
      </div>
    </div>
  );
} 