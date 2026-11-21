import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRole } from '@/lib/permissions';
import { getUserRole } from '@/lib/supabase/get-user-role';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRole = await getUserRole(supabase, user);
    if (!isAdminRole(userRole)) {
      return NextResponse.json({ error: 'Operations Admin access required' }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    const { data: payments, error } = await adminSupabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching admin payments:', error);
      return NextResponse.json({ error: 'Failed to query payments' }, { status: 500 });
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (err) {
    console.error('Admin payments API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
