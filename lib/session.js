import { PrismaClient } from '@prisma/client';
import { serialize, parse } from 'cookie';
import crypto from 'crypto';

const prisma = new PrismaClient();

const SESSION_CONFIG = {
  cookieName: 'voting-session',
  maxAge: 24 * 60 * 60,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Name is required and must be a non-empty string');
  }

  const sessionId = generateSessionId();
  const trimmedName = name.trim();

  try {
    let user = await prisma.user.findFirst({
      where: { name: trimmedName }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { sessionId },
        include: { vote: true }
      });
    } else {
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

export function createSessionCookie(sessionId) {
  return serialize(SESSION_CONFIG.cookieName, sessionId, {
    maxAge: SESSION_CONFIG.maxAge,
    httpOnly: SESSION_CONFIG.httpOnly,
    secure: SESSION_CONFIG.secure,
    sameSite: SESSION_CONFIG.sameSite,
    path: SESSION_CONFIG.path
  });
}

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

export function clearSessionCookie() {
  return serialize(SESSION_CONFIG.cookieName, '', {
    maxAge: 0,
    httpOnly: SESSION_CONFIG.httpOnly,
    secure: SESSION_CONFIG.secure,
    sameSite: SESSION_CONFIG.sameSite,
    path: SESSION_CONFIG.path
  });
}

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