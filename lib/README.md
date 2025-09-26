# Session Management Utilities

This directory contains utilities for managing user sessions in the voting application.

## Files

### `session.js`
Core session management functions:

- `generateSessionId()` - Generate secure random session IDs
- `createSession(name)` - Create new user session
- `validateSession(sessionId)` - Validate existing session
- `hasUserVoted(userId)` - Check if user has already voted
- `createSessionCookie(sessionId)` - Create secure session cookie
- `parseSessionCookie(cookieHeader)` - Parse session from cookie header
- `clearSessionCookie()` - Clear session cookie
- `getSessionFromRequest(req)` - Extract session data from request

### `middleware.js`
Authentication and authorization middleware:

- `requireAuth(handler)` - Require valid session for API routes
- `preventDuplicateVote(handler)` - Prevent users from voting multiple times
- `withSession(handler)` - Add optional session data to request
- `combineMiddleware(...middlewares)` - Combine multiple middleware functions

### `index.js`
Convenience exports for all session utilities.

## Usage Examples

### Basic Session Creation
```javascript
import { createSession, createSessionCookie } from './lib/session.js';

// In API route
const { user, sessionId } = await createSession('John Doe');
const cookie = createSessionCookie(sessionId);
res.setHeader('Set-Cookie', cookie);
```

### Protected API Route
```javascript
import { requireAuth } from './lib/middleware.js';

const handler = async (req, res) => {
  // req.session is available here
  const { user } = req.session;
  // ... handle request
};

export default requireAuth(handler);
```

### Prevent Duplicate Voting
```javascript
import { combineMiddleware, requireAuth, preventDuplicateVote } from './lib/middleware.js';

const voteHandler = async (req, res) => {
  // User is authenticated and hasn't voted yet
  // ... process vote
};

export default combineMiddleware(requireAuth, preventDuplicateVote)(voteHandler);
```

## Security Features

- Secure HTTP-only cookies
- CSRF protection via SameSite attribute
- Cryptographically secure session IDs
- Input validation and sanitization
- Graceful error handling
- Database error protection

## Testing

Run tests with:
```bash
npm test
```

All session management functions include comprehensive unit tests covering:
- Happy path scenarios
- Error conditions
- Edge cases
- Security validations