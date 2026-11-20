import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    const { data: rules, error } = await adminSupabase
      .from('pricing_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pricing rules:', error);
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (err) {
    console.error('Pricing rules GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    if (!isSuperAdmin(userRole)) {
      return NextResponse.json({ error: 'Super Admin permissions required to modify pricing rules' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      delivery_type,
      base_fee_kobo,
      zone_surcharge_kobo,
      package_surcharge_kobo,
      express_surcharge_kobo,
      effective_from,
    } = body;

    const adminSupabase = createAdminClient();

    const { data: rule, error } = await adminSupabase
      .from('pricing_rules')
      .insert({
        name,
        delivery_type,
        base_fee_kobo,
        zone_surcharge_kobo: zone_surcharge_kobo || 0,
        package_surcharge_kobo: package_surcharge_kobo || 0,
        express_surcharge_kobo: express_surcharge_kobo || 0,
        active: true,
        effective_from: effective_from || new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !rule) {
      console.error('Error inserting pricing rule:', error);
      return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (err) {
    console.error('Pricing rules POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

