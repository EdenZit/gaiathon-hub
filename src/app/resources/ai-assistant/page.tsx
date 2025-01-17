import { Metadata } from 'next';
import { AIAssistantLayout } from '@/components/ai-assistant/AIAssistantLayout';

export const metadata: Metadata = {
  title: 'AI Assistant | GAIAthon-Hub',
  description: 'Specialized AI Assistant for IoT, Earth Observation, and Remote Sensing',
};

export default function AIAssistantPage() {
  return <AIAssistantLayout />;
} 