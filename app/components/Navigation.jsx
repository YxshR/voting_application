'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation({ user, hasVoted, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === '/login' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/voting':
        return 'Cast Your Vote';
      case '/results':
        return 'Live Results';
      default:
        return 'VoteApp';
    }
  };

  const canAccessVoting = user && !hasVoted;
  const canAccessResults = user;

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  VoteApp
                </h1>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-semibold text-gray-700">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <div className="flex space-x-2">
              {canAccessVoting && (
                <button
                  onClick={() => handleNavigation('/voting')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${pathname === '/voting'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Vote</span>
                  </div>
                </button>
              )}

              {canAccessResults && (
                <button
                  onClick={() => handleNavigation('/results')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${pathname === '/results'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Results</span>
                  </div>
                </button>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="text-gray-500">Welcome back, </span>
                  <span className="font-semibold text-gray-900">{user.name}</span>
                </div>

                <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 rounded-full backdrop-blur-sm">
                  <div className={`w-3 h-3 rounded-full ${hasVoted ? 'bg-green-500 animate-pulse-glow' : 'bg-amber-500 animate-pulse'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {hasVoted ? 'Voted ✓' : 'Pending'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-200`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-200`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden animate-fade-in-up">
            <div className="px-4 pt-4 pb-6 space-y-4 bg-white/80 backdrop-blur-sm border-t border-white/20 rounded-b-2xl">
              <div className="px-4 py-3">
                <div className="text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </div>
              </div>

              <div className="space-y-2">
                {canAccessVoting && (
                  <button
                    onClick={() => handleNavigation('/voting')}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${pathname === '/voting'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Vote</span>
                    </div>
                  </button>
                )}

                {canAccessResults && (
                  <button
                    onClick={() => handleNavigation('/results')}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${pathname === '/results'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Results</span>
                    </div>
                  </button>
                )}
              </div>

              {user && (
                <div className="px-4 py-4 border-t border-white/20 mt-4">
                  <div className="text-sm text-gray-600 mb-3">
                    Welcome back, <span className="font-semibold text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-4 px-3 py-2 bg-white/60 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${hasVoted ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {hasVoted ? 'You have voted ✓' : 'Vote pending'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}