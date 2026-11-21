import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const origin = request.nextUrl.origin || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
      console.warn('Password reset request error:', error.message);
      // If rate limited, notify user cleanly
      if (error.message.toLowerCase().includes('rate limit')) {
        return NextResponse.json(
          { error: 'Password reset request limit reached. Please wait a few minutes before trying again.' },
          { status: 429 }
        );
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account is associated with this email, a password reset link has been dispatched.',
    });
  } catch (err: any) {
    console.error('Forgot password handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
