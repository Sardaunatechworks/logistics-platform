import test from 'node:test';
import assert from 'node:assert/strict';

// Test delivery state transitions
import {
  isValidTransition,
  validateTransition,
  requiresOtp,
  requiresReason,
  isTerminalStatus,
} from '../src/features/deliveries/state-machine.ts';

test('Delivery State Machine - Valid Transitions', () => {
  // pending transitions
  assert.equal(isValidTransition('pending', 'confirmed'), true);
  assert.equal(isValidTransition('pending', 'cancelled'), true);
  assert.equal(isValidTransition('pending', 'delivered'), false); // Cannot jump to delivered

  // confirmed transitions
  assert.equal(isValidTransition('confirmed', 'assigned'), true);
  assert.equal(isValidTransition('confirmed', 'cancelled'), true);

  // assigned transitions
  assert.equal(isValidTransition('assigned', 'accepted'), true);
  assert.equal(isValidTransition('assigned', 'confirmed'), true); // Withdrawn

  // accepted transitions
  assert.equal(isValidTransition('accepted', 'picked_up'), true);
  assert.equal(isValidTransition('accepted', 'failed'), true);

  // picked_up transitions
  assert.equal(isValidTransition('picked_up', 'in_transit'), true);

  // in_transit transitions
  assert.equal(isValidTransition('in_transit', 'delivered'), true);
  assert.equal(isValidTransition('in_transit', 'failed'), true);

  // Terminal states cannot transition further
  assert.equal(isValidTransition('delivered', 'pending'), false);
  assert.equal(isValidTransition('cancelled', 'pending'), false);
  assert.equal(isValidTransition('returned', 'pending'), false);
});

test('Delivery State Machine - OTP & Reason Requirements', () => {
  assert.equal(requiresOtp('delivered'), true);
  assert.equal(requiresOtp('in_transit'), false);

  assert.equal(requiresReason('failed'), true);
  assert.equal(requiresReason('cancelled'), true);
  assert.equal(requiresReason('in_transit'), false);

  // Delivered without OTP fails validation
  const deliveredWithoutOtp = validateTransition('in_transit', 'delivered', { hasOtp: false });
  assert.equal(deliveredWithoutOtp.valid, false);

  // Delivered with OTP passes validation
  const deliveredWithOtp = validateTransition('in_transit', 'delivered', { hasOtp: true });
  assert.equal(deliveredWithOtp.valid, true);

  // Failed without reason fails validation
  const failedWithoutReason = validateTransition('in_transit', 'failed', { hasReason: false });
  assert.equal(failedWithoutReason.valid, false);

  // Failed with reason passes validation
  const failedWithReason = validateTransition('in_transit', 'failed', { hasReason: true });
  assert.equal(failedWithReason.valid, true);
});

test('Delivery State Machine - Terminal Statuses', () => {
  assert.equal(isTerminalStatus('delivered'), true);
  assert.equal(isTerminalStatus('cancelled'), true);
  assert.equal(isTerminalStatus('returned'), true);
  assert.equal(isTerminalStatus('in_transit'), false);
  assert.equal(isTerminalStatus('pending'), false);
});
