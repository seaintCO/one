import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/tenant';
import { runWritingAssist, type WritingAction } from '@/lib/providers/openai';

const ACTIONS = new Set<WritingAction>(['reply', 'grammar', 'professional', 'friendly', 'shorten']);

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Writing Assist is not configured' }, { status: 503 });
  }

  const { supabase, user, business } = await requireUser();
  if (!supabase || !user || !business) return NextResponse.json({ error: 'Unauthorized or onboarding incomplete' }, { status: 401 });

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const action = String(body.action || '') as WritingAction;
  const contactId = String(body.contactId || '');
  const draft = String(body.draft || '').slice(0, 4000);
  if (!ACTIONS.has(action)) return NextResponse.json({ error: 'Unsupported writing action' }, { status: 400 });
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });
  if (action !== 'reply' && !draft.trim()) return NextResponse.json({ error: 'Write a message first' }, { status: 400 });

  const { data: contact } = await supabase
    .from('contacts')
    .select('id,name,preferred_language')
    .eq('business_id', business.id)
    .eq('id', contactId)
    .maybeSingle();
  if (!contact) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', business.id)
    .eq('contact_id', contact.id)
    .maybeSingle();

  let history: any[] = [];
  if (conversation?.id) {
    const { data } = await supabase
      .from('messages')
      .select('direction,body,translated_body,created_at')
      .eq('business_id', business.id)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
      .limit(12);
    history = (data || []).reverse();
  }

  // Lightweight per-user rate limit for an interactive writing tool.
  const admin = createAdminClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  if (admin) {
    const { count } = await admin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('actor_user_id', user.id)
      .like('action', 'ai.%')
      .gte('created_at', since);
    if ((count || 0) >= 30) return NextResponse.json({ error: 'AI writing limit reached. Try again in a minute.' }, { status: 429 });
  }

  try {
    const result = await runWritingAssist({
      action,
      businessName: business.name || 'Business',
      businessLanguage: business.preferred_language || 'English',
      contactName: contact.name || 'Customer',
      contactLanguage: contact.preferred_language,
      draft,
      conversation: history,
    });

    if (admin) {
      await admin.from('audit_logs').insert({
        business_id: business.id,
        actor_user_id: user.id,
        action: `ai.${action}`,
        resource_type: 'contact',
        resource_id: contact.id,
        metadata: { model: result.model },
      });
    }

    return NextResponse.json({ text: result.text, action });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI Writing Assist failed' }, { status: 502 });
  }
}
