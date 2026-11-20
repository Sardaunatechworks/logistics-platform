import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { assignRiderToDelivery } from '@/features/dispatch/dispatch-service';
import { isAdminRole } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

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

    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    if (!isAdminRole(userRole)) {
      return NextResponse.json({ error: 'Unauthorized: Operations Admin privilege required' }, { status: 403 });
    }

    const { rider_id, notes } = await request.json();

    if (!rider_id) {
      return NextResponse.json({ error: 'rider_id is required' }, { status: 400 });
    }

    const result = await assignRiderToDelivery({
      deliveryId,
      riderId: rider_id,
      assignedBy: user.id,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, assignment: result.assignment });
  } catch (err) {
    console.error('Error assigning rider API:', err);
    return NextResponse.json({ error: 'Internal server error processing assignment' }, { status: 500 });
  }
}

