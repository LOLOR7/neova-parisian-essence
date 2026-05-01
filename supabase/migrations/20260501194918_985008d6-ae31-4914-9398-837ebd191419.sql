create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  category text not null default 'workflow',
  related_entity_type text,
  related_entity_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.admin_notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_notifications'
      and policyname = 'Public can read admin_notifications'
  ) then
    create policy "Public can read admin_notifications"
    on public.admin_notifications
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_notifications'
      and policyname = 'Public can insert admin_notifications'
  ) then
    create policy "Public can insert admin_notifications"
    on public.admin_notifications
    for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_notifications'
      and policyname = 'Public can update admin_notifications'
  ) then
    create policy "Public can update admin_notifications"
    on public.admin_notifications
    for update
    using (true);
  end if;
end $$;

create index if not exists idx_admin_notifications_created_at
  on public.admin_notifications (created_at desc);

create index if not exists idx_admin_notifications_related
  on public.admin_notifications (related_entity_type, related_entity_id);