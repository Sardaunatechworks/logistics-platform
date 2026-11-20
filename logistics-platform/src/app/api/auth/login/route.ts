import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDashboardRoute } from '@/lib/permissions';
import type { UserRole, AccountStatus } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const adminSupabase = createAdminClient();

    // 2. Fetch user profile
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role, account_status')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      // Fallback role
      return NextResponse.json({
        success: true,
        redirectUrl: '/customer',
      });
    }

    // 3. FR-AUTH-06: Suspended or disabled accounts must not access protected workflows
    if (profile.account_status === ('suspended' as AccountStatus) || profile.account_status === ('disabled' as AccountStatus)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Your account is suspended or disabled. Please contact operations support.' },
        { status: 403 }
      );
    }

    const role = profile.role as UserRole;
    const redirectUrl = getDashboardRoute(role);

    return NextResponse.json({
      success: true,
      role,
      redirectUrl,
    });
  } catch (err) {
    console.error('Login handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing login' },
      { status: 500 }
    );
  }
}

