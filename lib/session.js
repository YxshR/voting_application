import { PrismaClient } from '@prisma/client';
import { serialize, parse } from 'cookie';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Session configuration
const SESSION_CONFIG = {
  cookieName: 'voting-session',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

/**
 * Generate a secure random session ID
 * @returns {string} A unique session identifier
 */
export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 * @param {string} name - User's name
 * @returns {Promise<{user: Object, sessionId: string}>} User object and session ID
 */
export async function createSession(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Name is required and must be a non-empty string');
  }

  const sessionId = generateSessionId();
  const trimmedName = name.trim();

  try {
    // Check if user already exists with this name
    let user = await prisma.user.findFirst({
      where: { name: trimmedName }
    });

    if (user) {
      // Update existing user with new session
      user = await prisma.user.update({
        where: { id: user.id },
        data: { sessionId },
        include: { vote: true }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: trimmedName,
          sessionId
        },
        include: { vote: true }
      });
    }

    return { user, sessionId };
  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
}

/**
 * Validate a session and return user data
 * @param {string} sessionId - Session ID to validate
 * @returns {Promise<Object|null>} User object if valid, null if invalid
 */
export async function validateSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { vote: true }
    });

    return user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Check if a user has already voted
 * @param {number} userId - User ID to check
 * @returns {Promise<boolean>} True if user has voted, false otherwise
 */
export async function hasUserVoted(userId) {
  if (!userId || typeof userId !== 'number') {
    return false;
  }

  try {
    const vote = await prisma.vote.findUnique({
      where: { userId }
    });

    return !!vote;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

/**
 * Create a session cookie
 * @param {string} sessionId - Session ID to store in cookie
 * @returns {string} Serialized cookie string
 */
export function createSessionCookie(sessionId) {
  return serialize(SESSION_CONFIG.cookieName, sessionId, {
    maxAge: SESSION_CONFIG.maxAge,
    httpOnly: SESSION_CONFIG.httpOnly,
    secure: SESSION_CONFIG.secure,
    sameSite: SESSION_CONFIG.sameSite,
    path: SESSION_CONFIG.path
  });
}

/**
 * Parse session cookie from request headers
 * @param {string} cookieHeader - Cookie header string
 * @returns {string|null} Session ID if found, null otherwise
 */
export function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }

  try {
    const cookies = parse(cookieHeader);
    return cookies[SESSION_CONFIG.cookieName] || null;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

/**
 * Clear session cookie
 * @returns {string} Serialized cookie string that clears the session
 */
export function clearSessionCookie() {
  return serialize(SESSION_CONFIG.cookieName, '', {
    maxAge: 0,
    httpOnly: SESSION_CONFIG.httpOnly,
    secure: SESSION_CONFIG.secure,
    sameSite: SESSION_CONFIG.sameSite,
    path: SESSION_CONFIG.path
  });
}

/**
 * Get session data from request
 * @param {Object} req - Request object with headers
 * @returns {Promise<Object|null>} Session data if valid, null otherwise
 */
export async function getSessionFromRequest(req) {
  const sessionId = parseSessionCookie(req.headers.cookie);
  
  if (!sessionId) {
    return null;
  }

  const user = await validateSession(sessionId);
  
  if (!user) {
    return null;
  }

  const hasVoted = await hasUserVoted(user.id);

  return {
    user,
    sessionId,
    hasVoted
  };
}