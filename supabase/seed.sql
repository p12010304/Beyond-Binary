-- ============================================================
-- Seed: Demo users with pre-configured disability profiles
-- ============================================================
-- Creates one demo user per disability profile in Supabase Auth,
-- then updates their auto-created profile row with the matching
-- preset preferences (mirroring src/lib/profilePresets.ts).
--
-- HOW TO RUN:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Paste this entire file and click "Run"
--   3. All 6 demo users will appear in Authentication > Users
--      and their profiles in Table Editor > profiles
--
-- Demo credentials (all use the same password: Demo1234!)
--   alex.visual@demo.accessadmin.app     (Visual)
--   jamie.hearing@demo.accessadmin.app   (Hearing)
--   taylor.cognitive@demo.accessadmin.app (Cognitive)
--   taylor.dyslexia@demo.accessadmin.app (Dyslexia)
--   alex.motor@demo.accessadmin.app      (Motor)
--   sam.multiple@demo.accessadmin.app    (Multiple)
--
-- NOTE: The handle_new_user() trigger from migration 001 auto-creates
-- a profiles row on auth.users insert. We then UPDATE those rows with
-- disability_profiles (array) and preset preferences.
-- After migration 003, the column is disability_profiles (jsonb array).
--
-- SAFE TO RE-RUN: Skips users that already exist.
-- ============================================================

do $$
declare
  _password_hash text := crypt('Demo1234!', gen_salt('bf', 10)); -- bcrypt hash generated at runtime
  _visual_id   uuid;
  _hearing_id  uuid;
  _cognitive_id uuid;
  _dyslexia_id uuid;
  _motor_id    uuid;
  _multiple_id uuid;
  _existing_id uuid;
