'use client';

/**
 * Reusable loading spinner component with different sizes and messages
 */
export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '',
  showMessage = true,
  color = 'blue'
}) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  const spinnerClass = `animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={spinnerClass}></div>
      {showMessage && message && (
        <p className="mt-2 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
}