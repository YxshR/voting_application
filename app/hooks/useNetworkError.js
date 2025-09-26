'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for handling network errors with retry mechanisms
 */
export function useNetworkError() {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * Set error with user-friendly message
   */
  const setNetworkError = useCallback((err, context = '') => {
    let errorMessage = 'An unexpected error occurred';
    let errorType = 'unknown';

    if (err instanceof TypeError && err.message.includes('fetch')) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      errorType = 'network';
    } else if (err.name === 'AbortError') {
      errorMessage = 'Request was cancelled due to timeout.';
      errorType = 'timeout';
    } else if (err.status) {
      switch (err.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input and try again.';
          errorType = 'validation';
          break;
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          errorType = 'auth';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          errorType = 'permission';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          errorType = 'notfound';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          errorType = 'ratelimit';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server error. Please try again in a few moments.';
          errorType = 'server';
          break;
        default:
          errorMessage = `Request failed with status ${err.status}`;
          errorType = 'http';
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    setError({
      message: errorMessage,
      type: errorType,
      originalError: err,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Execute a network request with automatic retry logic
   */
  const executeWithRetry = useCallback(async (requestFn, options = {}) => {
    const {
      maxRetries = MAX_RETRIES,
      retryDelays = RETRY_DELAYS,
      context = '',
      shouldRetry = (error, attempt) => {
        // Don't retry client errors (4xx) except 408, 429
        if (error.status >= 400 && error.status < 500) {
          return error.status === 408 || error.status === 429;
        }
        // Retry network errors and server errors
        return attempt < maxRetries;
      }
    } = options;

    let lastError = null;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        
        const result = await requestFn();
        
        // Success - clear error state
        clearError();
        setIsRetrying(false);
        
        return result;
      } catch (err) {
        lastError = err;
        attempt++;

        // Check if we should retry
        if (attempt <= maxRetries && shouldRetry(err, attempt)) {
          const delay = retryDelays[attempt - 1] || retryDelays[retryDelays.length - 1];
          
          console.log(`Request failed (attempt ${attempt}), retrying in ${delay}ms...`, err);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    // All retries failed
    setIsRetrying(false);
    setNetworkError(lastError, context);
    throw lastError;
  }, [clearError, setNetworkError]);

  /**
   * Enhanced fetch with retry logic and timeout
   */
  const fetchWithRetry = useCallback(async (url, options = {}) => {
    const {
      timeout = 10000,
      retryOptions = {},
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestFn = async () => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }

        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    return executeWithRetry(requestFn, {
      context: `Request to ${url}`,
      ...retryOptions
    });
  }, [executeWithRetry]);

  /**
   * Enhanced fetch that returns JSON with error handling
   */
  const fetchJsonWithRetry = useCallback(async (url, options = {}) => {
    const response = await fetchWithRetry(url, options);
    
    try {
      const data = await response.json();
      return data;
    } catch (err) {
      const parseError = new Error('Failed to parse server response');
      parseError.originalError = err;
      setNetworkError(parseError, 'Parsing response');
      throw parseError;
    }
  }, [fetchWithRetry, setNetworkError]);

  return {
    error,
    isRetrying,
    retryCount,
    clearError,
    setNetworkError,
    executeWithRetry,
    fetchWithRetry,
    fetchJsonWithRetry
  };
}