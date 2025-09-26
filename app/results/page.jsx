'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResultsRoute } from '../hooks/useRouteProtection';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNetworkError } from '../hooks/useNetworkError';
import Navigation from '../components/Navigation';
import VoteChart from '../components/VoteChart.jsx';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  
  const fallbackIntervalRef = useRef(null);
  const router = useRouter();

  // Use route protection hook
  const { user, hasVoted, loading: routeLoading, logout } = useResultsRoute();

  // Use network error handling
  const { error, clearError, fetchJsonWithRetry } = useNetworkError();

  const FALLBACK_REFRESH_INTERVAL = 5000; // 5 seconds
  const WEBSOCKET_URL = `ws://localhost:8080/ws`;

  // WebSocket connection with automatic reconnection
  const {
    isConnected,
    isReconnecting,
    reconnectAttempts,
    maxReconnectAttempts,
    lastError: wsError,
    reconnect: reconnectWs
  } = useWebSocket(WEBSOCKET_URL, {
    maxReconnectAttempts: 5,
    onMessage: (data) => {
      if (data.type === 'vote-update') {
        setResults(data.data);
      }
    },
    onOpen: () => {
      console.log('WebSocket connected successfully');
      // Clear fallback interval since WebSocket is working
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    },
    onClose: () => {
      console.log('WebSocket disconnected');
      startFallbackRefresh();
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      startFallbackRefresh();
    },
    onReconnectAttempt: (attempt, max) => {
      console.log(`WebSocket reconnection attempt ${attempt}/${max}`);
    },
    onReconnectFailed: () => {
      console.log('WebSocket reconnection failed, using fallback polling');
      startFallbackRefresh();
    },
    onReconnectSuccess: (attempts) => {
      console.log(`WebSocket reconnected after ${attempts} attempts`);
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    }
  });

  // Load initial results when route protection is complete
  useEffect(() => {
    if (!routeLoading && user) {
      loadResults();
    }
    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [routeLoading, user]);



  const loadResults = async () => {
    try {
      setLoading(true);
      clearError();
      
      const data = await fetchJsonWithRetry('/api/voting/results', {
        retryOptions: {
          context: 'Loading voting results'
        }
      });

      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error(data.error?.message || 'Failed to load voting results');
      }
    } catch (err) {
      console.error('Error loading results:', err);
      // Error is handled by useNetworkError hook
    } finally {
      setLoading(false);
    }
  };



  const startFallbackRefresh = () => {
    if (!fallbackIntervalRef.current) {
      console.log('Starting fallback auto-refresh');
      fallbackIntervalRef.current = setInterval(() => {
        loadResults();
      }, FALLBACK_REFRESH_INTERVAL);
    }
  };

  const handleRefresh = () => {
    loadResults();
  };

  const handleRetryConnection = () => {
    clearError();
    reconnectWs();
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  if (routeLoading) {
    return (
      <LoadingState 
        message="Checking access..." 
        background="gradient"
        className="from-purple-50 to-blue-100"
      />
    );
  }

  if (loading && !results) {
    return (
      <LoadingState 
        message="Loading results..." 
        description="Getting the latest voting data"
        background="gradient"
        className="from-purple-50 to-blue-100"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Navigation user={user} hasVoted={hasVoted} onLogout={logout} />
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Live Voting Results
          </h1>
          {user && (
            <p className="text-gray-600 text-lg">
              Welcome back, <span className="font-semibold">{user.name}</span>!
            </p>
          )}
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 
                isReconnecting ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live Updates' : 
                 isReconnecting ? `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})` :
                 'Auto-refresh (5s)'}
              </span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            error={error}
            onRetry={loadResults}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        {/* WebSocket Connection Issues */}
        {wsError && !isConnected && (
          <ErrorMessage 
            error={{
              message: 'Real-time updates are currently unavailable. Using auto-refresh instead.',
              type: 'warning'
            }}
            variant="warning"
            onRetry={handleRetryConnection}
            className="mb-6"
          />
        )}

        {/* Results Summary */}
        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Current Results
                </h2>
                <p className="text-gray-600">
                  Total votes: <span className="font-semibold">{results.totalVotes}</span>
                </p>
              </div>
              
              {/* Chart Type Toggle */}
              <div className="mt-4 sm:mt-0">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleChartTypeChange('bar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'bar'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('pie')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'pie'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pie Chart
                  </button>
                </div>
              </div>
            </div>

            {/* Vote Chart */}
            <VoteChart data={results} type={chartType} className="mb-6" />

            {/* Detailed Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-gray-600 font-medium">Option</th>
                    <th className="pb-3 text-gray-600 font-medium text-right">Votes</th>
                    <th className="pb-3 text-gray-600 font-medium text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.options.map((option) => (
                    <tr key={option.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 font-medium text-gray-900">{option.name}</td>
                      <td className="py-3 text-right text-gray-700">{option.count}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {option.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {results && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}