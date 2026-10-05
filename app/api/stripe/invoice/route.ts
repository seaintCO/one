import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '@/lib/tenant';

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  const { supabase, user, business } = await requireUser();
  if (!supabase || !user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });
  if (!business.stripe_connected_account_id) return NextResponse.json({ error: 'Connect Stripe before sending invoices' }, { status: 409 });

  const { amount, description, customerId, dueDate } = await req.json();
  const amountCents = Math.round(Number(amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 50) return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 });

  let contact: any = null;
  if (customerId) {
    const result = await supabase.from('contacts').select('id,name,email,phone').eq('business_id', business.id).eq('id', customerId).maybeSingle();
    contact = result.data;
    if (!contact) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const { data: invoice, error: invoiceError } = await supabase.from('invoices').insert({
    business_id: business.id,
    contact_id: contact?.id || null,
    amount_cents: amountCents,
    description: String(description || 'Service invoice').slice(0, 300),
    status: 'pending',
    due_at: dueDate || null,
  }).select('*').single();
  if (invoiceError || !invoice) return NextResponse.json({ error: invoiceError?.message || 'Could not create invoice' }, { status: 500 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const app = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: contact?.email || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: { name: String(description || 'Service invoice').slice(0, 120) },
        },
        quantity: 1,
      }],
      metadata: { business_id: business.id, invoice_id: invoice.id, contact_id: contact?.id || '', checkout_type: 'invoice' },
      payment_intent_data: { metadata: { business_id: business.id, invoice_id: invoice.id, checkout_type: 'invoice' } },
      success_url: `${app}/app/money?invoice=paid`,
      cancel_url: `${app}/app/money?invoice=cancelled`,
    }, { stripeAccount: business.stripe_connected_account_id });

    await supabase.from('invoices').update({ stripe_payment_link: session.url }).eq('id', invoice.id).eq('business_id', business.id);

    // Schedule a 24-hour reminder when the contact can be reached by SMS.
    if (contact?.phone) {
      await supabase.from('automation_runs').insert({
        business_id: business.id,
        automation_id: null,
        run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        payload: { type: 'invoice_reminder', invoice_id: invoice.id, contact_id: contact.id, payment_url: session.url },
      });
    }

    return NextResponse.json({ invoice: { ...invoice, stripe_payment_link: session.url }, url: session.url });
  } catch (e: any) {
    await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id).eq('business_id', business.id);
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
