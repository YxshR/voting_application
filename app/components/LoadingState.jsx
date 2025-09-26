'use client';

import LoadingSpinner from './LoadingSpinner';

/**
 * Full-page loading state component
 */
export default function LoadingState({ 
  message = 'Loading...', 
  description,
  className = '',
  background = 'gradient'
}) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    white: 'bg-white',
    gray: 'bg-gray-50'
  };

  return (
    <div className={`min-h-screen ${backgroundClasses[background]} flex items-center justify-center px-4 ${className}`}>
      <div className="text-center max-w-md">
        <LoadingSpinner size="large" showMessage={false} />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {message}
        </h2>
        {description && (
          <p className="mt-2 text-gray-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}