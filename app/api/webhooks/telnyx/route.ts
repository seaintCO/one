import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhone, productionMode, verifyTelnyxWebhook } from '@/lib/security';
import { translateText } from '@/lib/providers/translation';

export async function POST(req: Request) {
  const raw = await req.text();
  if (productionMode()) {
    const ok = verifyTelnyxWebhook(
      raw,
      req.headers.get('telnyx-signature-ed25519'),
      req.headers.get('telnyx-timestamp'),
    );
    if (!ok) return NextResponse.json({ error: 'invalid webhook signature' }, { status: 403 });
  }

  let event: any;
  try { event = JSON.parse(raw); }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, skipped: 'supabase not configured' });

  const data = event?.data?.payload;
  const type = String(event?.data?.event_type || event?.data?.record_type || '');
  if (!data) return NextResponse.json({ ok: true });

  if (type === 'message.received' || (type.includes('message') && data.direction === 'inbound')) {
    const from = normalizePhone(data.from?.phone_number || data.from);
    const to = normalizePhone(data.to?.[0]?.phone_number || data.to);
    const text = String(data.text || '');
    const { data: phone } = await admin.from('phone_numbers').select('business_id,id').eq('phone_number', to).maybeSingle();
    if (!phone?.business_id) return NextResponse.json({ ok: true, ignored: 'unassigned number' });

    const upper = text.trim().toUpperCase();
    const stop = ['STOP','STOPALL','UNSUBSCRIBE','CANCEL','END','QUIT'].includes(upper);
    const start = ['START','UNSTOP'].includes(upper);

    const { data: contact, error: contactError } = await admin
      .from('contacts')
      .upsert({
        business_id: phone.business_id,
        phone: from,
        name: from,
        ...(stop ? { sms_opted_out: true, marketing_sms_consent: false } : {}),
        ...(start ? { sms_opted_out: false } : {}),
      }, { onConflict: 'business_id,phone' })
      .select('id')
      .single();
    if (contactError) return NextResponse.json({ error: contactError.message }, { status: 500 });

    let conversationId: string | null = null;
    if (contact?.id) {
      const existing = await admin.from('conversations').select('id').eq('business_id', phone.business_id).eq('contact_id', contact.id).maybeSingle();
      if (existing.data?.id) conversationId = existing.data.id;
      else {
        const created = await admin.from('conversations').insert({ business_id: phone.business_id, contact_id: contact.id, phone_number_id: phone.id }).select('id').single();
        conversationId = created.data?.id || null;
      }
    }

    const { data: biz } = await admin.from('businesses').select('preferred_language').eq('id', phone.business_id).maybeSingle();
    let translatedBody: string | null = null;
    const businessLanguage = String(biz?.preferred_language || 'English');
    if (text && businessLanguage) {
      try {
        if (!productionMode() || process.env.DEEPL_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY) {
          const translated = await translateText(text, businessLanguage);
          if (translated.translatedText && translated.translatedText !== text) translatedBody = translated.translatedText;
        }
      } catch { translatedBody = null; }
    }

    const providerId = data.id || event?.data?.id || null;
    if (providerId) {
      const duplicate = await admin.from('messages').select('id').eq('provider_message_id', providerId).maybeSingle();
      if (duplicate.data?.id) return NextResponse.json({ ok: true, duplicate: true });
    }

    await admin.from('messages').insert({
      business_id: phone.business_id,
      conversation_id: conversationId,
      direction: 'inbound',
      from_number: from,
      to_number: to,
      body: text,
      translated_body: translatedBody,
      provider_message_id: providerId,
      status: 'received',
    });
    if (conversationId) await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  }

  if (type.startsWith('message.') && data.direction === 'outbound' && data.id) {
    const status = type.replace('message.', '');
    await admin.from('messages').update({ status }).eq('provider_message_id', data.id);
  }

  return NextResponse.json({ ok: true });
}
