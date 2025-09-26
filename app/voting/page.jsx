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
  
  // Use route protection hook
  const { user, hasVoted, loading: routeLoading, logout } = useVotingRoute();
  
  // Use network error handling
  const { error, clearError, fetchJsonWithRetry } = useNetworkError();

  // Load voting options when route protection is complete
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
      // Error is handled by useNetworkError hook
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    // Clear any previous errors
    if (error) {
      clearError();
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedOption) {
      // This is a validation error, not a network error
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
        // Vote submitted successfully, redirect to results
        router.push('/results');
      } else {
        // Handle API errors
        throw new Error(data.error?.message || 'Failed to submit vote. Please try again.');
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      // Error is handled by useNetworkError hook
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <Navigation user={user} hasVoted={hasVoted} onLogout={logout} />
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cast Your Vote
          </h1>
          {user && (
            <p className="text-gray-600 text-lg">
              Welcome, <span className="font-semibold">{user.name}</span>!
            </p>
          )}
          <p className="text-gray-500 mt-2">
            Select one option below and submit your vote
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            error={error}
            onRetry={loadVotingOptions}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        {/* Validation Error for No Selection */}
        {!selectedOption && submitting && (
          <ErrorMessage 
            error={{
              message: 'Please select an option before voting.',
              type: 'validation'
            }}
            variant="warning"
            showRetry={false}
            className="mb-6"
          />
        )}

        {/* Voting Options */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Choose Your Option
          </h2>
          
          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option.id}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition duration-200 ${
                  selectedOption === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="voting-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => handleOptionSelect(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-900">
                    {option.optionName}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmitVote}
            disabled={!selectedOption || submitting}
            className={`px-8 py-4 rounded-lg font-semibold text-white text-lg transition duration-200 ${
              !selectedOption || submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting Vote...
              </div>
            ) : (
              'Submit Vote'
            )}
          </button>
        </div>

        </div>
      </div>
    </div>
  );
}