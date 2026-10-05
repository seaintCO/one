import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '@/lib/tenant';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_BUSINESS_PRICE_ID) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  const { user, business } = await requireUser();
  if (!user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const app = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_BUSINESS_PRICE_ID, quantity: 1 }],
    customer_email: user.email || undefined,
    metadata: { business_id: business.id, owner_user_id: user.id, checkout_type: 'subscription' },
    subscription_data: { metadata: { business_id: business.id, checkout_type: 'subscription' } },
    success_url: `${app}/app?upgraded=1`,
    cancel_url: `${app}/pricing`,
  });
  return NextResponse.json({ url: session.url });
}
