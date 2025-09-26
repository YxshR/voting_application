import { NextResponse } from 'next/server';
import { createSession, createSessionCookie } from '../../../../lib/session.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_NAME',
            message: 'Name is required'
          }
        },
        { status: 400 }
      );
    }

    if (typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_NAME_TYPE',
            message: 'Name must be a string'
          }
        },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_NAME',
            message: 'Name cannot be empty'
          }
        },
        { status: 400 }
      );
    }

    if (trimmedName.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NAME_TOO_LONG',
            message: 'Name must be 20 characters or less'
          }
        },
        { status: 400 }
      );
    }

    const { user, sessionId } = await createSession(trimmedName);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          hasVoted: !!user.vote
        },
        sessionId
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'voting-session',
      value: sessionId,
      maxAge: 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);

    if (error.message.includes('Failed to create session')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_CREATION_FAILED',
            message: 'Failed to create user session'
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method not allowed for this endpoint'
      }
    },
    { status: 405 }
  );
}