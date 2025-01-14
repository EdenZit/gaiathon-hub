'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaTiktok,
} from 'react-icons/fa6';

export function Footer() {
  const companyLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/company/about' },
    { name: 'Sponsors', href: '/company/sponsors' },
    { name: 'Events', href: '/company/events' },
    { name: 'Gallery', href: '/company/gallery' },
  ];

  const resourceLinks = [
    { name: 'Centralized Access', href: '/resources/centralized-access' },
    { name: 'AI Assistant', href: '/resources/ai-assistant' },
    { name: 'Team Workspace', href: '/resources/team-workspace' },
    { name: 'Blog', href: '/resources/blog' },
    { name: 'FAQ', href: '/resources/faq' },
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/legal/terms-of-service' },
    { name: 'Privacy Policy', href: '/legal/privacy-policy' },
    { name: 'Cookie Policy', href: '/legal/cookie-policy' },
  ];

  const socialLinks = [
    { name: 'X (Twitter)', icon: FaXTwitter, href: 'https://twitter.com/GAIAclubs' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/gaiaclubs' },
    { name: 'LinkedIn', icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/gaiaclubs/?viewAsMember=true' },
    { name: 'Facebook', icon: FaFacebookF, href: '#' },
    { name: 'TikTok', icon: FaTiktok, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="GAIA Logo"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm">
              Edenway Foundation<br />
              1 Edenkro Road, Gomoa West<br />
              Central Region. GHANA<br />
              +233 (0) 550 22 44 22<br />
              info@edenwayfoundation.com
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-gray-400 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} GAIAthon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 