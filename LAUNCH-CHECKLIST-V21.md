# ONE V21 Launch Checklist

## Core flow
- [ ] Sign up works
- [ ] Business workspace created
- [ ] Real Telnyx number search works
- [ ] Real Telnyx number provisions successfully
- [ ] Incoming SMS creates/updates contact + conversation
- [ ] Outgoing SMS sends from assigned business number
- [ ] STOP/START behavior verified
- [ ] EN/ES translation works
- [ ] AI reply suggestion works
- [ ] Fix grammar works
- [ ] Professional rewrite works
- [ ] Shorten works
- [ ] AI never sends without human pressing Send
- [ ] Stripe Connect onboarding works
- [ ] Invoice creation works
- [ ] Invoice payment link sends by SMS
- [ ] Stripe webhook marks invoice paid
- [ ] Payment record is reconciled

## Security/reliability
- [ ] Two separate businesses cannot access each other's data
- [ ] Telnyx webhook signature verification passes
- [ ] Stripe webhook signature verification passes
- [ ] No secret keys exposed to browser
- [ ] Rate limits verified
- [ ] `DEMO_MODE=false` in production
- [ ] `/api/health` returns ready=true

## Build/deploy
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] Vercel env vars configured
- [ ] Telnyx webhook points to `/api/webhooks/telnyx`
- [ ] Stripe webhook points to `/api/webhooks/stripe`
