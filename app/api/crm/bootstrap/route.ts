import { NextResponse } from 'next/server';
import { demoContacts, demoMessages } from '@/lib/demo';
import { productionMode } from '@/lib/security';
import { requireUser } from '@/lib/tenant';

export async function GET() {
  const { supabase, user, business } = await requireUser();
  const capabilities = { aiWriting: Boolean(process.env.OPENAI_API_KEY) };

  if (!supabase) {
    if (productionMode()) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    return NextResponse.json({
      contacts: demoContacts,
      messages: demoMessages,
      conversations: [],
      invoices: [],
      business: { id: 'demo', name: 'Saint Masonry', preferred_language: 'Spanish' },
      phoneNumber: '+16155550184',
      demo: true,
      capabilities,
    });
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!business) return NextResponse.json({ contacts: [], messages: [], conversations: [], invoices: [], business: null, phoneNumber: null, demo: false, capabilities });

  const [contactsResult, messagesResult, phoneResult, conversationsResult, invoicesResult] = await Promise.all([
    supabase.from('contacts').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(250),
    supabase.from('messages').select('*').eq('business_id', business.id).order('created_at', { ascending: true }).limit(500),
    supabase.from('phone_numbers').select('id,phone_number,status').eq('business_id', business.id).eq('status', 'active').maybeSingle(),
    supabase.from('conversations').select('*').eq('business_id', business.id).order('last_message_at', { ascending: false }).limit(250),
    supabase.from('invoices').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(100),
  ]);

  const error = contactsResult.error || messagesResult.error || phoneResult.error || conversationsResult.error || invoicesResult.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    business,
    contacts: contactsResult.data || [],
    messages: messagesResult.data || [],
    conversations: conversationsResult.data || [],
    invoices: invoicesResult.data || [],
    phoneNumber: phoneResult.data?.phone_number || null,
    demo: false,
    capabilities,
  });
}
