-- AccessAdmin AI: Initial Database Schema
-- Run this in the Supabase SQL Editor or via `supabase db push`

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  disability_profile text check (disability_profile in ('visual', 'hearing', 'cognitive', 'dyslexia', 'motor', 'multiple')),
  preferences jsonb not null default '{
    "output_mode": ["visual"],
    "font_size": "normal",
    "high_contrast": false,
    "reduced_motion": false,
    "haptic_feedback": false,
    "auto_tts": false,
    "simplified_ui": false
  }'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS: users can only access their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MEETING NOTES TABLE
-- ============================================================
create table public.meeting_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  meeting_id text not null,
  transcript text not null default '',
  summary text not null default '',
  action_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_meeting_notes_user_created on public.meeting_notes (user_id, created_at desc);
create unique index idx_meeting_notes_meeting_id on public.meeting_notes (user_id, meeting_id);

-- RLS: users can only access their own meeting notes
alter table public.meeting_notes enable row level security;

create policy "Users can view own meeting notes"
  on public.meeting_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own meeting notes"
  on public.meeting_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meeting notes"
  on public.meeting_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own meeting notes"
  on public.meeting_notes for delete
  using (auth.uid() = user_id);

-- Enable real-time
alter publication supabase_realtime add table public.meeting_notes;

-- ============================================================
-- PROMPT HISTORY TABLE
-- ============================================================
create table public.prompt_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt text not null,
  response text not null default '',
  mode text not null default 'text',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_prompt_history_user_created on public.prompt_history (user_id, created_at desc);

-- RLS
alter table public.prompt_history enable row level security;

create policy "Users can view own prompt history"
  on public.prompt_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own prompt history"
  on public.prompt_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own prompt history"
  on public.prompt_history for delete
  using (auth.uid() = user_id);

-- Enable real-time
alter publication supabase_realtime add table public.prompt_history;
