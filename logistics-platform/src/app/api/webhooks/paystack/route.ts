import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

    // Validate signature if webhook secret is configured
    if (secret && signature) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, amount, id: providerTxId } = event.data;
      const supabase = createAdminClient();

      // Check if payment already recorded as successful (Idempotency guarantee)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status, amount_kobo')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingPayment) {
        if (existingPayment.status === 'successful') {
          // Already processed; return 200 OK immediately
          return NextResponse.json({ received: true, note: 'Already processed' });
        }

        // Verify amount
        if (existingPayment.amount_kobo !== amount) {
          console.warn('Webhook amount mismatch for reference:', reference);
          await supabase
            .from('payments')
            .update({ reconciliation_status: 'disputed' })
            .eq('id', existingPayment.id);

          return NextResponse.json({ received: true, status: 'disputed' });
        }

        // Mark as successful
        await supabase
          .from('payments')
          .update({
            status: 'successful',
            provider_reference: providerTxId?.toString(),
            verified_at: new Date().toISOString(),
            reconciliation_status: 'reconciled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

