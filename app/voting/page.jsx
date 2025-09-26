'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVotingRoute } from '../hooks/useRouteProtection';
import { useNetworkError } from '../hooks/useNetworkError';
import Navigation from '../components/Navigation';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';

export default function VotingPage() {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  
  const { user, hasVoted, loading: routeLoading, logout } = useVotingRoute();
  
  const { error, clearError, fetchJsonWithRetry } = useNetworkError();

  useEffect(() => {
    if (!routeLoading && user) {
      loadVotingOptions();
    }
  }, [routeLoading, user]);

  const loadVotingOptions = async () => {
    try {
      setLoading(true);
      clearError();
      
      const optionsData = await fetchJsonWithRetry('/api/voting/options', {
        retryOptions: {
          context: 'Loading voting options'
        }
      });

      if (optionsData.success) {
        setOptions(optionsData.options);
      } else {
        throw new Error(optionsData.error?.message || 'Failed to load voting options');
      }
    } catch (err) {
      console.error('Error loading voting options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    if (error) {
      clearError();
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedOption) {
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      const data = await fetchJsonWithRetry('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: selectedOption }),
        retryOptions: {
          context: 'Submitting vote'
        }
      });

      if (data.success) {
        router.push('/results');
      } else {
        throw new Error(data.error?.message || 'Failed to submit vote. Please try again.');
      }
    } catch (err) {
      console.error('Vote submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (routeLoading) {
    return (
      <LoadingState 
        message="Checking access..." 
        description="Verifying your voting permissions"
        background="gradient"
        className="from-green-50 to-blue-100"
      />
    );
  }

  if (loading) {
    return (
      <LoadingState 
        message="Loading voting options..." 
        description="Getting the available choices"
        background="gradient"
        className="from-green-50 to-blue-100"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <Navigation user={user} hasVoted={hasVoted} onLogout={logout} />
      
      <div className="relative px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl shadow-xl shadow-green-500/25 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Cast Your Vote
            </h1>
            {user && (
              <p className="text-xl text-gray-600 mb-2">
                Welcome, <span className="font-bold text-gray-900">{user.name}</span>!
              </p>
            )}
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Your voice matters. Select your preferred option below and make your choice count.
            </p>
          </div>

          {error && (
            <div className="mb-8 animate-slide-in-right">
              <ErrorMessage 
                error={error}
                onRetry={loadVotingOptions}
                onDismiss={clearError}
                className="mb-6"
              />
            </div>
          )}

          {!selectedOption && submitting && (
            <div className="mb-8 animate-slide-in-right">
              <ErrorMessage 
                error={{
                  message: 'Please select an option before voting.',
                  type: 'validation'
                }}
                variant="warning"
                showRetry={false}
                className="mb-6"
              />
            </div>
          )}

          <div className="card-premium rounded-3xl p-8 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Choose Your Option
              </h2>
            </div>
            
            <div className="space-y-4">
              {options.map((option, index) => (
                <label
                  key={option.id}
                  className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white/80 hover:shadow-md'
                  }`}
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="radio"
                        name="voting-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => handleOptionSelect(option.id)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        selectedOption === option.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === option.id && (
                          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 flex-1">
                      {option.optionName}
                    </span>
                    {selectedOption === option.id && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <span className="text-sm font-medium">Selected</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <button
              onClick={handleSubmitVote}
              disabled={!selectedOption || submitting}
              className={`btn-premium px-12 py-5 rounded-2xl font-bold text-xl text-white transition-all duration-300 ${
                !selectedOption || submitting
                  ? 'bg-gray-400 cursor-not-allowed transform-none shadow-none'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-2xl shadow-green-500/25'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Submitting Your Vote...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span>Submit Vote</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              )}
            </button>
            
            {selectedOption && !submitting && (
              <p className="mt-4 text-sm text-gray-500 animate-fade-in-up">
                Ready to submit? Your vote will be recorded securely and anonymously.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}