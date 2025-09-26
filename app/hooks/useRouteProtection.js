'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

        if (requireUnvoted && data.hasVoted) {
          router.push('/results');
          return;
        }

        if (requireVoted && !data.hasVoted) {
          router.push('/voting');
          return;
        }
      } else {
        setUser(null);
        setHasVoted(false);
        setSessionValid(false);

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
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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

export function useAuthenticatedRoute() {
  return useRouteProtection({ requireAuth: true });
}

export function useVotingRoute() {
  return useRouteProtection({ 
    requireAuth: true, 
    requireUnvoted: true 
  });
}

export function useResultsRoute() {
  return useRouteProtection({ requireAuth: true });
}

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