-- Fix demo user passwords
-- Run this in Supabase SQL Editor to set all demo accounts to "Demo1234!"
-- Uses pgcrypto's crypt() to generate a proper bcrypt hash at runtime.

update auth.users
set encrypted_password = crypt('Demo1234!', gen_salt('bf', 10))
where email in (
  'alex.visual@demo.accessadmin.app',
  'jamie.hearing@demo.accessadmin.app',
  'taylor.cognitive@demo.accessadmin.app',
  'taylor.dyslexia@demo.accessadmin.app',
  'alex.motor@demo.accessadmin.app',
  'sam.multiple@demo.accessadmin.app'
);
