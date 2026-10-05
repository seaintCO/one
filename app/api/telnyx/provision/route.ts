import { NextResponse } from 'next/server';
import { provisionNumber } from '@/lib/providers/telnyx';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizePhone, productionMode } from '@/lib/security';

export async function POST(req: Request) {
  const body = await req.json();
  const phoneNumber = normalizePhone(body.phoneNumber);
  if (!phoneNumber) return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 });

  const server = await createServerClient();
  const admin = createAdminClient();
  if (!server || !admin) {
    if (productionMode()) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    return NextResponse.json({ ok: true, demo: true });
  }
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let { data: business } = await admin.from('businesses').select('id').eq('owner_user_id', user.id).maybeSingle();
  if (!business) {
    const created = await admin.from('businesses').insert({
      name: String(body.businessName || 'My Business').slice(0, 120),
      preferred_language: String(body.preferredLanguage || 'English').slice(0, 40),
      owner_user_id: user.id,
    }).select('id').single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });
    business = created.data;
    await admin.from('business_members').upsert({ business_id: business.id, user_id: user.id, role: 'owner' });
    await admin.from('subscriptions').insert({ business_id: business.id, status: 'free', plan: 'free' });
  }

  const already = await admin.from('phone_numbers').select('id,phone_number').eq('business_id', business.id).eq('status', 'active').maybeSingle();
  if (already.data?.id) return NextResponse.json({ error: 'This business already has an active number', phoneNumber: already.data.phone_number }, { status: 409 });

  let provider: any = { data: { phone_numbers: [{ phone_number: phoneNumber }], id: `demo-${Date.now()}` } };
  if (productionMode()) {
    if (!process.env.TELNYX_API_KEY || !process.env.TELNYX_MESSAGING_PROFILE_ID) return NextResponse.json({ error: 'Telnyx production configuration is incomplete' }, { status: 503 });
    try { provider = await provisionNumber(phoneNumber); }
    catch (e: any) { return NextResponse.json({ error: e.message }, { status: 502 }); }
  }

  const saved = await admin.from('phone_numbers').insert({
    business_id: business.id,
    phone_number: phoneNumber,
    provider: 'telnyx',
    provider_id: provider.data?.id || null,
    status: 'active',
  });
  if (saved.error) return NextResponse.json({ error: saved.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, demo: !productionMode(), phoneNumber });
}
