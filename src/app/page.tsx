import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        <Hero />
        <Features />
      </div>
    </main>
  );
}
