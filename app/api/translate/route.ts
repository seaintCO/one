import { NextResponse } from 'next/server';
import { translateText } from '@/lib/providers/translation';
import { requireUser } from '@/lib/tenant';
import { productionMode } from '@/lib/security';

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (productionMode() && !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (productionMode() && !process.env.DEEPL_API_KEY && !process.env.GOOGLE_TRANSLATE_API_KEY) return NextResponse.json({ error: 'Translation provider is not configured' }, { status: 503 });
  const { text, targetLanguage } = await req.json();
  if (!String(text || '').trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });
  try { return NextResponse.json(await translateText(String(text), targetLanguage || 'English')); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 502 }); }
}
