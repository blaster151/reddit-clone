'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">
          <AlertTriangle className="w-16 h-16 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h1>
        
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. We've been notified and are working to fix it.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details (Development)</h3>
            <div className="text-xs text-red-700 font-mono break-all">
              <div className="mb-1">
                <strong>Message:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="mb-1">
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <Link href="/contact" className="text-orange-500 hover:text-orange-600 underline">
              contact support
            </Link>
            {error.digest && (
              <span> and reference error code: <code className="bg-gray-100 px-1 rounded">{error.digest}</code></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
} 