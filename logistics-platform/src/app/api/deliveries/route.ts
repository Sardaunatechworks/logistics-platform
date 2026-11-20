import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createDeliveryOrder } from '@/features/deliveries/booking-service';
import { createDeliverySchema } from '@/lib/validation/schemas';
import { isAdminRole } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const json = await request.json();
    const parseResult = createDeliverySchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await createDeliveryOrder({
      input: parseResult.data,
      userId: user.id,
      businessId: json.business_id || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.delivery, { status: 201 });
  } catch (err) {
    console.error('Error creating delivery:', err);
    return NextResponse.json({ error: 'Internal server error creating delivery' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    const adminSupabase = createAdminClient();

    let query = adminSupabase
      .from('deliveries')
      .select('*, customer:profiles!deliveries_customer_id_fkey(full_name, phone)', { count: 'exact' });

    // Authorization scoping
    if (!isAdminRole(userRole)) {
      if (userRole === 'rider') {
        // Riders only see deliveries assigned to them
        const { data: assigned } = await adminSupabase
          .from('delivery_assignments')
          .select('delivery_id')
          .eq('rider_id', user.id);

        const assignedIds = (assigned || []).map((a) => a.delivery_id);
        query = query.in('id', assignedIds.length > 0 ? assignedIds : ['00000000-0000-0000-0000-000000000000']);
      } else {
        // Customer or merchant sees own deliveries
        query = query.eq('customer_id', user.id);
      }
    }

    if (status) {
      query = query.eq('delivery_status', status);
    }

    if (search) {
      query = query.or(`tracking_number.ilike.%${search}%,recipient_name.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: deliveries, count, error } = await query;

    if (error) {
      console.error('Deliveries query error:', error);
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
    }

    return NextResponse.json({
      deliveries: deliveries || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('Deliveries listing error:', err);
    return NextResponse.json({ error: 'Internal server error fetching deliveries' }, { status: 500 });
  }
}

