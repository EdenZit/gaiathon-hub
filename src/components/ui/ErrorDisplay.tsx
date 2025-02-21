'use client';

import { XCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: any;
  retry?: () => void;
  goBack?: boolean;
  className?: string;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  details,
  retry,
  goBack = true,
  className = '',
}: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
            {details && (
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            )}
          </div>
          <div className="mt-4">
            <div className="flex space-x-4">
              {retry && (
                <button
                  type="button"
                  onClick={retry}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Try again
                </button>
              )}
              {goBack && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Go back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 