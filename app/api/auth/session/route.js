import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession, hasUserVoted } from '../../../../lib/session.js';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('voting-session')?.value;

    console.log('Session check - Session ID from cookie:', sessionId);

    if (!sessionId) {
      console.log('No session ID found in cookie');
      return NextResponse.json(
        {
          valid: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'No valid session found'
          }
        },
        { status: 401 }
      );
    }

    const user = await validateSession(sessionId);
    
    if (!user) {
      console.log('Session validation failed for ID:', sessionId);
      return NextResponse.json(
        {
          valid: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'No valid session found'
          }
        },
        { status: 401 }
      );
    }

    const userHasVoted = await hasUserVoted(user.id);

    console.log('Session validated successfully for user:', user.name);

    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user.id,
          name: user.name
        },
        hasVoted: userHasVoted
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session validation API error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during session validation'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      valid: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'POST method not allowed for this endpoint'
      }
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      valid: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'PUT method not allowed for this endpoint'
      }
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      valid: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'DELETE method not allowed for this endpoint'
      }
    },
    { status: 405 }
  );
}