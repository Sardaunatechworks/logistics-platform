import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Find deliveries created by this customer
    const { data: userDeliveries, error: deliveriesErr } = await admin
      .from('deliveries')
      .select('id, tracking_number, destination_address')
      .eq('customer_id', user.id);

    if (deliveriesErr) {
      return NextResponse.json({ error: deliveriesErr.message }, { status: 500 });
    }

    if (!userDeliveries || userDeliveries.length === 0) {
      return NextResponse.json({ payments: [] });
    }

    const deliveryIds = userDeliveries.map((d: any) => d.id);
    const trackingMap = new Map(userDeliveries.map((d: any) => [d.id, d.tracking_number]));

    const { data: payments, error: paymentsErr } = await admin
      .from('payments')
      .select('*')
      .in('delivery_id', deliveryIds)
      .order('created_at', { ascending: false });

    if (paymentsErr) {
      return NextResponse.json({ error: paymentsErr.message }, { status: 500 });
    }

    const paymentsWithTracking = (payments || []).map((p: any) => ({
      ...p,
      tracking_number: trackingMap.get(p.delivery_id) || 'N/A',
    }));

    return NextResponse.json({ payments: paymentsWithTracking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
