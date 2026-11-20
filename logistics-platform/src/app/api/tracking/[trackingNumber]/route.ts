import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { STATUS_DESCRIPTIONS } from '@/config/constants';
import type { DeliveryStatus } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;
    const cleanRef = trackingNumber?.trim().toUpperCase();

    if (!cleanRef || cleanRef.length < 3) {
      return NextResponse.json(
        { error: 'Valid tracking reference is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch delivery by tracking reference
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select(`
        tracking_number,
        delivery_status,
        delivery_type,
        pickup_city,
        pickup_state,
        destination_city,
        destination_state,
        created_at
      `)
      .eq('tracking_number', cleanRef)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { error: 'Shipment with this tracking reference was not found' },
        { status: 404 }
      );
    }

    // Fetch associated status history
    const { data: history } = await supabase
      .from('delivery_status_history')
      .select('new_status, created_at, notes')
      .eq('delivery_id', (delivery as unknown as { id: string }).id || cleanRef)
      .order('created_at', { ascending: true });

    // Format privacy-safe history timeline
    const safeHistory = (history && history.length > 0)
      ? history.map((h) => ({
          status: h.new_status as DeliveryStatus,
          timestamp: h.created_at,
          description: STATUS_DESCRIPTIONS[h.new_status] || `Status updated to ${h.new_status}`,
        }))
      : [
          {
            status: delivery.delivery_status as DeliveryStatus,
            timestamp: delivery.created_at,
            description: STATUS_DESCRIPTIONS[delivery.delivery_status] || 'Delivery initiated',
          },
        ];

    // Return strictly privacy-safe response
    return NextResponse.json({
      tracking_number: delivery.tracking_number,
      delivery_status: delivery.delivery_status,
      delivery_type: delivery.delivery_type,
      pickup_city: delivery.pickup_city,
      pickup_state: delivery.pickup_state,
      destination_city: delivery.destination_city,
      destination_state: delivery.destination_state,
      created_at: delivery.created_at,
      status_history: safeHistory,
    });
  } catch (error) {
    console.error('Error fetching tracking info:', error);
    return NextResponse.json(
      { error: 'Internal server error processing tracking lookup' },
      { status: 500 }
    );
  }
}

