// ============================================================================
// OTP Proof of Delivery Service
// Generates, hashes, stores, and verifies delivery OTPs and reference codes
// Plaintext OTP is NEVER stored in database tables or logs.
// ============================================================================

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '@/config/constants';

/**
 * Hash an OTP using SHA-256 with salt
 */
function hashOtp(otp: string, deliveryId: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp.trim().toUpperCase()}:${deliveryId}`)
    .digest('hex');
}

/**
 * Generates a cryptographically secure 6-digit OTP code for a delivery
 */
export async function generateDeliveryOtp(
  deliveryId: string,
  recipientUserId?: string
): Promise<{ success: boolean; plaintextOtp?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Generate 6 random digits
    const randomBuffer = crypto.randomBytes(3);
    const num = randomBuffer.readUIntBE(0, 3) % 1000000;
    const plaintextOtp = num.toString().padStart(6, '0');

    const otpHash = hashOtp(plaintextOtp, deliveryId);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Invalidate any existing active OTPs for this delivery
    await supabase
      .from('delivery_otps')
      .delete()
      .eq('delivery_id', deliveryId);

    // Store new hashed OTP
    const { error: insertError } = await supabase.from('delivery_otps').insert({
      delivery_id: deliveryId,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempt_count: 0,
      max_attempts: OTP_MAX_ATTEMPTS,
    });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return { success: false, error: 'Failed to record secure delivery OTP' };
    }

    // In-app notification to the customer/recipient with the code
    if (recipientUserId) {
      await supabase.from('notifications').insert({
        user_id: recipientUserId,
        title: 'Delivery Proof of Delivery Code',
        message: `Your secure delivery confirmation code is ${plaintextOtp}. Provide this code to the rider ONLY when you have received your package.`,
        notification_type: 'otp_generated',
        related_delivery_id: deliveryId,
      });
    }

    return { success: true, plaintextOtp };
  } catch (err: unknown) {
    console.error('Error in generateDeliveryOtp:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate delivery OTP',
    };
  }
}

/**
 * Verifies a submitted OTP or delivery confirmation code
 * Supports both the generated 6-digit OTP and the delivery tracking reference code
 */
export async function verifyDeliveryOtp(
  deliveryId: string,
  submittedOtp: string
): Promise<{ verified: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    const cleanedSubmitted = submittedOtp.trim().toUpperCase();

    // 1. Check against active delivery_otps record
    const { data: record } = await supabase
      .from('delivery_otps')
      .select('*')
      .eq('delivery_id', deliveryId)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (record) {
      // Check expiration
      if (new Date(record.expires_at) < new Date()) {
        return { verified: false, error: 'Delivery confirmation code has expired. Please request a new code.' };
      }

      // Check max attempts
      if (record.attempt_count >= record.max_attempts) {
        return {
          verified: false,
          error: 'Maximum code verification attempts exceeded. Please contact dispatch support.',
        };
      }

      const expectedHash = hashOtp(cleanedSubmitted, deliveryId);
      if (expectedHash === record.otp_hash) {
        await supabase
          .from('delivery_otps')
          .update({
            verified_at: new Date().toISOString(),
          })
          .eq('id', record.id);

        return { verified: true };
      }
    }

    // 2. Fallback: Recipient provides delivery tracking reference (e.g. DLV-4F8B2C or 4F8B2C)
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('tracking_number')
      .eq('id', deliveryId)
      .single();

    if (delivery) {
      const trackingUpper = delivery.tracking_number.toUpperCase();
      const trackingSuffix = trackingUpper.replace(/^DLV-/, '');
      if (
        cleanedSubmitted === trackingUpper ||
        cleanedSubmitted === trackingSuffix ||
        `DLV-${cleanedSubmitted}` === trackingUpper
      ) {
        if (record) {
          await supabase
            .from('delivery_otps')
            .update({
              verified_at: new Date().toISOString(),
            })
            .eq('id', record.id);
        }
        return { verified: true };
      }
    }

    // If OTP record existed but code didn't match, record attempt
    if (record) {
      await supabase
        .from('delivery_otps')
        .update({ attempt_count: record.attempt_count + 1 })
        .eq('id', record.id);

      const remaining = record.max_attempts - (record.attempt_count + 1);
      return {
        verified: false,
        error: `Invalid confirmation code. ${remaining} attempts remaining before lockout.`,
      };
    }

    return { verified: false, error: 'Invalid delivery confirmation code. Please check the code and try again.' };
  } catch (err: unknown) {
    console.error('Error verifying delivery OTP:', err);
    return {
      verified: false,
      error: err instanceof Error ? err.message : 'Error validating code',
    };
  }
}
