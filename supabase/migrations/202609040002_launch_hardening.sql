alter table businesses add column if not exists stripe_connected_account_id text;
create unique index if not exists businesses_owner_unique on businesses(owner_user_id);
create unique index if not exists subscriptions_business_unique on subscriptions(business_id);
create unique index if not exists messages_provider_message_unique on messages(provider_message_id) where provider_message_id is not null;
create index if not exists messages_business_created_idx on messages(business_id, created_at desc);
create index if not exists messages_conversation_created_idx on messages(conversation_id, created_at asc);
create index if not exists contacts_business_phone_idx on contacts(business_id, phone);
create index if not exists conversations_business_last_idx on conversations(business_id, last_message_at desc);
create index if not exists invoices_business_created_idx on invoices(business_id, created_at desc);
