# ONE — Production Launch Candidate

This build defaults to **production mode**. It will not silently simulate telecom or payments when production credentials are missing.

## Required before public launch

1. Run both Supabase migrations in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_launch_hardening.sql`
2. Add all required Vercel environment variables from `.env.example`.
3. Telnyx:
   - production API key
   - public Ed25519 key
   - Messaging Profile ID
   - configure inbound messaging webhook to `https://YOUR_DOMAIN/api/webhooks/telnyx`
4. Stripe:
   - secret key
   - publishable key
   - webhook secret
   - Business plan Price ID
   - webhook URL `https://YOUR_DOMAIN/api/webhooks/stripe`
5. Generate a strong `CRON_SECRET` and configure Vercel cron authorization.
6. Visit `/api/health`. Public launch requires `ready: true`.
7. Complete carrier registration/verification for the actual messaging use cases you enable.
8. Have your final Terms, Privacy, Acceptable Use, consent, number-retention and call-recording language reviewed for your launch jurisdictions.

## Security hardening in this build

- Telnyx Ed25519 webhook verification with 5-minute replay tolerance.
- Stripe webhook signature verification.
- Authenticated telecom routes.
- Sender ownership validation before SMS sending.
- SMS opt-out enforcement.
- STOP/START processing on inbound SMS.
- Duplicate webhook protection using provider message IDs.
- Basic per-business outbound SMS rate limiting.
- One active phone number per business during V1 onboarding.
- Stripe Connect account stored against the authenticated business rather than orphaned.
- Production mode fails closed when providers are missing.

## Launch scope

Safe to launch once `/api/health` is green and real end-to-end tests pass for:
- signup/login
- business onboarding
- number search/provisioning
- inbound SMS
- outbound SMS
- contacts/CRM storage
- Stripe subscription
- Stripe Connect onboarding

Do not advertise live browser calling, real international money transfer, or unrestricted bulk campaigns until those specific provider integrations/approvals are enabled and tested.
