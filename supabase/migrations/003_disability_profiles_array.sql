-- AccessAdmin AI: Multi-select disability profiles
-- Add disability_profiles (jsonb array), backfill from disability_profile, drop old column

-- 1. Add new column
alter table public.profiles
  add column if not exists disability_profiles jsonb not null default '[]'::jsonb;

-- 2. Backfill: single profile -> array; 'multiple' -> all five
update public.profiles
set disability_profiles = case
  when disability_profile is null then '[]'::jsonb
  when disability_profile = 'multiple' then '["visual","hearing","cognitive","dyslexia","motor"]'::jsonb
  else jsonb_build_array(disability_profile)
end;

-- 3. Drop old column
alter table public.profiles
  drop column if exists disability_profile;
