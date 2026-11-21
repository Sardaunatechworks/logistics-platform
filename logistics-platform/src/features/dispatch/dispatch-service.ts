// ============================================================================
// Dispatch Operations Service
// Handles manual assignment, reassignment, and status progression by admins
// ============================================================================

import { createAdminClient } from '@/lib/supabase/admin';
import type { DeliveryAssignment, DeliveryStatus, UserRole } from '@/types/database';

export interface AssignRiderParams {
  deliveryId: string;
  riderId: string;
  assignedBy: string;
  notes?: string;
}

/**
 * Assigns an approved rider to a delivery request
 */
export async function assignRiderToDelivery(
  params: AssignRiderParams
): Promise<{ success: boolean; assignment?: DeliveryAssignment; error?: string }> {
  const { deliveryId, riderId, assignedBy, notes } = params;
  const supabase = createAdminClient();

  try {
    // 1. Verify rider eligibility (approved verification & active account)
    // Find rider profile by user_id OR primary key id
    const { data: riderProfile, error: riderError } = await supabase
      .from('rider_profiles')
      .select('id, user_id, verification_status, availability_status')
      .or(`user_id.eq.${riderId},id.eq.${riderId}`)
      .maybeSingle();

    if (riderError || !riderProfile) {
      console.error('Rider lookup failed:', riderError, { riderId });
      return { success: false, error: 'Rider record not found in system' };
    }

    const actualRiderUserId = riderProfile.user_id;

    // Verify rider user profile account status
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('account_status, role')
      .eq('id', actualRiderUserId)
      .maybeSingle();

    if (userProfile?.account_status === 'suspended' || userProfile?.account_status === 'disabled') {
      return {
        success: false,
        error: 'Cannot assign: Rider account is suspended or disabled.',
      };
    }

    if (riderProfile.verification_status !== 'approved') {
      return {
        success: false,
        error: `Cannot assign: Rider verification status is '${riderProfile.verification_status}'. Only approved riders can receive assignments. Please approve the rider in the Riders tab first.`,
      };
    }

    // 2. Fetch current delivery state
    const { data: delivery, error: delError } = await supabase
      .from('deliveries')
      .select('delivery_status, tracking_number')
      .eq('id', deliveryId)
      .single();

    if (delError || !delivery) {
      console.error('Delivery lookup failed:', delError, { deliveryId });
      return { success: false, error: 'Delivery record not found' };
    }

    // Allow assignment or re-assignment if delivery is pending, confirmed, or already assigned
    const assignableStatuses: DeliveryStatus[] = ['pending', 'confirmed', 'assigned'];
    if (!assignableStatuses.includes(delivery.delivery_status as DeliveryStatus)) {
      return {
        success: false,
        error: `Cannot assign rider: Delivery is currently in status '${delivery.delivery_status}'. Assignments are only permitted for pending, confirmed, or assigned orders.`,
      };
    }

    // 3. Withdraw any previous active/offered assignment (preserving in history)
    await supabase
      .from('delivery_assignments')
      .update({ assignment_status: 'withdrawn' })
      .eq('delivery_id', deliveryId)
      .in('assignment_status', ['offered', 'accepted']);

    // 4. Create new assignment
    const { data: assignment, error: assignError } = await supabase
      .from('delivery_assignments')
      .insert({
        delivery_id: deliveryId,
        rider_id: actualRiderUserId,
        assigned_by: assignedBy,
        assignment_status: 'offered',
        notes: notes || null,
      })
      .select()
      .single();

    if (assignError || !assignment) {
      console.error('Assignment insert failed:', assignError);
      return { success: false, error: assignError?.message || 'Failed to record assignment' };
    }

    // 5. Update delivery status to 'assigned'
    await supabase
      .from('deliveries')
      .update({
        delivery_status: 'assigned' as DeliveryStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    // 6. Record status history
    await supabase.from('delivery_status_history').insert({
      delivery_id: deliveryId,
      previous_status: delivery.delivery_status,
      new_status: 'assigned',
      updated_by: assignedBy,
      notes: notes
        ? `Assigned to rider. Notes: ${notes}`
        : delivery.delivery_status === 'assigned'
          ? 'Reassigned to rider by operations dispatcher'
          : 'Assigned to rider by operations dispatcher',
    });

    // 7. Notification for the rider
    await supabase.from('notifications').insert({
      user_id: actualRiderUserId,
      title: 'New Delivery Assignment',
      message: `You have been offered delivery job ${delivery.tracking_number}. Please accept or reject in your dashboard.`,
      notification_type: 'assignment_offered',
      related_delivery_id: deliveryId,
    });

    return { success: true, assignment: assignment as unknown as DeliveryAssignment };
  } catch (err: unknown) {
    console.error('Error assigning rider:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to assign rider',
    };
  }
}
