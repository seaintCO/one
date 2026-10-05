import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/providers/telnyx';
import { requireUser } from '@/lib/tenant';
import { normalizePhone, productionMode } from '@/lib/security';
import { translateText } from '@/lib/providers/translation';

export async function POST(req: Request) {
  const { from, to, text, conversationId } = await req.json();
  const fromNumber = normalizePhone(from);
  const toNumber = normalizePhone(to);
  const body = String(text || '').trim();
  if (!fromNumber || !toNumber || !body) return NextResponse.json({ error: 'from, to and text required' }, { status: 400 });
  if (body.length > 1600) return NextResponse.json({ error: 'Message is too long' }, { status: 400 });

  const { supabase, user, business } = await requireUser();
  if (!user || !business || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: owned } = await supabase.from('phone_numbers').select('id').eq('business_id', business.id).eq('phone_number', fromNumber).eq('status', 'active').maybeSingle();
  if (!owned) return NextResponse.json({ error: 'Sender number is not assigned to this business' }, { status: 403 });

  const { data: contact } = await supabase.from('contacts').select('id,sms_opted_out,preferred_language').eq('business_id', business.id).eq('phone', toNumber).maybeSingle();
  if (contact?.sms_opted_out) return NextResponse.json({ error: 'This contact opted out of SMS' }, { status: 409 });

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('direction', 'outbound').gte('created_at', since);
  if ((count || 0) >= 60) return NextResponse.json({ error: 'Rate limit reached. Try again shortly.' }, { status: 429 });

  let outboundBody = body;
  let translatedBody: string | null = null;
  const targetLanguage = String(contact?.preferred_language || '').trim();
  const businessLanguage = String(business.preferred_language || 'English').trim();
  if (targetLanguage && targetLanguage.toLowerCase() !== businessLanguage.toLowerCase()) {
    if (productionMode() && !process.env.DEEPL_API_KEY && !process.env.GOOGLE_TRANSLATE_API_KEY) {
      return NextResponse.json({ error: 'Translation provider is not configured' }, { status: 503 });
    }
    try {
      const translated = await translateText(body, targetLanguage);
      translatedBody = translated.translatedText;
      outboundBody = translatedBody || body;
    } catch (e: any) {
      return NextResponse.json({ error: `Translation failed: ${e.message}` }, { status: 502 });
    }
  }

  let result: any = { data: { id: `demo-${Date.now()}` } };
  if (productionMode()) {
    if (!process.env.TELNYX_API_KEY) return NextResponse.json({ error: 'Telnyx is not configured' }, { status: 503 });
    try { result = await sendSms(fromNumber, toNumber, outboundBody); }
    catch (e: any) { return NextResponse.json({ error: e.message }, { status: 502 }); }
  }

  let resolvedConversationId = conversationId || null;
  if (!resolvedConversationId && contact?.id) {
    const existing = await supabase.from('conversations').select('id').eq('business_id', business.id).eq('contact_id', contact.id).maybeSingle();
    resolvedConversationId = existing.data?.id || null;
    if (!resolvedConversationId) {
      const created = await supabase.from('conversations').insert({ business_id: business.id, contact_id: contact.id, phone_number_id: owned.id }).select('id').single();
      resolvedConversationId = created.data?.id || null;
    }
  }

  const providerId = result?.data?.id || null;
  const { error } = await supabase.from('messages').insert({
    business_id: business.id,
    conversation_id: resolvedConversationId,
    direction: 'outbound',
    from_number: fromNumber,
    to_number: toNumber,
    body,
    translated_body: translatedBody,
    provider_message_id: providerId,
    status: productionMode() ? 'queued' : 'demo',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (resolvedConversationId) await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', resolvedConversationId).eq('business_id', business.id);

  return NextResponse.json({ ok: true, demo: !productionMode(), result, sentText: outboundBody, translated: Boolean(translatedBody), conversationId: resolvedConversationId });
}
