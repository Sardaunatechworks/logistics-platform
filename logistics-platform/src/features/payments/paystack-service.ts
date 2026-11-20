// ============================================================================
// Payment Operations Service
// Handles Paystack online transactions and audited cash collections
// All amounts in integer kobo to eliminate floating-point imprecision
// ============================================================================

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Payment, PaymentStatus, PaymentMethod } from '@/types/database';

function generatePaymentReference(): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = '';
  for (let i = 0; i < 10; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PAY-${ref}`;
}

export interface InitializePaymentParams {
  deliveryId: string;
  customerId: string;
  email: string;
  callbackUrl?: string;
}

/**
 * Initialize online payment via Paystack API
 */
export async function initializeOnlinePayment(
  params: InitializePaymentParams
): Promise<{ success: boolean; authorizationUrl?: string; paymentReference?: string; error?: string }> {
  const { deliveryId, customerId, email, callbackUrl } = params;
  const supabase = createAdminClient();

  try {
    // 1. Fetch delivery to verify total payable in kobo (FR-PAY-02)
    const { data: delivery, error: delError } = await supabase
      .from('deliveries')
      .select('id, total_amount_kobo, tracking_number')
      .eq('id', deliveryId)
      .single();

    if (delError || !delivery) {
      return { success: false, error: 'Delivery record not found' };
    }

    const internalReference = generatePaymentReference();
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      // Return simulated link in development test mode if key is not configured
      const simulatedUrl = `/customer/payments/callback?reference=${internalReference}&simulated=true`;

      await supabase.from('payments').insert({
        delivery_id: deliveryId,
        customer_id: customerId,
        payment_reference: internalReference,
        provider: 'paystack',
        method: 'online',
        amount_kobo: delivery.total_amount_kobo,
        currency: 'NGN',
        status: 'pending',
      });

      return {
        success: true,
        authorizationUrl: simulatedUrl,
        paymentReference: internalReference,
      };
    }

    // 2. Call Paystack API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: delivery.total_amount_kobo, // Paystack expects kobo
        reference: internalReference,
        callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/customer/payments/callback`,
        metadata: {
          delivery_id: deliveryId,
          tracking_number: delivery.tracking_number,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return { success: false, error: data.message || 'Paystack initialization failed' };
    }

    // 3. Record pending payment
    await supabase.from('payments').insert({
      delivery_id: deliveryId,
      customer_id: customerId,
      payment_reference: internalReference,
      provider_reference: data.data.reference,
      provider: 'paystack',
      method: 'online',
      amount_kobo: delivery.total_amount_kobo,
      currency: 'NGN',
      status: 'pending',
    });

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      paymentReference: internalReference,
    };
  } catch (err: unknown) {
    console.error('Paystack initialization error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error initializing Paystack transaction',
    };
  }
}

/**
 * Verifies Paystack transaction server-side
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  const supabase = createAdminClient();
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  try {
    if (!paystackSecret) {
      // In development mode without API key, mark verified
      const { data: updated } = await supabase
        .from('payments')
        .update({
          status: 'successful' as PaymentStatus,
          verified_at: new Date().toISOString(),
          reconciliation_status: 'reconciled',
        })
        .eq('payment_reference', reference)
        .select()
        .single();

      return { success: true, payment: updated as unknown as Payment };
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return { success: false, error: 'Payment was not successful or could not be verified' };
    }

    // Confirm amount matches database record
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (!paymentRecord) {
      return { success: false, error: 'Payment record not found' };
    }

    if (data.data.amount !== paymentRecord.amount_kobo) {
      return { success: false, error: 'Discrepancy in payment amount' };
    }

    const { data: updatedPayment } = await supabase
      .from('payments')
      .update({
        status: 'successful',
        provider_reference: data.data.id?.toString(),
        verified_at: new Date().toISOString(),
        reconciliation_status: 'reconciled',
      })
      .eq('id', paymentRecord.id)
      .select()
      .single();

    return { success: true, payment: updatedPayment as unknown as Payment };
  } catch (err: unknown) {
    console.error('Payment verification error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error verifying Paystack transaction',
    };
  }
}

/**
 * Records cash collection on delivery by an authorized collector
 */
export async function recordCashCollection(params: {
  deliveryId: string;
  collectorId: string;
  amountKobo: number;
  notes?: string;
}): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  const { deliveryId, collectorId, amountKobo, notes } = params;
  const supabase = createAdminClient();

  try {
    const { data: delivery, error: delError } = await supabase
      .from('deliveries')
      .select('customer_id, total_amount_kobo, tracking_number')
      .eq('id', deliveryId)
      .single();

    if (delError || !delivery) {
      return { success: false, error: 'Delivery record not found' };
    }

    const reference = generatePaymentReference();

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        delivery_id: deliveryId,
        customer_id: delivery.customer_id,
        payment_reference: reference,
        provider: 'cash',
        method: 'cash',
        amount_kobo: amountKobo,
        currency: 'NGN',
        status: 'successful',
        collected_by: collectorId,
        collected_at: new Date().toISOString(),
        reconciliation_status: 'reconciled',
        metadata: notes ? { notes } : null,
      })
      .select()
      .single();

    if (insertError || !payment) {
      return { success: false, error: 'Failed to record cash collection' };
    }

    return { success: true, payment: payment as unknown as Payment };
  } catch (err: unknown) {
    console.error('Error recording cash collection:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error recording cash',
    };
  }
}

