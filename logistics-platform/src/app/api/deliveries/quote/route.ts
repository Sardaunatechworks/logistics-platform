import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateQuote } from '@/features/pricing/pricing-engine';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DeliveryType, PackageSize, PricingRule } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { delivery_type, package_size, pickup_area, destination_area, is_intercity } = await request.json();

    if (!delivery_type || !package_size) {
      return NextResponse.json(
        { error: 'delivery_type and package_size are required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Query active pricing rule
    const { data: rule } = await adminSupabase
      .from('pricing_rules')
      .select('*')
      .eq('active', true)
      .eq('delivery_type', delivery_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const pricingRule: PricingRule = rule || {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Dutse Standard MVP Baseline',
      delivery_type: delivery_type as DeliveryType,
      base_fee_kobo: delivery_type === 'express' ? 120000 : 80000,
      zone_surcharge_kobo: 30000,
      package_surcharge_kobo: 20000,
      express_surcharge_kobo: delivery_type === 'express' ? 40000 : 0,
      active: true,
      effective_from: new Date().toISOString(),
      effective_until: null,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const quote = calculateQuote({
      deliveryType: delivery_type as DeliveryType,
      packageSize: package_size as PackageSize,
      pickupArea: pickup_area,
      destinationArea: destination_area,
      isIntercity: !!is_intercity,
      pricingRule,
    });

    return NextResponse.json(quote);
  } catch (err) {
    console.error('Error generating quote:', err);
    return NextResponse.json({ error: 'Failed to calculate quotation' }, { status: 500 });
  }
}

