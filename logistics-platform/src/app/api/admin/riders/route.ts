import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRole } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Query riders joining profiles
    const { data: riders, error } = await adminSupabase
      .from('rider_profiles')
      .select(`
        id,
        user_id,
        vehicle_type,
        vehicle_registration,
        verification_status,
        availability_status,
        created_at,
        profile:profiles!rider_profiles_user_id_fkey(
          full_name,
          phone,
          email,
          account_status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching riders:', error);
      return NextResponse.json({ error: 'Failed to load riders list' }, { status: 500 });
    }

    const formatted = (riders || []).map((r: any) => ({
      id: r.user_id,
      rider_profile_id: r.id,
      name: r.profile?.full_name || 'Rider',
      phone: r.profile?.phone || 'N/A',
      email: r.profile?.email || 'N/A',
      vehicle: `${r.vehicle_type} (${r.vehicle_registration || 'Unregistered'})`,
      verification_status: r.verification_status,
      availability_status: r.availability_status,
      account_status: r.profile?.account_status || 'active',
    }));

    return NextResponse.json({ riders: formatted });
  } catch (err) {
    console.error('Riders list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

