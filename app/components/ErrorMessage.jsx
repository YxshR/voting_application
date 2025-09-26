'use client';

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
    default: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50 text-red-700',
    warning: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/50 text-yellow-700',
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 text-blue-700'
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
    <div className={`border-2 rounded-2xl p-6 backdrop-blur-sm ${variantClasses[variant]} ${className} animate-slide-in-right`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
            {iconVariants[variant]}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {getErrorTitle(errorType)}
              </h3>
              <p className="mt-2 text-base font-medium">
                {errorMessage}
              </p>
              
              {process.env.NODE_ENV === 'development' && error?.originalError && (
                <details className="mt-3">
                  <summary className="text-sm cursor-pointer opacity-75 font-medium hover:opacity-100 transition-opacity">
                    Technical Details
                  </summary>
                  <pre className="text-xs mt-2 opacity-75 whitespace-pre-wrap bg-white/30 p-3 rounded-lg">
                    {error.originalError.toString()}
                  </pre>
                </details>
              )}
            </div>
            
            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/30 rounded-lg transition-all duration-200"
                aria-label="Dismiss error"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {(showRetry && onRetry) && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-white/50 hover:bg-white/70 rounded-lg text-sm font-bold transition-all duration-200 hover:transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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