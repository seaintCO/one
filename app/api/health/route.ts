import { NextResponse } from 'next/server';
import { productionMode } from '@/lib/security';

export async function GET() {
  const checks = {
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
    telnyx: Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_PUBLIC_KEY && process.env.TELNYX_MESSAGING_PROFILE_ID),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_BUSINESS_PRICE_ID),
    aiWriting: Boolean(process.env.OPENAI_API_KEY),
    translation: Boolean(process.env.DEEPL_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY),
    cron: Boolean(process.env.CRON_SECRET),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };
  const ready = Object.values(checks).every(Boolean) && productionMode();
  return NextResponse.json({ ok: true, mode: productionMode() ? 'production' : 'demo', ready, checks }, { status: ready ? 200 : 503 });
}
