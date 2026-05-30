-- ============================================================
-- PDT App — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. COMPANIES
-- ============================================================
create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,  -- 'AP' = Astroport, 'ST' = STEPL
  created_at  timestamptz default now()
);

-- Seed companies
insert into public.companies (name, code) values
  ('Astroport', 'AP'),
  ('STEPL', 'ST');

-- ============================================================
-- 2. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in (
    'developer','team_head','pdt_head','ceo','cfo',
    'production','marketing','academic_support','education','it','accounts'
  )),
  company_id  uuid references public.companies(id),
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'developer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 3. REQUESTS (Phase 0 — PRF)
-- ============================================================
create sequence if not exists request_seq start 1;

create table public.requests (
  id             uuid primary key default gen_random_uuid(),
  request_code   text unique,               -- R-001, auto-generated
  project_name   text not null,
  description    text,
  request_type   text default 'new' check (request_type in ('new','upgrade')),
  requestor_id   uuid references public.profiles(id),
  company_id     uuid references public.companies(id),
  status         text default 'pending' check (status in ('pending','approved','rejected','active')),
  expected_delivery_date date,
  created_at     timestamptz default now()
);

-- Auto-generate request code
create or replace function public.generate_request_code()
returns trigger language plpgsql as $$
begin
  new.request_code := 'R-' || lpad(nextval('request_seq')::text, 3, '0');
  return new;
end;
$$;

create trigger set_request_code
  before insert on public.requests
  for each row execute procedure public.generate_request_code();

-- ============================================================
-- 4. PROJECTS (Phase 1 — one per approved request)
-- ============================================================
create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid references public.requests(id),
  program_code   text,                  -- assigned in Stage 7
  current_stage  int default 1 check (current_stage between 1 and 9),
  status         text default 'active' check (status in ('active','completed','on_hold')),
  developer_id   uuid references public.profiles(id),
  created_at     timestamptz default now()
);

-- ============================================================
-- 5. PROJECT STAGES (one row per stage per project)
-- ============================================================
create table public.project_stages (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid references public.projects(id) on delete cascade,
  stage_number        int not null check (stage_number between 1 and 9),
  status              text default 'locked' check (status in ('locked','in_progress','submitted','approved')),
  dev_signed_by       uuid references public.profiles(id),
  dev_signed_at       timestamptz,
  teamhead_signed_by  uuid references public.profiles(id),
  teamhead_signed_at  timestamptz,
  pdthead_signed_by   uuid references public.profiles(id),
  pdthead_signed_at   timestamptz,
  pdt_approval_note   text,
  created_at          timestamptz default now(),
  unique (project_id, stage_number)
);

-- ============================================================
-- 6. CHECKLIST ITEMS (per stage, populated from stage template)
-- ============================================================
create table public.checklist_items (
  id          uuid primary key default gen_random_uuid(),
  stage_id    uuid references public.project_stages(id) on delete cascade,
  item_text   text not null,
  notes       text,
  dev_checked boolean default false,
  pdt_checked boolean default false,
  pdt_required boolean default false,  -- true = PDT Head must check this
  order_num   int not null default 0
);

-- ============================================================
-- 7. STAGE COMMENTS / FEEDBACK LOG
-- ============================================================
create table public.stage_comments (
  id          uuid primary key default gen_random_uuid(),
  stage_id    uuid references public.project_stages(id) on delete cascade,
  author_id   uuid references public.profiles(id),
  body        text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  type        text default 'info' check (type in ('info','action_required','approved','rejected')),
  read        boolean default false,
  link        text,  -- e.g. /projects/[id]/stages/3
  created_at  timestamptz default now()
);

-- ============================================================
-- HELPER: Auto-create all 9 stage rows when a project is created
-- ============================================================
create or replace function public.create_project_stages()
returns trigger language plpgsql as $$
begin
  insert into public.project_stages (project_id, stage_number, status)
  values
    (new.id, 1, 'in_progress'),  -- Stage 1 starts open
    (new.id, 2, 'locked'),
    (new.id, 3, 'locked'),
    (new.id, 4, 'locked'),
    (new.id, 5, 'locked'),
    (new.id, 6, 'locked'),
    (new.id, 7, 'locked'),
    (new.id, 8, 'locked'),
    (new.id, 9, 'locked');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.create_project_stages();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.companies       enable row level security;
alter table public.profiles        enable row level security;
alter table public.requests        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_stages  enable row level security;
alter table public.checklist_items enable row level security;
alter table public.stage_comments  enable row level security;
alter table public.notifications   enable row level security;

-- Authenticated users can read all companies and profiles
create policy "Anyone authenticated can read companies"
  on public.companies for select to authenticated using (true);

create policy "Anyone authenticated can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Requests: all authenticated users can read; authenticated can insert
create policy "Authenticated can read requests"
  on public.requests for select to authenticated using (true);

create policy "Authenticated can insert requests"
  on public.requests for insert to authenticated with check (true);

create policy "Requestor or PDT Head can update request"
  on public.requests for update to authenticated using (
    auth.uid() = requestor_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'pdt_head')
  );

-- Projects: all authenticated can read
create policy "Authenticated can read projects"
  on public.projects for select to authenticated using (true);

create policy "Authenticated can insert projects"
  on public.projects for insert to authenticated with check (true);

create policy "Authenticated can update projects"
  on public.projects for update to authenticated using (true);

-- Stages: all authenticated can read
create policy "Authenticated can read stages"
  on public.project_stages for select to authenticated using (true);

create policy "Authenticated can update stages"
  on public.project_stages for update to authenticated using (true);

-- Checklist: all authenticated can read and update
create policy "Authenticated can read checklist"
  on public.checklist_items for select to authenticated using (true);

create policy "Authenticated can update checklist"
  on public.checklist_items for update to authenticated using (true);

create policy "Authenticated can insert checklist"
  on public.checklist_items for insert to authenticated with check (true);

-- Comments: all authenticated can read and insert
create policy "Authenticated can read comments"
  on public.stage_comments for select to authenticated using (true);

create policy "Authenticated can insert comments"
  on public.stage_comments for insert to authenticated with check (true);

-- Notifications: users see only their own
create policy "Users see own notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert to authenticated with check (true);

create policy "Users can mark own notifications read"
  on public.notifications for update to authenticated using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (demo project for testing)
-- ============================================================
-- NOTE: After creating your first user via the app,
-- run this to seed a demo project:
--
-- insert into public.projects (request_id, developer_id, status)
-- select r.id, p.id, 'active'
-- from public.requests r, public.profiles p
-- where p.role = 'developer'
-- limit 1;
