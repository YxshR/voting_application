import { getSessionFromRequest } from './session.js';

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

export function preventDuplicateVote(handler) {
  return async (req, res) => {
    try {
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

export function combineMiddleware(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}