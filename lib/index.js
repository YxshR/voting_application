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

export {
  requireAuth,
  preventDuplicateVote,
  withSession,
  combineMiddleware
} from './middleware.js';