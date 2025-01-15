import type { Metadata } from 'next';
import { FAQ } from '@/components/home/FAQ';

export const metadata: Metadata = {
  title: 'FAQ | GAIAthon-Hub Resources',
  description: 'Frequently asked questions about GAIAthon 2025, including eligibility, registration, topics, and awards ceremony details.',
};

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <FAQ />
    </main>
  );
} 