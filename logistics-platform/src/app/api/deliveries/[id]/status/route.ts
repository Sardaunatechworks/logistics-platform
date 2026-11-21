import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { progressDeliveryStatus } from '@/features/riders/rider-service';
import type { DeliveryStatus } from '@/types/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliveryId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { target_status, otp, notes } = await request.json();

    if (!target_status) {
      return NextResponse.json({ error: 'target_status is required' }, { status: 400 });
    }

    const cleanedOtp = otp ? String(otp).trim().toUpperCase() : undefined;

    const result = await progressDeliveryStatus({
      deliveryId,
      actorId: user.id,
      targetStatus: target_status as DeliveryStatus,
      otp: cleanedOtp,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, target_status });
  } catch (err) {
    console.error('Delivery status update error:', err);
    return NextResponse.json({ error: 'Internal server error updating delivery status' }, { status: 500 });
  }
}

