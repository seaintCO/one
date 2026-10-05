import { NextResponse } from 'next/server';
import { searchNumbers } from '@/lib/providers/telnyx';
import { requireUser } from '@/lib/tenant';
import { productionMode } from '@/lib/security';

export async function GET(req: Request) {
  const area = new URL(req.url).searchParams.get('areaCode') || '';
  if (!/^\d{3}$/.test(area)) return NextResponse.json({ error: 'Valid 3-digit area code required' }, { status: 400 });
  const { user } = await requireUser();
  if (productionMode() && !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!productionMode()) return NextResponse.json({ numbers: [184, 236, 317, 442].map((x) => ({ phoneNumber: `+1${area}555${String(x).padStart(4,'0')}` })), demo: true });
  if (!process.env.TELNYX_API_KEY) return NextResponse.json({ error: 'Telnyx is not configured' }, { status: 503 });
  try { return NextResponse.json({ numbers: await searchNumbers(area) }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 502 }); }
}
