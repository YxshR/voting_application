'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginRoute } from '../hooks/useRouteProtection';
import { useNetworkError } from '../hooks/useNetworkError';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loading: routeLoading } = useLoginRoute();
  const { error, clearError, fetchJsonWithRetry } = useNetworkError();

  const handleNameChange = (e) => {
    setName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateName = (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return 'Name is required';
    }

    if (trimmedName.length > 20) {
      return 'Name must be 20 characters or less';
    }

    return null;
  };

  // Show loading while checking existing session
  if (routeLoading) {
    return (
      <LoadingState
        message="Checking session..."
        description="Verifying your current login status"
        background="gradient"
        className="from-blue-50 to-indigo-100"
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateName(name);
    if (validationError) {
      // For validation errors, we'll show them inline
      return;
    }

    setLoading(true);
    clearError();

    try {
      const data = await fetchJsonWithRetry('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
        retryOptions: {
          context: 'Logging in'
        }
      });

      if (data.success) {
        // Successful login - redirect to voting page
        router.push('/voting');
      } else {
        // Handle API errors
        throw new Error(data.error?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by useNetworkError hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to VoteApp
          </h1>
          <p className="text-gray-600">
            Enter your name to start voting
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => { } })}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${validateName(name) ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={loading}
              maxLength={20}
              autoComplete="name"
              autoFocus
            />
            {validateName(name) && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {validateName(name)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${loading || !name.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Start Voting'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>No account needed - just enter your name to participate</p>
        </div>
      </div>
    </div>
  );
}