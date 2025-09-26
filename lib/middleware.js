import { getSessionFromRequest } from './session.js';

/**
 * Middleware to require authentication
 * Returns 401 if no valid session is found
 * @param {Function} handler - The API route handler
 * @returns {Function} Wrapped handler with authentication
 */
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const sessionData = await getSessionFromRequest(req);
      
      if (!sessionData || !sessionData.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Valid session required'
          }
        });
      }

      // Attach session data to request for use in handler
      req.session = sessionData;
      
      return handler(req, res);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed'
        }
      });
    }
  };
}

/**
 * Middleware to prevent duplicate voting
 * Returns 403 if user has already voted
 * @param {Function} handler - The API route handler
 * @returns {Function} Wrapped handler with vote prevention
 */
export function preventDuplicateVote(handler) {
  return async (req, res) => {
    try {
      // This middleware should be used after requireAuth
      if (!req.session) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      if (req.session.hasVoted) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ALREADY_VOTED',
            message: 'User has already voted in this session'
          }
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error('Duplicate vote prevention middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Vote validation failed'
        }
      });
    }
  };
}

/**
 * Middleware to add session data to request (optional authentication)
 * Does not return error if no session, just adds null session data
 * @param {Function} handler - The API route handler
 * @returns {Function} Wrapped handler with optional session data
 */
export function withSession(handler) {
  return async (req, res) => {
    try {
      const sessionData = await getSessionFromRequest(req);
      req.session = sessionData;
      
      return handler(req, res);
    } catch (error) {
      console.error('Session middleware error:', error);
      req.session = null;
      
      return handler(req, res);
    }
  };
}

/**
 * Combine multiple middleware functions
 * @param {...Function} middlewares - Middleware functions to combine
 * @returns {Function} Combined middleware function
 */
export function combineMiddleware(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}