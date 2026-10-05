# SEAINT ONE — V23

V23 keeps the production-focused V22 build and fixes the homepage closing CTA so it stays black/dark like the rest of the public site in both theme modes.

# SEAINT ONE V22 — Production Focus + Real iPhone CRM Preview

Current launch scope:
- Real business number provisioning through Telnyx
- iMessage-style customer inbox
- English/Spanish translation
- AI Writing Assist for reply drafts, grammar, professional rewrites, and shortening
- Human-in-the-loop sending: AI never auto-sends
- CRM contacts and conversation history
- Stripe Connect invoice creation and payment links
- Optional SMS delivery of invoice payment links
- Light/Dark and EN/ES UI

## V22 homepage phone update

The homepage phone is now an interactive, realistic iPhone-style device that mirrors the actual launch CRM rather than a separate concept UI.

Its bottom navigation matches the product:
- Home
- Inbox
- Customers
- Money
- Settings

The preview includes:
- business line status
- recent customers
- iMessage-style inbox
- real-looking conversation thread
- EN/ES translation under customer messages
- AI suggested reply
- Fix grammar / Professional / Shorten controls
- manual Send action
- customer list
- invoice/payment view
- workspace settings

The preview is intentionally product-demo data. Production app data remains loaded through the authenticated CRM routes.

## Deferred from launch
- International transfers
- Sites
- POS
- Advanced campaigns
- Autonomous AI sending
- Full voice calling

## Local run
Copy `.env.example` to `.env.local`, fill credentials, then run:

```powershell
npm install --registry=https://registry.npmjs.org
npm run dev
```

Open http://localhost:3000

## Production readiness
Before public launch, run `npm run build`, configure Telnyx/Stripe webhooks, and complete real end-to-end tests across at least two separate business tenants.
