# Production checklist

1. Supabase
- Run `supabase/migrations/001_init.sql`.
- Add URL, anon key and service role key to Vercel.
- Confirm RLS with two test accounts before launch.

2. Telnyx
- Add API key, Messaging Profile and Connection ID.
- Keep `DEMO_MODE=true` until test traffic is approved.
- Configure inbound webhook `/api/webhooks/telnyx`.
- Add webhook signature verification before production traffic.
- Finish downstream-business / A2P registration flows required for each use case.

3. Stripe
- Create Business subscription price.
- Add webhook `/api/webhooks/stripe`.
- Enable Connect and verify platform settings before customer invoicing.

4. Translation
- Add DeepL or Google Translation key.

5. Operations
- Add Sentry and transactional email provider.
- Implement rate limits, abuse scoring, STOP/HELP enforcement and account suspension.
- Review Terms, Privacy, AUP, telecom consent and payment architecture with counsel.
