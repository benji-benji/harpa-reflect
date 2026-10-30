-- HarPA Reflect — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Users
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    username text unique not null,
    password_hash text not null,
    display_name text not null,
    role text not null default 'staff' check (role in ('staff', 'supervisor')),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 2. Journal Entries
create table public.journal_entries (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    session_date date not null,
    status text not null default 'draft' check (status in ('draft', 'complete')),
    created_at timestamptz not null default now(),
    completed_at timestamptz,
    member_id uuid -- future FK to Plinth members
);

create index idx_journal_entries_user_date on public.journal_entries(user_id, session_date);

-- 3. Entry Responses (individual prompt answers within an entry)
create table public.entry_responses (
    id uuid primary key default uuid_generate_v4(),
    entry_id uuid not null references public.journal_entries(id) on delete cascade,
    prompt_key text not null,
    response_text text not null,
    audio_url text,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

create index idx_entry_responses_entry on public.entry_responses(entry_id);

-- 4. AI Responses
create table public.ai_responses (
    id uuid primary key default uuid_generate_v4(),
    entry_id uuid unique not null references public.journal_entries(id) on delete cascade,
    response_text text not null,
    model_used text not null,
    created_at timestamptz not null default now()
);

-- 5. Mood Records
create table public.mood_records (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    entry_id uuid references public.journal_entries(id) on delete set null,
    session_date date not null,
    mood_score int not null check (mood_score >= 1 and mood_score <= 5),
    mood_note text,
    created_at timestamptz not null default now()
);

create index idx_mood_records_user_date on public.mood_records(user_id, session_date);

-- 6. Goals
create table public.goals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    goal_text text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    completed_at timestamptz
);

create index idx_goals_user_active on public.goals(user_id, is_active);

-- 7. Approved Quotes
create table public.approved_quotes (
    id uuid primary key default uuid_generate_v4(),
    entry_response_id uuid not null references public.entry_responses(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    quote_text text not null,
    approved_at timestamptz not null default now(),
    used_in_report boolean not null default false
);

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.journal_entries enable row level security;
alter table public.entry_responses enable row level security;
alter table public.ai_responses enable row level security;
alter table public.mood_records enable row level security;
alter table public.goals enable row level security;
alter table public.approved_quotes enable row level security;

-- RLS Policies (service role bypasses these; anon/authenticated use them)
-- For now, allow all operations via service role (backend manages access control)
-- These policies allow the backend service key to perform all operations
create policy "Service role full access" on public.users for all using (true) with check (true);
create policy "Service role full access" on public.journal_entries for all using (true) with check (true);
create policy "Service role full access" on public.entry_responses for all using (true) with check (true);
create policy "Service role full access" on public.ai_responses for all using (true) with check (true);
create policy "Service role full access" on public.mood_records for all using (true) with check (true);
create policy "Service role full access" on public.goals for all using (true) with check (true);
create policy "Service role full access" on public.approved_quotes for all using (true) with check (true);
