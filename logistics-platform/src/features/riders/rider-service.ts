// ============================================================================
// Rider Operations Service
// Handles assignment responses and controlled delivery status transitions
// ============================================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { validateTransition } from '@/features/deliveries/state-machine';
import { verifyDeliveryOtp, generateDeliveryOtp } from './otp-service';
import type { DeliveryStatus, AssignmentStatus } from '@/types/database';

export interface RespondToAssignmentParams {
  assignmentId: string;
  riderId: string;
  action: 'accept' | 'reject';
  notes?: string;
}

export async function respondToAssignment(
  params: RespondToAssignmentParams
): Promise<{ success: boolean; error?: string }> {
  const { assignmentId, riderId, action, notes } = params;
  const supabase = createAdminClient();

  try {
    // 1. Fetch assignment and verify ownership
    const { data: assignment, error: assignError } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_id, rider_id, assignment_status, deliveries!inner(tracking_number, delivery_status)')
      .eq('id', assignmentId)
      .eq('rider_id', riderId)
      .single();

    if (assignError || !assignment) {
      return { success: false, error: 'Assignment not found or not allocated to you' };
    }

    if (assignment.assignment_status !== 'offered') {
      return {
        success: false,
        error: `Cannot respond: Assignment is currently in status '${assignment.assignment_status}'`,
      };
    }

    const newAssignmentStatus: AssignmentStatus = action === 'accept' ? 'accepted' : 'rejected';
    const newDeliveryStatus: DeliveryStatus = action === 'accept' ? 'accepted' : 'confirmed';

    // 2. Update assignment status
    await supabase
      .from('delivery_assignments')
      .update({
        assignment_status: newAssignmentStatus,
        responded_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', assignmentId);

    // 3. Update delivery status
    await supabase
      .from('deliveries')
      .update({
        delivery_status: newDeliveryStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignment.delivery_id);

    // 4. Status history record
    await supabase.from('delivery_status_history').insert({
      delivery_id: assignment.delivery_id,
      previous_status: 'assigned',
      new_status: newDeliveryStatus,
      updated_by: riderId,
      notes:
        action === 'accept'
          ? 'Rider accepted delivery assignment'
          : `Rider rejected assignment. Reason: ${notes || 'No reason provided'}`,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Error responding to assignment:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error processing response',
    };
  }
}

export interface UpdateDeliveryStatusParams {
  deliveryId: string;
  actorId: string;
  targetStatus: DeliveryStatus;
  otp?: string;
  notes?: string;
}

export async function progressDeliveryStatus(
  params: UpdateDeliveryStatusParams
): Promise<{ success: boolean; error?: string }> {
  const { deliveryId, actorId, targetStatus, otp, notes } = params;
  const supabase = createAdminClient();

  try {
    // 1. Fetch current delivery state
    const { data: delivery, error: delError } = await supabase
      .from('deliveries')
      .select('id, tracking_number, delivery_status, customer_id')
      .eq('id', deliveryId)
      .single();

    if (delError || !delivery) {
      return { success: false, error: 'Delivery record not found' };
    }

    // 2. Validate transition through State Machine
    const validation = validateTransition(delivery.delivery_status as DeliveryStatus, targetStatus, {
      hasOtp: !!otp,
      hasReason: !!notes,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 3. Handle OTP verification for 'delivered' status
    if (targetStatus === 'delivered') {
      if (!otp) {
        return { success: false, error: '6-digit OTP code is required to complete delivery' };
      }

      const otpResult = await verifyDeliveryOtp(deliveryId, otp);
      if (!otpResult.verified) {
        return { success: false, error: otpResult.error || 'Invalid OTP code' };
      }
    }

    // 4. If transitioning to in_transit, generate recipient OTP if not already present
    if (targetStatus === 'in_transit') {
      await generateDeliveryOtp(deliveryId, delivery.customer_id);
    }

    // 5. Update delivery status
    await supabase
      .from('deliveries')
      .update({
        delivery_status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    // 6. Record status history
    await supabase.from('delivery_status_history').insert({
      delivery_id: deliveryId,
      previous_status: delivery.delivery_status,
      new_status: targetStatus,
      updated_by: actorId,
      notes: notes || `Delivery status changed to ${targetStatus}`,
    });

    // 7. Notify customer
    await supabase.from('notifications').insert({
      user_id: delivery.customer_id,
      title: `Delivery Update: ${targetStatus.replace('_', ' ').toUpperCase()}`,
      message: `Your package ${delivery.tracking_number} status has been updated to ${targetStatus.replace('_', ' ')}.`,
      notification_type: 'delivery_status_updated',
      related_delivery_id: deliveryId,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Error progressing delivery status:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error updating delivery status',
    };
  }
}

