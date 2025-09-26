'use client';

import { ReactNode, useState, useEffect } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const ErrorBoundary = ({ children, fallback }: Props) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleOnError = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
      setError(event.error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setHasError(true);
      setError(event.reason);
    };

    window.addEventListener('error', handleOnError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleOnError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return fallback || (
      <div className="p-8 bg-red-50 text-red-700">
        <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
        <p className="mb-2">{error?.message}</p>
        <pre className="bg-white p-4 rounded overflow-x-auto text-sm">
          {error?.stack}
        </pre>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
