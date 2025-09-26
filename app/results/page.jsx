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

  const { user, hasVoted, loading: routeLoading, logout } = useResultsRoute();

  const { error, clearError, fetchJsonWithRetry } = useNetworkError();

  const FALLBACK_REFRESH_INTERVAL = 5000;
  const WEBSOCKET_URL = `ws://localhost:8080/ws`;

  const isConnected = false;
  const isReconnecting = false;
  const reconnectAttempts = 0;
  const maxReconnectAttempts = 0;
  const wsError = null;
  const reconnectWs = () => {};

  useEffect(() => {
    if (!routeLoading && user) {
      loadResults();
      startFallbackRefresh();
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <Navigation user={user} hasVoted={hasVoted} onLogout={logout} />
      
      <div className="relative px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-xl shadow-purple-500/25 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
              Live Voting Results
            </h1>
            {user && (
              <p className="text-xl text-gray-600 mb-4">
                Welcome back, <span className="font-bold text-gray-900">{user.name}</span>!
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Auto-refresh (5s)
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loading ? 'Refreshing...' : 'Refresh Now'}</span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 animate-slide-in-right">
              <ErrorMessage 
                error={error}
                onRetry={loadResults}
                onDismiss={clearError}
                className="mb-6"
              />
            </div>
          )}

          {results && (
            <div className="card-premium rounded-3xl p-8 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      Current Results
                    </h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Total Votes</span>
                      <div className="text-2xl font-bold text-gray-900">{results.totalVotes}</div>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Options</span>
                      <div className="text-2xl font-bold text-gray-900">{results.options.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
                  <button
                    onClick={() => handleChartTypeChange('bar')}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      chartType === 'bar'
                        ? 'bg-white text-gray-900 shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Bar Chart</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('pie')}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      chartType === 'pie'
                        ? 'bg-white text-gray-900 shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <span>Pie Chart</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl">
                <VoteChart data={results} type={chartType} className="mb-6" />
              </div>

              <div className="overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200/50">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Option</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Votes</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {results.options.map((option, index) => (
                        <tr key={option.id} className="hover:bg-white/30 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                                index === 0 ? 'from-blue-500 to-blue-600' :
                                index === 1 ? 'from-green-500 to-green-600' :
                                index === 2 ? 'from-yellow-500 to-yellow-600' :
                                index === 3 ? 'from-red-500 to-red-600' :
                                index === 4 ? 'from-purple-500 to-purple-600' :
                                'from-gray-500 to-gray-600'
                              }`}></div>
                              <span className="text-lg font-semibold text-gray-900">{option.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xl font-bold text-gray-900">{option.count}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                              {option.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r transition-all duration-1000 ${
                                  index === 0 ? 'from-blue-500 to-blue-600' :
                                  index === 1 ? 'from-green-500 to-green-600' :
                                  index === 2 ? 'from-yellow-500 to-yellow-600' :
                                  index === 3 ? 'from-red-500 to-red-600' :
                                  index === 4 ? 'from-purple-500 to-purple-600' :
                                  'from-gray-500 to-gray-600'
                                }`}
                                style={{ width: `${option.percentage}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}