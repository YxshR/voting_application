import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '../../../../lib/session.js';

/**
 * GET /api/auth/session
 * Validate current session and return user data
 */
export async function GET(request) {
  try {
    // Get session data from request
    const sessionData = await getSessionFromRequest(request);

    if (!sessionData) {
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

    const { user, hasVoted } = sessionData;

    // Return session validation success
    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user.id,
          name: user.name
        },
        hasVoted
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session validation API error:', error);

    // Generic server error
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

// Handle unsupported methods
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