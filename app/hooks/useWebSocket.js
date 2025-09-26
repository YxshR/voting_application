'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection with automatic reconnection and exponential backoff
 */
export function useWebSocket(url, options = {}) {
  const {
    maxReconnectAttempts = 5,
    initialReconnectDelay = 1000,
    maxReconnectDelay = 30000,
    backoffFactor = 2,
    onMessage,
    onOpen,
    onClose,
    onError,
    onReconnectAttempt,
    onReconnectFailed,
    onReconnectSuccess,
    autoConnect = true
  } = options;

  const [connectionState, setConnectionState] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(initialReconnectDelay);
  const shouldReconnectRef = useRef(true);

  /**
   * Calculate next reconnection delay with exponential backoff
   */
  const getNextReconnectDelay = useCallback((attempt) => {
    const delay = Math.min(
      initialReconnectDelay * Math.pow(backoffFactor, attempt),
      maxReconnectDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }, [initialReconnectDelay, backoffFactor, maxReconnectDelay]);

  /**
   * Clear reconnection timeout
   */
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!url) return;

    try {
      setConnectionState('connecting');
      setLastError(null);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        setReconnectAttempts(0);
        reconnectDelayRef.current = initialReconnectDelay;
        
        onOpen?.(event);
        
        if (reconnectAttempts > 0) {
          onReconnectSuccess?.(reconnectAttempts);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data, event);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError?.(error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionState('disconnected');
        wsRef.current = null;
        
        onClose?.(event);
        
        // Attempt reconnection if it wasn't a clean close and we should reconnect
        if (shouldReconnectRef.current && event.code !== 1000) {
          scheduleReconnect();
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        const error = new Error('WebSocket connection error');
        setLastError(error);
        onError?.(error, event);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionState('error');
      setLastError(error);
      onError?.(error);
      
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
    }
  }, [url, onOpen, onMessage, onClose, onError, onReconnectSuccess, reconnectAttempts, initialReconnectDelay]);

  /**
   * Schedule reconnection attempt
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionState('failed');
      onReconnectFailed?.(reconnectAttempts);
      return;
    }

    const delay = getNextReconnectDelay(reconnectAttempts);
    console.log(`Scheduling reconnection attempt ${reconnectAttempts + 1} in ${Math.round(delay)}ms`);
    
    setConnectionState('reconnecting');
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      onReconnectAttempt?.(reconnectAttempts + 1, maxReconnectAttempts);
      connect();
    }, delay);
  }, [reconnectAttempts, maxReconnectAttempts, getNextReconnectDelay, onReconnectFailed, onReconnectAttempt, connect]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearReconnectTimeout();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setConnectionState('disconnected');
    setReconnectAttempts(0);
    reconnectDelayRef.current = initialReconnectDelay;
  }, [clearReconnectTimeout, initialReconnectDelay]);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    setReconnectAttempts(0);
    reconnectDelayRef.current = initialReconnectDelay;
    setTimeout(connect, 100); // Small delay to ensure clean disconnect
  }, [disconnect, connect, initialReconnectDelay]);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        wsRef.current.send(message);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setLastError(error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  /**
   * Get current connection status
   */
  const getConnectionStatus = useCallback(() => {
    return {
      state: connectionState,
      isConnected: connectionState === 'connected',
      isConnecting: connectionState === 'connecting',
      isReconnecting: connectionState === 'reconnecting',
      isFailed: connectionState === 'failed',
      reconnectAttempts,
      maxReconnectAttempts,
      lastError
    };
  }, [connectionState, reconnectAttempts, maxReconnectAttempts, lastError]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && url) {
      shouldReconnectRef.current = true;
      connect();
    }

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, [url, autoConnect, connect, clearReconnectTimeout]);

  return {
    connect,
    disconnect,
    reconnect,
    sendMessage,
    getConnectionStatus,
    ...getConnectionStatus()
  };
}