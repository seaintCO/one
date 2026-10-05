# SEAINT ONE — Work Chat Handoff / Launch Plan

## Non-negotiable engineering instruction

Do NOT rebuild ONE from scratch. Do NOT create a second CRM. Audit and extend what is already here. Preserve working auth, CRM, Telnyx, messaging, Stripe, Supabase, bilingual UX, theme support, and the iMessage-style inbox.

## Product vision

ONE is a multi-tenant small-business operating system. Each business/workspace should eventually get one coherent place for:

- business profile + team
- CRM / contacts / leads / customers
- dedicated business number
- SMS / inbox / voicemail / calls
- invoices / payments / payouts / POS
- website + custom domain
- booking
- marketing/create tools
- automations
- ALMA assistant

Every major resource must stay tenant-scoped by `business_id`. Prevent cross-tenant leakage with Supabase RLS plus server-side authorization.

## Current launch scope

Launch the core before future modules.

### Must work first

1. Supabase authentication
2. Business/workspace creation
3. Business profile
4. Existing CRM/contact management
5. Telnyx live number search
6. Telnyx number provisioning
7. SMS send/receive
8. iMessage-style ONE inbox
9. EN/ES UX
10. Light/dark mode
11. Stripe Connect activation
12. Invoices + payment links
13. Stripe webhook reconciliation
14. Manual external payments (Cash / Check / Zelle / Venmo / Other)
15. Messaging compliance state + consent
16. Production deployment / health checks

### Next

- Finance overview / payouts
- Sites architecture + premium templates + tenant subdomains
- custom domains
- POS / Tap to Pay
- Create / image marketing
- Leadly integration
- ALMA tool layer

### Later / provider approval

- Airwallex Connected Accounts
- international remittance / wallets
- cards
- advanced video generation
- large automation marketplace

## Current architecture

### Frontend / deployment

- Next.js App Router
- React
- Framer Motion
- Vercel
- PWA support

### Database / auth

- Supabase
- ONE production project ref: `crkhqcykoiuawkrkrnbv`
- Project URL: `https://crkhqcykoiuawkrkrnbv.supabase.co`

### Telecom

- Telnyx
- ONE owns the UX and provisioning layer
- Telnyx provides the underlying numbering and messaging infrastructure

### Payments

- Stripe for ONE subscription billing
- Stripe Connect for each business to accept its own customer payments
- ONE must not custody business funds

### Translation

- DeepL OR Google Translate
- OpenAI is not required for baseline translation

### Future global finance

- Airwallex Platform / Connected Accounts after approval
- Airwallex remains regulated financial infrastructure/custodian
- ONE remains the software/UI layer

## Supabase migrations

The source migration filenames in this ZIP are aligned with the LIVE Supabase migration history:

- `202609040001_init.sql`
- `202609040002_launch_hardening.sql`
- `202609040003_invoice_automation.sql`
- `20260915012252_phase1_workspace_finance_foundation.sql`
- `20260915012348_phase1_rls_authorization_hardening.sql`

Migrations 004/005 added:

- richer business profile fields
- invoice line items
- payments ledger
- external/manual payment foundation
- messaging registration state
- audit logs
- stronger owner/member RLS boundaries

Before any future database change, create an additive migration. Do not destroy the existing schema.

## Production-hardening patches already included in this package

This package fixes several issues found during audit:

1. Stripe Checkout sessions now carry `checkout_type=subscription` or `checkout_type=invoice` so invoice payments cannot accidentally activate the ONE subscription.
2. Stripe webhook handles subscription checkout and invoice checkout separately.
3. Paid invoice checkout writes a Stripe payment record to the `payments` ledger.
4. Tenant resolver can resolve a workspace for either an owner or a business member.
5. Onboarding no longer silently substitutes fake/demo phone numbers when live Telnyx search fails.
6. Number activation no longer redirects into the app when provisioning failed.

## Important remaining engineering work

### High priority before broad public launch

- Update Supabase auth from legacy middleware pattern to current Proxy/getClaims guidance.
- Build the business profile form around the new columns.
- Add a real manual payment UI/API using the `payments` table.
- Add Business Texting activation UI using `messaging_registrations`.
- Gate marketing campaigns until registration/consent requirements are met.
- Verify Telnyx profile, webhook, number provisioning, inbound and outbound SMS end to end.
- Verify Stripe Connect onboarding and webhook events end to end.
- Run production build and smoke test.

### Telnyx production flow

User signup
→ business created
→ area code entered
→ `/api/telnyx/numbers`
→ live Telnyx inventory
→ user selects number
→ `/api/telnyx/provision`
→ Telnyx number order
→ attach ONE Messaging Profile
→ save `phone_numbers.business_id`
→ incoming webhook routes SMS back to correct tenant

Telnyx production webhook:

`https://YOUR-DOMAIN.com/api/webhooks/telnyx`

### Stripe production flow

ONE subscription:

`/api/stripe/checkout`

Business payment activation:

`/api/stripe/connect`

Invoice:

`/api/stripe/invoice`

Stripe production webhook:

`https://YOUR-DOMAIN.com/api/webhooks/stripe`

## Environment variables

Required for full live core launch:

```env
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.com
NEXT_PUBLIC_APP_NAME=ONE
DEMO_MODE=false

NEXT_PUBLIC_SUPABASE_URL=https://crkhqcykoiuawkrkrnbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TELNYX_API_KEY=
TELNYX_PUBLIC_KEY=
TELNYX_MESSAGING_PROFILE_ID=
TELNYX_CONNECTION_ID=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BUSINESS_PRICE_ID=

DEEPL_API_KEY=
# OR GOOGLE_TRANSLATE_API_KEY=

CRON_SECRET=

# Optional
RESEND_API_KEY=
FROM_EMAIL=ONE <notifications@yourdomain.com>
```

Never commit secrets to GitHub.

## Launch acceptance test

Do not call the core launch complete until a real test business can successfully complete this chain:

Create ONE account
→ create business
→ choose live Telnyx number
→ number saved to correct business
→ receive real SMS
→ outbound reply succeeds
→ translation succeeds when needed
→ contact/conversation/message history updates
→ create invoice
→ business completes Stripe Connect
→ customer pays invoice
→ webhook marks invoice paid
→ payment appears in ledger
→ unpaid reminder is cancelled
→ second business cannot access first business data

## Deployment sequence

1. Put this source in GitHub `seaintCO/ONE-AI`.
2. Connect GitHub repo to Vercel.
3. Add environment variables in Vercel for Production, Preview and Development as appropriate.
4. Confirm Supabase migration history is aligned.
5. Set Supabase Auth Site URL + redirect URLs to production domain.
6. Configure Telnyx webhook to production `/api/webhooks/telnyx`.
7. Configure Stripe webhook to production `/api/webhooks/stripe`.
8. Run `npm run build` locally.
9. Deploy Vercel preview.
10. Run end-to-end acceptance test.
11. Open private beta first.
12. Open public signup after real provider flows pass.

## Work chat instruction

Start by auditing THIS source package and the GitHub repo. Preserve current functionality. Implement production hardening and launch requirements in order. Do not spend time redesigning the homepage unless it blocks conversion/usability. Working functionality is the priority.
