'use client';

/**
 * Reusable error message component with different styles and actions
 */
export default function ErrorMessage({ 
  error, 
  onRetry, 
  onDismiss,
  className = '',
  variant = 'default',
  showRetry = true,
  showDismiss = true
}) {
  if (!error) return null;

  const variantClasses = {
    default: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconVariants = {
    default: (
      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  const errorType = error?.type || 'unknown';

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {iconVariants[variant]}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                {getErrorTitle(errorType)}
              </h3>
              <p className="mt-1 text-sm">
                {errorMessage}
              </p>
              
              {/* Additional error details in development */}
              {process.env.NODE_ENV === 'development' && error?.originalError && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer opacity-75">
                    Technical Details
                  </summary>
                  <pre className="text-xs mt-1 opacity-75 whitespace-pre-wrap">
                    {error.originalError.toString()}
                  </pre>
                </details>
              )}
            </div>
            
            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Action buttons */}
          {(showRetry && onRetry) && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm font-medium underline hover:no-underline transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get user-friendly error title based on error type
 */
function getErrorTitle(errorType) {
  switch (errorType) {
    case 'network':
      return 'Connection Error';
    case 'timeout':
      return 'Request Timeout';
    case 'validation':
      return 'Invalid Input';
    case 'auth':
      return 'Authentication Required';
    case 'permission':
      return 'Access Denied';
    case 'notfound':
      return 'Not Found';
    case 'ratelimit':
      return 'Too Many Requests';
    case 'server':
      return 'Server Error';
    default:
      return 'Error';
  }
}