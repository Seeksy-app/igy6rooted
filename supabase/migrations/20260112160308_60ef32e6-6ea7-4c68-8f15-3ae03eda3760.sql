-- Orgs / tenants
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Org memberships
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff','viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- Jobber connection metadata (NO TOKENS stored here; tokens live in Integration Service)
create table if not exists jobber_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  status text not null default 'disconnected' check (status in ('disconnected','pending','connected','error')),
  jobber_account_id text,
  connected_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service catalog (what the AI can schedule)
create table if not exists service_catalog (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  service_key text not null,
  display_name text not null,
  default_duration_minutes int not null default 60,
  buffer_before_minutes int not null default 0,
  buffer_after_minutes int not null default 0,
  jobber_service_type_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, service_key)
);

-- Availability rules (business hours, blackout dates, territories)
create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  timezone text not null default 'America/New_York',
  business_hours jsonb not null default '{"mon":[["09:00","17:00"]],"tue":[["09:00","17:00"]],"wed":[["09:00","17:00"]],"thu":[["09:00","17:00"]],"fri":[["09:00","17:00"]],"sat":[],"sun":[]}'::jsonb,
  blackout_dates jsonb not null default '[]'::jsonb,
  allowed_zip_codes jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking request record (created when the AI attempts scheduling)
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  channel text not null default 'voice' check (channel in ('voice','web','sms','manual')),
  caller_phone text,
  customer_name text,
  customer_email text,
  service_key text,
  address text,
  zip text,
  preferred_windows jsonb default '[]'::jsonb,
  status text not null default 'new' check (status in ('new','searching','offered','selected','booked','failed','needs_followup')),
  jobber_client_id text,
  jobber_visit_id text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  last_error text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking events (audit log of tool calls + outcomes)
create table if not exists booking_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  booking_request_id uuid not null references booking_requests(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Manual follow-ups when booking fails or needs human
create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  booking_request_id uuid references booking_requests(id) on delete set null,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'open' check (status in ('open','in_progress','done')),
  assigned_user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FAQ / knowledge base for the AI (Lovable-managed)
create table if not exists faq_kb (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  category text,
  question text not null,
  answer text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table orgs enable row level security;
alter table team_members enable row level security;
alter table jobber_connections enable row level security;
alter table service_catalog enable row level security;
alter table availability_rules enable row level security;
alter table booking_requests enable row level security;
alter table booking_events enable row level security;
alter table followups enable row level security;
alter table faq_kb enable row level security;

-- helper: membership exists (security definer to avoid recursion)
create or replace function public.is_org_member(_org_id uuid)
returns boolean 
language sql 
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from team_members tm
    where tm.org_id = _org_id and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(_org_id uuid)
returns boolean 
language sql 
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from team_members tm
    where tm.org_id = _org_id and tm.user_id = auth.uid() and tm.role = 'admin'
  );
$$;

-- Policies: members can read; admins can write
create policy "orgs_read" on orgs for select using (public.is_org_member(id));
create policy "orgs_insert" on orgs for insert with check (true);
create policy "orgs_update" on orgs for update using (public.is_org_admin(id));
create policy "orgs_delete" on orgs for delete using (public.is_org_admin(id));

create policy "team_read" on team_members for select using (public.is_org_member(org_id));
create policy "team_insert" on team_members for insert with check (public.is_org_admin(org_id) or user_id = auth.uid());
create policy "team_update" on team_members for update using (public.is_org_admin(org_id));
create policy "team_delete" on team_members for delete using (public.is_org_admin(org_id));

create policy "jobber_read" on jobber_connections for select using (public.is_org_member(org_id));
create policy "jobber_insert" on jobber_connections for insert with check (public.is_org_admin(org_id));
create policy "jobber_update" on jobber_connections for update using (public.is_org_admin(org_id));
create policy "jobber_delete" on jobber_connections for delete using (public.is_org_admin(org_id));

create policy "services_read" on service_catalog for select using (public.is_org_member(org_id));
create policy "services_insert" on service_catalog for insert with check (public.is_org_admin(org_id));
create policy "services_update" on service_catalog for update using (public.is_org_admin(org_id));
create policy "services_delete" on service_catalog for delete using (public.is_org_admin(org_id));

create policy "rules_read" on availability_rules for select using (public.is_org_member(org_id));
create policy "rules_insert" on availability_rules for insert with check (public.is_org_admin(org_id));
create policy "rules_update" on availability_rules for update using (public.is_org_admin(org_id));
create policy "rules_delete" on availability_rules for delete using (public.is_org_admin(org_id));

create policy "booking_read" on booking_requests for select using (public.is_org_member(org_id));
create policy "booking_insert" on booking_requests for insert with check (public.is_org_admin(org_id));
create policy "booking_update" on booking_requests for update using (public.is_org_admin(org_id));
create policy "booking_delete" on booking_requests for delete using (public.is_org_admin(org_id));

create policy "events_read" on booking_events for select using (public.is_org_member(org_id));
create policy "events_insert" on booking_events for insert with check (public.is_org_admin(org_id));

create policy "followups_read" on followups for select using (public.is_org_member(org_id));
create policy "followups_insert" on followups for insert with check (public.is_org_member(org_id));
create policy "followups_update" on followups for update using (public.is_org_member(org_id));

create policy "faq_read" on faq_kb for select using (public.is_org_member(org_id));
create policy "faq_insert" on faq_kb for insert with check (public.is_org_admin(org_id));
create policy "faq_update" on faq_kb for update using (public.is_org_admin(org_id));
create policy "faq_delete" on faq_kb for delete using (public.is_org_admin(org_id));