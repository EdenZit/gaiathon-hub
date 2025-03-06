import Link from 'next/link';
import SignOutButton from '@/components/auth/SignOutButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AccountDeletedPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <SignOutButton />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Unavailable
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            We're sorry, but your account cannot be accessed
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg border border-gray-200">
          <div className="space-y-6">
            <p className="text-gray-700 font-medium">
              Your account is no longer available. This may be because:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-left space-y-2">
              <li>Your account has been deleted by an administrator</li>
              <li>There was a system error with your account</li>
            </ul>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 font-medium">
                For assistance, please contact:
              </p>
              <p className="text-blue-600 font-medium mt-2">
                <a href="mailto:info@edenwayfoundation.com" className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@edenwayfoundation.com
                </a>
              </p>
            </div>
            <div className="pt-6">
              <Link 
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-colors duration-200"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 