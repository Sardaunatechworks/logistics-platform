import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { initializeOnlinePayment } from '@/features/payments/paystack-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { delivery_id, callback_url } = await request.json();

    if (!delivery_id) {
      return NextResponse.json({ error: 'delivery_id is required' }, { status: 400 });
    }

    const result = await initializeOnlinePayment({
      deliveryId: delivery_id,
      customerId: user.id,
      email: user.email || 'customer@swiftlogistics.ng',
      callbackUrl: callback_url,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Payment initialization error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

