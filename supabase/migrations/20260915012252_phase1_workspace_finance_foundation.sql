alter table public.businesses
  add column if not exists business_type text,
  add column if not exists legal_name text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists postal_code text,
  add column if not exists country_code text default 'US',
  add column if not exists website text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists logo_url text,
  add column if not exists industry text,
  add column if not exists timezone text default 'America/Chicago',
  add column if not exists slug text,
  add column if not exists onboarding_status text default 'active';

create unique index if not exists businesses_slug_unique
  on public.businesses (lower(slug))
  where slug is not null;

alter table public.business_members
  add column if not exists permissions jsonb not null default '{}'::jsonb;

alter table public.contacts
  add column if not exists source text,
  add column if not exists last_contacted_at timestamptz;

alter table public.invoices
  add column if not exists invoice_number text,
  add column if not exists currency text not null default 'usd',
  add column if not exists subtotal_cents integer,
  add column if not exists tax_cents integer not null default 0,
  add column if not exists discount_cents integer not null default 0,
  add column if not exists payment_method text,
  add column if not exists internal_memo text,
  add column if not exists viewed_at timestamptz,
  add column if not exists voided_at timestamptz;

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_amount_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  provider text not null default 'external',
  provider_payment_id text,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status text not null default 'succeeded',
  method text not null,
  is_external boolean not null default true,
  reference text,
  note text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists payments_provider_payment_unique
  on public.payments(provider_payment_id)
  where provider_payment_id is not null;
create index if not exists payments_business_paid_idx
  on public.payments(business_id, paid_at desc);
create index if not exists payments_invoice_idx
  on public.payments(invoice_id);

create table if not exists public.messaging_registrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  provider text not null default 'telnyx',
  status text not null default 'not_started' check (status in ('not_started','submitted','pending','approved','rejected','needs_information')),
  brand_id text,
  campaign_id text,
  use_case text,
  submitted_at timestamptz,
  approved_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_business_created_idx
  on public.audit_logs(business_id, created_at desc);

alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.messaging_registrations enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "tenant invoice items" on public.invoice_items;
create policy "tenant invoice items" on public.invoice_items
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
drop policy if exists "tenant payments" on public.payments;
create policy "tenant payments" on public.payments
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
drop policy if exists "tenant messaging registrations" on public.messaging_registrations;
create policy "tenant messaging registrations" on public.messaging_registrations
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
drop policy if exists "tenant audit logs read" on public.audit_logs;
create policy "tenant audit logs read" on public.audit_logs
  for select using (is_business_member(business_id));

create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);
create index if not exists messaging_registrations_business_idx on public.messaging_registrations(business_id);
