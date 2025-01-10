import { BeakerIcon, ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Centralized Access',
    description: 'Access tools and datasets from SNAP, WEkEO, Dunia, and more through a single unified platform.',
    icon: BeakerIcon,
  },
  {
    name: 'AI Assistant',
    description: 'Get help with your Earth Observation projects through our intelligent chatbot assistant.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Team Workspace',
    description: 'Collaborate with your team in real-time, share resources, and track progress together.',
    icon: UserGroupIcon,
  },
];

export function Features() {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for your Earth Observation projects
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Access powerful tools, collaborate with teams, and develop innovative solutions all in one place.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </div>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 