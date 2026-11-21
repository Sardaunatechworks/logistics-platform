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
    let userRole: UserRole | null = null;
    let accountStatus: AccountStatus = 'active';

    // 2. Fetch user profile - Try user's authenticated client first (RLS permits reading own profile)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, account_status')
      .eq('id', userId)
      .maybeSingle();

    if (userProfile) {
      userRole = userProfile.role as UserRole;
      accountStatus = userProfile.account_status as AccountStatus;
    } else {
      // Fallback: Try admin client
      try {
        const adminSupabase = createAdminClient();
        const { data: adminProfile } = await adminSupabase
          .from('profiles')
          .select('role, account_status')
          .eq('id', userId)
          .maybeSingle();
        if (adminProfile) {
          userRole = adminProfile.role as UserRole;
          accountStatus = adminProfile.account_status as AccountStatus;
        }
      } catch (adminErr) {
        console.warn('Admin client fallback note:', adminErr);
      }
    }

    // Fallback to user_metadata or default
    const finalRole: UserRole = userRole || (authData.user.user_metadata?.role as UserRole) || 'customer';

    // 3. FR-AUTH-06: Suspended or disabled accounts must not access protected workflows
    if (accountStatus === ('suspended' as AccountStatus) || accountStatus === ('disabled' as AccountStatus)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Your account is suspended or disabled. Please contact operations support.' },
        { status: 403 }
      );
    }

    // Sync role to user_metadata if missing so future token checks have it
    if (authData.user.user_metadata?.role !== finalRole) {
      await supabase.auth.updateUser({
        data: { role: finalRole },
      });
    }

    const redirectUrl = getDashboardRoute(finalRole);

    return NextResponse.json({
      success: true,
      role: finalRole,
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
