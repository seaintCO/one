import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/tenant';
import { normalizePhone } from '@/lib/security';

export async function GET() {
  const { supabase, user, business } = await requireUser();
  if (!supabase || !user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });
  const { data, error } = await supabase.from('contacts').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data || [] });
}

export async function POST(req: Request) {
  const { supabase, user, business } = await requireUser();
  if (!supabase || !user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });
  const body = await req.json();
  const phone = normalizePhone(body.phone);
  if (!body.name || !phone) return NextResponse.json({ error: 'name and valid phone required' }, { status: 400 });
  const { data, error } = await supabase.from('contacts').insert({
    business_id: business.id,
    name: String(body.name).slice(0, 120),
    phone,
    email: body.email ? String(body.email).slice(0, 200) : null,
    preferred_language: String(body.language || 'English').slice(0, 40),
    lead_status: String(body.status || 'New lead').slice(0, 60),
    marketing_sms_consent: Boolean(body.marketingSmsConsent),
  }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ contact: data });
}
