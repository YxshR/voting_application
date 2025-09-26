import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to logout',
          code: 'LOGOUT_ERROR'
        } 
      },
      { status: 500 }
    );
  }
}