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
    const { data: riderProfile, error: riderError } = await supabase
      .from('rider_profiles')
      .select('verification_status, availability_status, profiles!inner(account_status, role)')
      .eq('user_id', riderId)
      .single();

    if (riderError || !riderProfile) {
      return { success: false, error: 'Rider record not found' };
    }

    if (riderProfile.verification_status !== 'approved') {
      return {
        success: false,
        error: `Cannot assign: Rider verification status is '${riderProfile.verification_status}'. Only approved riders can receive assignments.`,
      };
    }

    // 2. Fetch current delivery state
    const { data: delivery, error: delError } = await supabase
      .from('deliveries')
      .select('delivery_status, tracking_number')
      .eq('id', deliveryId)
      .single();

    if (delError || !delivery) {
      return { success: false, error: 'Delivery record not found' };
    }

    if (delivery.delivery_status !== 'pending' && delivery.delivery_status !== 'confirmed') {
      return {
        success: false,
        error: `Cannot assign rider: Delivery is currently in status '${delivery.delivery_status}'.`,
      };
    }

    // 3. Withdraw any previous active/offered assignment (preserving in history)
    await supabase
      .from('delivery_assignments')
      .update({ assignment_status: 'withdrawn' })
      .eq('delivery_id', deliveryId)
      .in('assignment_status', ['offered']);

    // 4. Create new assignment
    const { data: assignment, error: assignError } = await supabase
      .from('delivery_assignments')
      .insert({
        delivery_id: deliveryId,
        rider_id: riderId,
        assigned_by: assignedBy,
        assignment_status: 'offered',
        notes: notes || null,
      })
      .select()
      .single();

    if (assignError || !assignment) {
      return { success: false, error: 'Failed to record assignment' };
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
      notes: notes ? `Assigned to rider. Notes: ${notes}` : 'Assigned to rider by operations dispatcher',
    });

    // 7. Notification for the rider
    await supabase.from('notifications').insert({
      user_id: riderId,
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

