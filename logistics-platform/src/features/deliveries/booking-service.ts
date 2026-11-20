// ============================================================================
// Delivery Booking Service
// Trusted server-side delivery order creation and quote calculation
// ============================================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { calculateQuote, createPricingSnapshot } from '@/features/pricing/pricing-engine';
import type {
  CreateDeliveryInput,
} from '@/lib/validation/schemas';
import type {
  Delivery,
  PricingRule,
  DeliveryStatus,
} from '@/types/database';

/**
 * Generates a unique, non-sequential tracking reference (e.g., DLV-4A9B8C)
 */
function generateTrackingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DLV-${code}`;
}

export interface CreateDeliveryParams {
  input: CreateDeliveryInput;
  userId: string;
  businessId?: string | null;
}

export async function createDeliveryOrder(
  params: CreateDeliveryParams
): Promise<{ success: boolean; delivery?: Delivery; error?: string }> {
  const { input, userId, businessId } = params;
  const supabase = createAdminClient();

  try {
    // 1. Fetch active pricing rule for requested delivery type
    const { data: pricingRuleData, error: ruleError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('active', true)
      .eq('delivery_type', input.delivery_type)
      .lte('effective_from', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback baseline rule if no active pricing rule is seeded yet (Dutse baseline)
    const activeRule: PricingRule = pricingRuleData || {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Dutse Standard MVP Baseline',
      delivery_type: input.delivery_type,
      base_fee_kobo: input.delivery_type === 'express' ? 120000 : 80000, // ₦800 or ₦1,200
      zone_surcharge_kobo: 30000,
      package_surcharge_kobo: 20000,
      express_surcharge_kobo: input.delivery_type === 'express' ? 40000 : 0,
      active: true,
      effective_from: new Date().toISOString(),
      effective_until: null,
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    // 2. Server-side quote calculation (Never trust client prices)
    const quote = calculateQuote({
      deliveryType: input.delivery_type,
      packageSize: input.package_size,
      pickupArea: input.pickup_area,
      destinationArea: input.destination_area,
      isIntercity: input.delivery_type === 'intercity',
      pricingRule: activeRule,
    });

    const pricingSnapshot = createPricingSnapshot(quote);
    const trackingNumber = generateTrackingCode();

    // 3. Insert Delivery record with address snapshots (FR-BOOK-07)
    const { data: delivery, error: insertError } = await supabase
      .from('deliveries')
      .insert({
        tracking_number: trackingNumber,
        customer_id: userId,
        business_id: businessId || null,
        created_by: userId,

        // Pickup snapshot
        pickup_contact_name: input.pickup_contact_name,
        pickup_contact_phone: input.pickup_contact_phone,
        pickup_address: input.pickup_address,
        pickup_area: input.pickup_area || null,
        pickup_city: input.pickup_city,
        pickup_state: input.pickup_state,

        // Destination snapshot
        recipient_name: input.recipient_name,
        recipient_phone: input.recipient_phone,
        destination_address: input.destination_address,
        destination_area: input.destination_area || null,
        destination_city: input.destination_city,
        destination_state: input.destination_state,

        // Package
        package_description: input.package_description,
        package_category: input.package_category,
        package_size: input.package_size,
        delivery_type: input.delivery_type,
        delivery_status: 'pending' as DeliveryStatus,

        // Payment fields in integer kobo
        payment_method: input.payment_method,
        subtotal_kobo: quote.subtotal_kobo,
        surcharge_kobo: quote.express_surcharge_kobo + quote.package_surcharge_kobo + quote.zone_surcharge_kobo,
        total_amount_kobo: quote.total_kobo,
        pricing_rule_id: activeRule.id,
        pricing_snapshot: pricingSnapshot,

        customer_instructions: input.customer_instructions || null,
      })
      .select()
      .single();

    if (insertError || !delivery) {
      console.error('Delivery insertion error:', insertError);
      return { success: false, error: 'Failed to record delivery request' };
    }

    // 4. Initial status history append
    await supabase.from('delivery_status_history').insert({
      delivery_id: delivery.id,
      previous_status: null,
      new_status: 'pending',
      updated_by: userId,
      notes: 'Delivery request initiated by customer',
    });

    // 5. In-app notification creation
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Delivery Booked',
      message: `Your delivery request ${trackingNumber} has been received and is awaiting dispatch confirmation.`,
      notification_type: 'delivery_created',
      related_delivery_id: delivery.id,
    });

    return {
      success: true,
      delivery: delivery as unknown as Delivery,
    };
  } catch (err: unknown) {
    console.error('Error in createDeliveryOrder:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error creating delivery',
    };
  }
}

