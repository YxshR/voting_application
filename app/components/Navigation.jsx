'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation({ user, hasVoted, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show navigation on login page
  if (pathname === '/login' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior - redirect to login
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
  const canAccessResults = user; // Anyone with a session can view results

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">VoteApp</h1>
            </div>
            <div className="hidden sm:block">
              <span className="text-gray-500">|</span>
              <span className="ml-4 text-lg font-medium text-gray-700">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {/* Navigation Links */}
            <div className="flex space-x-4">
              {canAccessVoting && (
                <button
                  onClick={() => handleNavigation('/voting')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/voting'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Vote
                </button>
              )}
              
              {canAccessResults && (
                <button
                  onClick={() => handleNavigation('/results')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/results'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Results
                </button>
              )}
            </div>

            {/* User Info and Status */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-600">Welcome, </span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                
                {/* Voting Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${hasVoted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {hasVoted ? 'Voted' : 'Not Voted'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Switch User
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {/* Page Title for Mobile */}
              <div className="px-3 py-2">
                <div className="text-lg font-medium text-gray-900">
                  {getPageTitle()}
                </div>
              </div>

              {/* Navigation Links */}
              {canAccessVoting && (
                <button
                  onClick={() => handleNavigation('/voting')}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === '/voting'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Vote
                </button>
              )}
              
              {canAccessResults && (
                <button
                  onClick={() => handleNavigation('/results')}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === '/results'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Results
                </button>
              )}

              {/* User Info */}
              {user && (
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Welcome, <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${hasVoted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs text-gray-500">
                      {hasVoted ? 'You have voted' : 'You have not voted yet'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Switch User
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