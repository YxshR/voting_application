'use client';

import LoadingSpinner from './LoadingSpinner';

export default function LoadingState({ 
  message = 'Loading...', 
  description,
  className = '',
  background = 'gradient'
}) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100',
    white: 'bg-white',
    gray: 'bg-gray-50'
  };

  return (
    <div className={`min-h-screen ${backgroundClasses[background]} flex items-center justify-center px-4 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative text-center max-w-md animate-fade-in-up">
        <div className="card-premium rounded-3xl p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse opacity-75"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            {message}
          </h2>
          {description && (
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}