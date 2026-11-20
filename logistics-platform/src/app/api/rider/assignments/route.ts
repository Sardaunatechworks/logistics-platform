import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Query assignments for current rider with delivery join
    const { data: assignments, error } = await adminSupabase
      .from('delivery_assignments')
      .select(`
        id,
        assignment_status,
        delivery:deliveries!inner(*)
      `)
      .eq('rider_id', user.id)
      .in('assignment_status', ['offered', 'accepted'])
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching rider assignments:', error);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    const offered = (assignments || []).filter((a: any) => a.assignment_status === 'offered');
    const active = (assignments || []).filter(
      (a: any) =>
        a.assignment_status === 'accepted' &&
        a.delivery.delivery_status !== 'delivered' &&
        a.delivery.delivery_status !== 'failed' &&
        a.delivery.delivery_status !== 'cancelled'
    );

    return NextResponse.json({
      offered,
      active,
    });
  } catch (err) {
    console.error('Rider assignments API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

