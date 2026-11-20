import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/utils';
import type { UserRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, phone, password, account_type, vehicle_type, vehicle_registration } = body;

    if (!full_name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required registration fields (name, email, phone, and password).' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Role enforcement: Never allow privileged roles on public signup
    const assignedRole: UserRole = account_type === 'rider' ? 'rider' : 'customer';
    const normalizedPhone = normalizePhone(phone);

    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminClient();

    let userId: string | null = null;

    // 1. Attempt user creation via admin API (auto-confirms email and avoids SMTP rate limit blocks)
    const { data: adminUserData, error: adminCreateError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone: normalizedPhone,
        role: assignedRole,
      },
    });

    if (adminCreateError) {
      const errMsg = adminCreateError.message.toLowerCase();
      console.warn('Admin user creation warning:', adminCreateError.message);

      // Handle duplicate user registration cleanly
      if (errMsg.includes('already') || errMsg.includes('exists')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 400 }
        );
      }

      // Fall back to standard client signup if admin creation failed for any configuration reason
      const { data: clientAuthData, error: clientAuthError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone: normalizedPhone,
            role: assignedRole,
          },
        },
      });

      if (clientAuthError || !clientAuthData.user) {
        console.error('Client signup fallback error:', clientAuthError);
        return NextResponse.json(
          { error: clientAuthError?.message || adminCreateError.message || 'Failed to create user account' },
          { status: 400 }
        );
      }

      userId = clientAuthData.user.id;
    } else if (adminUserData.user) {
      userId = adminUserData.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to obtain user identifier during registration.' },
        { status: 400 }
      );
    }

    // 2. Automatically establish authenticated session cookies for seamless onboarding
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.warn('Post-registration automatic sign-in note:', signInError.message);
    }

    // 3. Ensure Profile record is updated/inserted in public.profiles
    const { error: profileUpsertError } = await adminSupabase.from('profiles').upsert({
      id: userId,
      full_name,
      email,
      phone: normalizedPhone,
      role: assignedRole,
      account_status: 'active',
      updated_at: new Date().toISOString(),
    });

    if (profileUpsertError) {
      console.error('Profile upsert notice:', profileUpsertError.message);
    }

    // 4. If Rider, create rider_profiles record
    if (assignedRole === 'rider') {
      const { error: riderProfileError } = await adminSupabase.from('rider_profiles').upsert({
        user_id: userId,
        vehicle_type: vehicle_type || 'Motorcycle',
        vehicle_registration: vehicle_registration || null,
        verification_status: 'pending',
        availability_status: 'unavailable',
        updated_at: new Date().toISOString(),
      });

      if (riderProfileError) {
        console.error('Rider profile upsert notice:', riderProfileError.message);
      }
    }

    const redirectUrl = assignedRole === 'rider' ? '/rider' : '/customer';

    return NextResponse.json({
      success: true,
      userId,
      role: assignedRole,
      redirectUrl,
    });
  } catch (err: any) {
    console.error('Registration handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing registration' },
      { status: 500 }
    );
  }
}
