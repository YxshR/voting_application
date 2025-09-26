'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for route protection and user state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether the route requires authentication
 * @param {boolean} options.requireUnvoted - Whether the route requires user to not have voted
 * @param {boolean} options.requireVoted - Whether the route requires user to have voted
 * @param {string} options.redirectTo - Where to redirect if conditions aren't met
 * @returns {Object} User state and loading information
 */
export function useRouteProtection(options = {}) {
  const {
    requireAuth = false,
    requireUnvoted = false,
    requireVoted = false,
    redirectTo = '/login'
  } = options;

  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.valid) {
        setUser(data.user);
        setHasVoted(data.hasVoted);
        setSessionValid(true);

        // Check route protection rules
        if (requireUnvoted && data.hasVoted) {
          // User has voted but route requires unvoted user
          router.push('/results');
          return;
        }

        if (requireVoted && !data.hasVoted) {
          // User hasn't voted but route requires voted user
          router.push('/voting');
          return;
        }
      } else {
        setUser(null);
        setHasVoted(false);
        setSessionValid(false);

        // Redirect if authentication is required
        if (requireAuth) {
          router.push(redirectTo);
          return;
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
      setHasVoted(false);
      setSessionValid(false);

      if (requireAuth) {
        router.push(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = () => {
    setLoading(true);
    checkSession();
  };

  const logout = async () => {
    try {
      // Clear session on server side if we have a logout endpoint
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and redirect
      setUser(null);
      setHasVoted(false);
      setSessionValid(false);
      router.push('/login');
    }
  };

  return {
    user,
    hasVoted,
    loading,
    sessionValid,
    refreshSession,
    logout
  };
}

/**
 * Hook specifically for pages that require authentication
 */
export function useAuthenticatedRoute() {
  return useRouteProtection({ requireAuth: true });
}

/**
 * Hook for voting page - requires auth and user must not have voted
 */
export function useVotingRoute() {
  return useRouteProtection({ 
    requireAuth: true, 
    requireUnvoted: true 
  });
}

/**
 * Hook for results page - requires auth but allows both voted and unvoted users
 */
export function useResultsRoute() {
  return useRouteProtection({ requireAuth: true });
}

/**
 * Hook for login page - redirects if already authenticated
 */
export function useLoginRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSessionAndRedirect();
  }, []);

  const checkSessionAndRedirect = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.valid) {
        setUser(data.user);
        
        // Redirect based on voting status
        if (data.hasVoted) {
          router.push('/results');
        } else {
          router.push('/voting');
        }
        return;
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading };
}