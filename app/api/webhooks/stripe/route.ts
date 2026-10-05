import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing signature' }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 503 });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const businessId = session.metadata?.business_id;
    const checkoutType = session.metadata?.checkout_type;

    if (checkoutType === 'subscription' && businessId) {
      await admin.from('subscriptions').upsert({
        business_id: businessId,
        stripe_customer_id: String(session.customer || ''),
        status: 'active',
        plan: 'business',
      }, { onConflict: 'business_id' });
    }

    if (checkoutType === 'invoice') {
      const invoiceId = session.metadata?.invoice_id;
      if (invoiceId && businessId) {
        await admin.from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', invoiceId)
          .eq('business_id', businessId);

        await admin.from('payments').upsert({
          business_id: businessId,
          invoice_id: invoiceId,
          provider: 'stripe',
          provider_payment_id: String(session.payment_intent || session.id),
          amount_cents: Number(session.amount_total || 0),
          currency: String(session.currency || 'usd'),
          status: 'succeeded',
          method: 'stripe',
          is_external: false,
          paid_at: new Date().toISOString(),
        }, { onConflict: 'provider_payment_id' });

        await admin.from('automation_runs')
          .update({ status: 'cancelled' })
          .eq('business_id', businessId)
          .eq('status', 'scheduled')
          .contains('payload', { invoice_id: invoiceId });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const businessId = subscription.metadata?.business_id;
    if (businessId) {
      await admin.from('subscriptions')
        .update({
          status: subscription.status,
          plan: subscription.status === 'active' || subscription.status === 'trialing' ? 'business' : 'free',
        })
        .eq('business_id', businessId);
    }
  }

  return NextResponse.json({ ok: true });
}
