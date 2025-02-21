import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

interface UseErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuthError?: boolean;
  onError?: (error: ErrorState) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleError = useCallback((error: unknown) => {
    let errorState: ErrorState;

    if (typeof error === 'string') {
      errorState = { message: error };
    } else if (error instanceof Error) {
      errorState = {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
      };
    } else if (typeof error === 'object' && error !== null) {
      errorState = {
        message: (error as any).message || 'An unexpected error occurred',
        code: (error as any).code,
        details: (error as any).details,
      };
    } else {
      errorState = { message: 'An unexpected error occurred' };
    }

    setError(errorState);

    // Handle authentication errors
    if (
      options.redirectOnAuthError &&
      (errorState.code === 'AUTHENTICATION_ERROR' || errorState.code === 'AUTHORIZATION_ERROR')
    ) {
      router.push('/register');
      return;
    }

    // Show toast notification if enabled
    if (options.showToast) {
      toast.error(errorState.message);
    }

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(errorState);
    }

    return errorState;
  }, [options, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const wrapAsync = useCallback(async <T,>(
    promise: Promise<T>,
    loadingState: boolean = true
  ): Promise<T | null> => {
    try {
      if (loadingState) setIsLoading(true);
      const result = await promise;
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      if (loadingState) setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    wrapAsync,
  };
} 