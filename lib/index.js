// Session management utilities
export {
  generateSessionId,
  createSession,
  validateSession,
  hasUserVoted,
  createSessionCookie,
  parseSessionCookie,
  clearSessionCookie,
  getSessionFromRequest
} from './session.js';

// Middleware utilities
export {
  requireAuth,
  preventDuplicateVote,
  withSession,
  combineMiddleware
} from './middleware.js';