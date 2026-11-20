import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRole } from '@/lib/permissions';
import type { UserRole, VerificationStatus } from '@/types/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: riderProfileId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    if (!isAdminRole(userRole)) {
      return NextResponse.json({ error: 'Admin privilege required' }, { status: 403 });
    }

    const { action, notes } = await request.json(); // action = 'approve' | 'reject'
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const newStatus: VerificationStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: updated, error } = await adminSupabase
      .from('rider_profiles')
      .update({
        verification_status: newStatus,
        verification_notes: notes || null,
        approved_by: user.id,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        availability_status: action === 'approve' ? 'available' : 'unavailable',
        updated_at: new Date().toISOString(),
      })
      .eq('id', riderProfileId)
      .select('user_id')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Failed to update rider verification status' }, { status: 500 });
    }

    // In-app notification for the rider
    await adminSupabase.from('notifications').insert({
      user_id: updated.user_id,
      title: action === 'approve' ? 'Rider Account Approved' : 'Rider Verification Update',
      message:
        action === 'approve'
          ? 'Your rider verification has been approved. You can now receive and accept dispatch assignments in Dutse.'
          : 'Your rider verification was not approved. Please review your details with operations.',
      notification_type: 'rider_verification_updated',
    });

    return NextResponse.json({ success: true, verification_status: newStatus });
  } catch (err) {
    console.error('Rider approval error:', err);
    return NextResponse.json({ error: 'Internal server error processing rider approval' }, { status: 500 });
  }
}

