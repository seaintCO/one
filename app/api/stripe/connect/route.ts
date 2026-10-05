import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '@/lib/tenant';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  const { supabase, user, business } = await requireUser();
  if (!supabase || !user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let accountId = business.stripe_connected_account_id as string | null;
  if (!accountId) {
    const acct = await stripe.accounts.create({ type: 'express', metadata: { business_id: business.id, owner_user_id: user.id } });
    accountId = acct.id;
    const { error } = await supabase.from('businesses').update({ stripe_connected_account_id: accountId }).eq('id', business.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const app = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = await stripe.accountLinks.create({ account: accountId, refresh_url: `${app}/app/money?refresh=1`, return_url: `${app}/app/money?connected=1`, type: 'account_onboarding' });
  return NextResponse.json({ accountId, url: link.url });
}
