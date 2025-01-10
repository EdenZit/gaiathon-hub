import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Resources', href: '#resources' },
  { name: 'About', href: '#about' },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="transform transition-transform duration-300 group-hover:rotate-12">
              <Image
                src="/images/logo.png"
                alt="GAIAthon-Hub Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">
              GAIAthon-Hub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'text-gray-600 hover:text-blue-600',
                  'transition-colors duration-200',
                  'text-sm font-medium'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className={clsx(
                'inline-flex items-center px-4 py-2',
                'text-sm font-medium text-white',
                'bg-blue-600 hover:bg-blue-700',
                'rounded-md shadow-sm',
                'transition-colors duration-200'
              )}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 