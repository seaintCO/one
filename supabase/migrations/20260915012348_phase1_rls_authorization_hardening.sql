create or replace function public.is_business_member(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid()
  ) or exists(
    select 1 from public.businesses
    where id = bid and owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_business_owner(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.businesses
    where id = bid and owner_user_id = auth.uid()
  ) or exists(
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_business_member(uuid) from public;
revoke all on function public.is_business_owner(uuid) from public;
grant execute on function public.is_business_member(uuid) to authenticated, service_role;
grant execute on function public.is_business_owner(uuid) to authenticated, service_role;

drop policy if exists "business owner reads business" on public.businesses;
drop policy if exists "business owner updates business" on public.businesses;
drop policy if exists "user creates own business" on public.businesses;
create policy "business members read business" on public.businesses
  for select to authenticated
  using (public.is_business_member(id));
create policy "business owner updates business" on public.businesses
  for update to authenticated
  using (public.is_business_owner(id))
  with check (public.is_business_owner(id));
create policy "user creates own business" on public.businesses
  for insert to authenticated
  with check (owner_user_id = (select auth.uid()));

drop policy if exists "members readable" on public.business_members;
drop policy if exists "owner manages members" on public.business_members;
create policy "members readable" on public.business_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_business_member(business_id));
create policy "owner manages members" on public.business_members
  for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "tenant phone numbers" on public.phone_numbers;
create policy "tenant phone numbers" on public.phone_numbers
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant contacts" on public.contacts;
create policy "tenant contacts" on public.contacts
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant conversations" on public.conversations;
create policy "tenant conversations" on public.conversations
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant messages" on public.messages;
create policy "tenant messages" on public.messages
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant invoices" on public.invoices;
create policy "tenant invoices" on public.invoices
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant automations" on public.automations;
create policy "tenant automations" on public.automations
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant automation runs" on public.automation_runs;
create policy "tenant automation runs" on public.automation_runs
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant subscriptions" on public.subscriptions;
create policy "tenant subscriptions" on public.subscriptions
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant invoice items" on public.invoice_items;
create policy "tenant invoice items" on public.invoice_items
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant payments" on public.payments;
create policy "tenant payments" on public.payments
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant messaging registrations" on public.messaging_registrations;
create policy "tenant messaging registrations" on public.messaging_registrations
  for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "tenant audit logs read" on public.audit_logs;
create policy "tenant audit logs read" on public.audit_logs
  for select to authenticated
  using (public.is_business_member(business_id));
