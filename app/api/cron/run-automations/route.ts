import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSms } from '@/lib/providers/telnyx';
import { productionMode } from '@/lib/security';

async function run(req: Request) {
  const secret = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });

  const { data: runs, error } = await admin.from('automation_runs').select('*').eq('status', 'scheduled').lte('run_at', new Date().toISOString()).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let completed = 0, skipped = 0, failed = 0;

  for (const item of runs || []) {
    try {
      const payload: any = item.payload || {};
      if (payload.type !== 'invoice_reminder' || !payload.invoice_id || !payload.contact_id) {
        await admin.from('automation_runs').update({ status: 'skipped' }).eq('id', item.id); skipped++; continue;
      }
      const [{ data: invoice }, { data: contact }, { data: number }] = await Promise.all([
        admin.from('invoices').select('id,status,amount_cents,stripe_payment_link').eq('id', payload.invoice_id).eq('business_id', item.business_id).maybeSingle(),
        admin.from('contacts').select('id,name,phone,sms_opted_out').eq('id', payload.contact_id).eq('business_id', item.business_id).maybeSingle(),
        admin.from('phone_numbers').select('id,phone_number').eq('business_id', item.business_id).eq('status', 'active').maybeSingle(),
      ]);
      if (!invoice || invoice.status === 'paid' || !contact?.phone || contact.sms_opted_out || !number?.phone_number) {
        await admin.from('automation_runs').update({ status: 'skipped' }).eq('id', item.id); skipped++; continue;
      }
      if (productionMode() && !process.env.TELNYX_API_KEY) throw new Error('Telnyx not configured');
      const dollars = (Number(invoice.amount_cents || 0) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
      const text = `Hi ${String(contact.name || '').split(' ')[0] || 'there'}, friendly reminder: your ${dollars} invoice is still open.${invoice.stripe_payment_link ? ` Pay securely: ${invoice.stripe_payment_link}` : ''}`;
      let result: any = { data: { id: `demo-${Date.now()}` } };
      if (productionMode()) result = await sendSms(number.phone_number, contact.phone, text);
      let conversationId: string | null = null;
      const existing = await admin.from('conversations').select('id').eq('business_id', item.business_id).eq('contact_id', contact.id).maybeSingle();
      conversationId = existing.data?.id || null;
      if (!conversationId) {
        const created = await admin.from('conversations').insert({ business_id: item.business_id, contact_id: contact.id, phone_number_id: number.id }).select('id').single();
        conversationId = created.data?.id || null;
      }
      await admin.from('messages').insert({ business_id: item.business_id, conversation_id: conversationId, direction: 'outbound', from_number: number.phone_number, to_number: contact.phone, body: text, provider_message_id: result?.data?.id || null, status: productionMode() ? 'queued' : 'demo' });
      await admin.from('automation_runs').update({ status: 'completed' }).eq('id', item.id);
      completed++;
    } catch (e: any) {
      await admin.from('automation_runs').update({ status: 'failed', payload: { ...(item.payload || {}), error: String(e.message || e).slice(0, 500) } }).eq('id', item.id);
      failed++;
    }
  }
  return NextResponse.json({ ok: true, processed: (runs || []).length, completed, skipped, failed });
}
export const GET = run;
export const POST = run;
