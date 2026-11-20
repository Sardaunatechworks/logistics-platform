import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recordCashCollection } from '@/features/payments/paystack-service';
import { isAdminRole } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    if (!isAdminRole(userRole)) {
      return NextResponse.json({ error: 'Only authorized operations administrators can record cash collection' }, { status: 403 });
    }

    const { delivery_id, amount_kobo, notes } = await request.json();

    if (!delivery_id || !amount_kobo) {
      return NextResponse.json({ error: 'delivery_id and amount_kobo are required' }, { status: 400 });
    }

    const result = await recordCashCollection({
      deliveryId: delivery_id,
      collectorId: user.id,
      amountKobo: parseInt(amount_kobo, 10),
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment: result.payment });
  } catch (err) {
    console.error('Cash collection error:', err);
    return NextResponse.json({ error: 'Internal server error recording cash collection' }, { status: 500 });
  }
}

