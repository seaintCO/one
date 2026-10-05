# ONE V22 — Launch Checklist

## Product scope for launch
- [ ] User can sign up and create a business workspace
- [ ] User can search real Telnyx number inventory
- [ ] User can provision a real business number
- [ ] Incoming SMS creates/updates the correct CRM contact + conversation
- [ ] Owner can send outbound SMS from the assigned number
- [ ] Translation works for EN/ES conversations
- [ ] AI can generate a reply draft but never auto-send it
- [ ] Fix Grammar / Professional / Shorten work in the composer
- [ ] Human must press Send for every customer message
- [ ] Invoice can be created from customer context
- [ ] Stripe payment link can be sent to the customer
- [ ] Stripe webhook marks paid invoices correctly
- [ ] Two separate businesses cannot access each other's data
- [ ] Mobile CRM and homepage interactive iPhone preview render cleanly
- [ ] Light / dark and EN / ES UI remain usable

## Deployment gates
- [ ] npm install completes
- [ ] npm run build passes
- [ ] /api/health reports ready in production
- [ ] Supabase production keys configured in Vercel
- [ ] Telnyx production keys + webhook configured
- [ ] Stripe production keys + webhook configured
- [ ] OpenAI production key configured for Writing Assist
- [ ] Translation provider configured
- [ ] End-to-end paid pilot tested with real business number and real Stripe payment

Do not enable international transfers, Sites, POS, autonomous sending, or unrestricted marketing campaigns as launch requirements.
