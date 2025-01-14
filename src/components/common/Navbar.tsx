'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { data: session } = useSession()

  const navigation = {
    company: [
      { name: 'Home', href: '/company/home' },
      { name: 'About', href: '/company/about' },
      { name: 'Sponsors', href: '/company/sponsors' },
      { name: 'Events', href: '/company/events' },
      { name: 'Gallery', href: '/company/gallery' },
    ],
    resources: [
      { name: 'Centralized Access', href: '/resources/centralized-access' },
      { name: 'AI Assistant', href: '/resources/ai-assistant' },
      { name: 'Team Workspace', href: '/resources/team-workspace' },
      { name: 'Blog', href: '/resources/blog' },
      { name: 'FAQ', href: '/resources/faq' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/legal/terms-of-service' },
      { name: 'Privacy Policy', href: '/legal/privacy-policy' },
      { name: 'Cookie Policy', href: '/legal/cookie-policy' },
    ],
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <header className="bg-gray-900 text-gray-300">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="group">
              <div className="transform transition-transform duration-300 group-hover:rotate-12">
                <Image
                  src="/images/logo.png"
                  alt="GAIA Logo"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:flex">
              {/* Company Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('company')}
                  className="flex items-center text-base font-medium text-gray-300 hover:text-white"
                >
                  Company
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </button>
                {openDropdown === 'company' && (
                  <div className="absolute z-50 mt-3 w-48 rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {navigation.company.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('resources')}
                  className="flex items-center text-base font-medium text-gray-300 hover:text-white"
                >
                  Resources
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </button>
                {openDropdown === 'resources' && (
                  <div className="absolute z-50 mt-3 w-48 rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {navigation.resources.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('legal')}
                  className="flex items-center text-base font-medium text-gray-300 hover:text-white"
                >
                  Legal
                  <ChevronDownIcon className="ml-2 h-5 w-5" />
                </button>
                {openDropdown === 'legal' && (
                  <div className="absolute z-50 mt-3 w-48 rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {navigation.legal.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {session ? (
              <Link
                href="/dashboard"
                className="ml-8 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="ml-8 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {/* Company Section */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleDropdown('company-mobile')}
                  className="w-full flex items-center justify-between text-base font-medium text-gray-300 hover:text-white px-3 py-2"
                >
                  Company
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {openDropdown === 'company-mobile' && (
                  <div className="pl-4">
                    {navigation.company.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Section */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleDropdown('resources-mobile')}
                  className="w-full flex items-center justify-between text-base font-medium text-gray-300 hover:text-white px-3 py-2"
                >
                  Resources
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {openDropdown === 'resources-mobile' && (
                  <div className="pl-4">
                    {navigation.resources.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Section */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleDropdown('legal-mobile')}
                  className="w-full flex items-center justify-between text-base font-medium text-gray-300 hover:text-white px-3 py-2"
                >
                  Legal
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {openDropdown === 'legal-mobile' && (
                  <div className="pl-4">
                    {navigation.legal.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 