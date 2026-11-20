// ============================================================================
// Delivery State Machine
// Centralized status transition validation
// This is the SINGLE source of truth for delivery status transitions.
// Do NOT duplicate transition rules elsewhere.
// ============================================================================

import type { DeliveryStatus } from '@/types/database';

/**
 * Defines all valid delivery status transitions.
 * Key: current status → Value: array of valid next statuses
 */
const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['accepted', 'confirmed'], // confirmed = assignment withdrawn
  accepted: ['picked_up', 'failed'],
  picked_up: ['in_transit', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [], // Terminal state
  failed: ['returned'],
  cancelled: [], // Terminal state
  returned: [], // Terminal state
};

/**
 * Statuses that require OTP verification to transition TO
 */
const OTP_REQUIRED_STATUSES: DeliveryStatus[] = ['delivered'];

/**
 * Statuses that require a reason/note
 */
const REASON_REQUIRED_STATUSES: DeliveryStatus[] = ['failed', 'cancelled'];

/**
 * Terminal statuses (no further transitions)
 */
export const TERMINAL_STATUSES: DeliveryStatus[] = ['delivered', 'cancelled', 'returned'];

/**
 * Active statuses (delivery is in progress)
 */
export const ACTIVE_STATUSES: DeliveryStatus[] = [
  'confirmed', 'assigned', 'accepted', 'picked_up', 'in_transit',
];

/**
 * Validate whether a status transition is allowed
 */
export function isValidTransition(
  currentStatus: DeliveryStatus,
  newStatus: DeliveryStatus
): boolean {
  const validNextStatuses = VALID_TRANSITIONS[currentStatus];
  if (!validNextStatuses) return false;
  return validNextStatuses.includes(newStatus);
}

/**
 * Get all valid next statuses from the current status
 */
export function getValidNextStatuses(currentStatus: DeliveryStatus): DeliveryStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if OTP is required for transitioning to a status
 */
export function requiresOtp(newStatus: DeliveryStatus): boolean {
  return OTP_REQUIRED_STATUSES.includes(newStatus);
}

/**
 * Check if a reason is required for transitioning to a status
 */
export function requiresReason(newStatus: DeliveryStatus): boolean {
  return REASON_REQUIRED_STATUSES.includes(newStatus);
}

/**
 * Check if a status is terminal (no further transitions possible)
 */
export function isTerminalStatus(status: DeliveryStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Check if a status is active (delivery in progress)
 */
export function isActiveStatus(status: DeliveryStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

/**
 * Validate a transition and return an error message if invalid
 */
export function validateTransition(
  currentStatus: DeliveryStatus,
  newStatus: DeliveryStatus,
  options?: {
    hasOtp?: boolean;
    hasReason?: boolean;
  }
): { valid: boolean; error?: string } {
  // Check if transition is valid
  if (!isValidTransition(currentStatus, newStatus)) {
    const validStatuses = getValidNextStatuses(currentStatus);
    return {
      valid: false,
      error: validStatuses.length === 0
        ? `Delivery with status '${currentStatus}' cannot be updated further.`
        : `Cannot transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validStatuses.join(', ')}`,
    };
  }

  // Check OTP requirement
  if (requiresOtp(newStatus) && !options?.hasOtp) {
    return {
      valid: false,
      error: 'OTP verification is required to mark a delivery as delivered.',
    };
  }

  // Check reason requirement
  if (requiresReason(newStatus) && !options?.hasReason) {
    return {
      valid: false,
      error: `A reason is required when marking a delivery as '${newStatus}'.`,
    };
  }

  return { valid: true };
}