begin

  -- ==============================
  -- 1. Create demo auth users
  -- ==============================
  -- Check if each user exists first, then insert or reuse existing id.

  -- Visual: Alex
  select id into _existing_id from auth.users where email = 'alex.visual@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _visual_id := _existing_id;
  else
    _visual_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _visual_id, 'authenticated', 'authenticated',
      'alex.visual@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Alex (Visual)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- Hearing: Jamie
  _existing_id := null;
  select id into _existing_id from auth.users where email = 'jamie.hearing@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _hearing_id := _existing_id;
  else
    _hearing_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _hearing_id, 'authenticated', 'authenticated',
      'jamie.hearing@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Jamie (Hearing)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- Cognitive: Taylor
  _existing_id := null;
  select id into _existing_id from auth.users where email = 'taylor.cognitive@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _cognitive_id := _existing_id;
  else
    _cognitive_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _cognitive_id, 'authenticated', 'authenticated',
      'taylor.cognitive@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Taylor (Cognitive)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- Dyslexia: Taylor
  _existing_id := null;
  select id into _existing_id from auth.users where email = 'taylor.dyslexia@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _dyslexia_id := _existing_id;
  else
    _dyslexia_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _dyslexia_id, 'authenticated', 'authenticated',
      'taylor.dyslexia@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Taylor (Dyslexia)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- Motor: Alex
  _existing_id := null;
  select id into _existing_id from auth.users where email = 'alex.motor@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _motor_id := _existing_id;
  else
    _motor_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _motor_id, 'authenticated', 'authenticated',
      'alex.motor@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Alex (Motor)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- Multiple: Sam
  _existing_id := null;
  select id into _existing_id from auth.users where email = 'sam.multiple@demo.accessadmin.app' limit 1;
  if _existing_id is not null then
    _multiple_id := _existing_id;
  else
    _multiple_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      _multiple_id, 'authenticated', 'authenticated',
      'sam.multiple@demo.accessadmin.app', _password_hash,
      now(), '{"full_name": "Sam (Multiple)"}'::jsonb, now(), now(),
      '', '', '', ''
    );
  end if;

  -- ==============================
  -- 2. Update profiles with disability presets
  -- ==============================
  -- The handle_new_user() trigger already inserted a bare profiles row
  -- for each user. Now we set disability_profiles and preferences.

  -- Visual profile (Alex)
  update public.profiles set
    disability_profiles = '["visual"]'::jsonb,
    preferences = '{
      "output_mode": ["voice", "haptic"],
      "theme": "system",
      "font_size": "large",
      "high_contrast": true,
      "reduced_motion": false,
      "haptic_feedback": true,
      "auto_tts": true,
      "simplified_ui": false,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _visual_id;

  -- Hearing profile (Jamie)
  update public.profiles set
    disability_profiles = '["hearing"]'::jsonb,
    preferences = '{
      "output_mode": ["visual", "haptic", "simplified"],
      "theme": "system",
      "font_size": "normal",
      "high_contrast": false,
      "reduced_motion": false,
      "haptic_feedback": true,
      "auto_tts": false,
      "simplified_ui": false,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _hearing_id;

  -- Cognitive profile (Taylor)
  update public.profiles set
    disability_profiles = '["cognitive"]'::jsonb,
    preferences = '{
      "output_mode": ["visual", "simplified"],
      "theme": "system",
      "font_size": "large",
      "high_contrast": false,
      "reduced_motion": true,
      "haptic_feedback": false,
      "auto_tts": true,
      "simplified_ui": true,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _cognitive_id;

  -- Dyslexia profile (Taylor)
  update public.profiles set
    disability_profiles = '["dyslexia"]'::jsonb,
    preferences = '{
      "output_mode": ["voice", "visual"],
      "theme": "system",
      "font_size": "large",
      "high_contrast": false,
      "reduced_motion": false,
      "haptic_feedback": false,
      "auto_tts": true,
      "simplified_ui": false,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _dyslexia_id;

  -- Motor profile (Alex)
  update public.profiles set
    disability_profiles = '["motor"]'::jsonb,
    preferences = '{
      "output_mode": ["voice", "visual"],
      "theme": "system",
      "font_size": "large",
      "high_contrast": false,
      "reduced_motion": false,
      "haptic_feedback": false,
      "auto_tts": true,
      "simplified_ui": false,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _motor_id;

  -- Multiple profile (Sam) — array of all five profiles
  update public.profiles set
    disability_profiles = '["visual","hearing","cognitive","dyslexia","motor"]'::jsonb,
    preferences = '{
      "output_mode": ["voice", "visual", "haptic", "simplified"],
      "theme": "system",
      "font_size": "large",
      "high_contrast": true,
      "reduced_motion": true,
      "haptic_feedback": true,
      "auto_tts": true,
      "simplified_ui": true,
      "tts_voice": "21m00Tcm4TlvDq8ikWAM"
    }'::jsonb
  where id = _multiple_id;

  -- ==============================
  -- 3. Seed sample meeting notes
  -- ==============================
  -- Give some users a sample meeting note so the app isn't empty.
  -- Uses INSERT ... ON CONFLICT to be safe on re-run.

  insert into public.meeting_notes (user_id, meeting_id, transcript, summary, action_items)
  values (
    _visual_id, 'demo-meeting-visual',
    'Team discussed Q3 goals. Marketing to launch campaign by August. Dev team to finish accessibility audit.',
    'Q3 planning meeting covered marketing campaign timeline and accessibility audit.',
    '[{"task": "Launch marketing campaign by August", "due": "2026-08-01", "completed": false}, {"task": "Complete accessibility audit", "due": "2026-07-15", "completed": false}]'::jsonb
  )
  on conflict (user_id, meeting_id) do nothing;

  insert into public.meeting_notes (user_id, meeting_id, transcript, summary, action_items)
  values (
    _hearing_id, 'demo-meeting-hearing',
    'Client call about project timeline. Deliverables due next Friday. Follow-up email needed.',
    'Client call confirmed project deliverables due next Friday with follow-up required.',
    '[{"task": "Send follow-up email to client", "due": "2026-02-10", "completed": false}, {"task": "Prepare deliverables for Friday", "due": "2026-02-13", "completed": false}]'::jsonb
  )
  on conflict (user_id, meeting_id) do nothing;

  insert into public.meeting_notes (user_id, meeting_id, transcript, summary, action_items)
  values (
    _cognitive_id, 'demo-meeting-cognitive',
    'Weekly standup. Tasks for the week: update spreadsheet, file reports, organise supplies.',
    'Weekly standup — three tasks assigned for the week.',
    '[{"task": "Update the spreadsheet", "due": "2026-02-12", "completed": false}, {"task": "File reports", "due": "2026-02-13", "completed": false}, {"task": "Organise office supplies", "due": "2026-02-14", "completed": false}]'::jsonb
  )
  on conflict (user_id, meeting_id) do nothing;

  -- ==============================
  -- 4. Seed sample prompt history
  -- ==============================

  insert into public.prompt_history (user_id, prompt, response, mode)
  values (
    _dyslexia_id,
    'Help me draft a professional email about rescheduling a meeting',
    E'Subject: Request to Reschedule Meeting\n\nHi [Name],\n\nI hope this message finds you well. I would like to request that we reschedule our meeting originally planned for [date]. Would [alternative date] work for you instead?\n\nPlease let me know your availability and I will adjust the calendar accordingly.\n\nBest regards,\n[Your Name]',
    'text'
  );

  insert into public.prompt_history (user_id, prompt, response, mode)
  values (
    _motor_id,
    'Summarize the key points of an employee onboarding checklist',
    E'1. Complete HR paperwork and tax forms\n2. Set up IT accounts (email, VPN, software access)\n3. Review company handbook and policies\n4. Meet your team and direct manager\n5. Set up workstation and accessibility tools\n6. Schedule first-week check-ins\n7. Complete required safety and compliance training',
    'voice'
  );

  raise notice 'Seed complete. 6 demo users created with preset profiles.';
end;
$$;
