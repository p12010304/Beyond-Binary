-- ============================================================
-- Migration 002: Add Supabase Storage for audio & documents
-- ============================================================
-- Adds:
--   1. audio_path column to meeting_notes (links to stored recording)
--   2. Storage buckets: meeting-recordings, user-documents
--   3. RLS policies so each user can only access their own files

-- ============================================================
-- 1. Add audio_path to meeting_notes
-- ============================================================
alter table public.meeting_notes
  add column if not exists audio_path text default null;

comment on column public.meeting_notes.audio_path is
  'Storage path to the meeting recording file (e.g. "<user_id>/<meeting_id>.webm")';

-- ============================================================
-- 2. Create storage buckets
-- ============================================================

-- Meeting recordings: private bucket for audio files (WebM, WAV, MP3, MP4)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meeting-recordings',
  'meeting-recordings',
  false,
  52428800, -- 50 MB
  array['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'video/webm']
)
on conflict (id) do nothing;

-- User documents: private bucket for uploaded docs & images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-documents',
  'user-documents',
  false,
  20971520, -- 20 MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
on conflict (id) do nothing;

-- ============================================================
-- 3. RLS policies for meeting-recordings bucket
-- ============================================================

-- Users can upload to their own folder: <user_id>/filename
create policy "Users can upload own meeting recordings"
  on storage.objects for insert
  with check (
    bucket_id = 'meeting-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view/download their own recordings
create policy "Users can read own meeting recordings"
  on storage.objects for select
  using (
    bucket_id = 'meeting-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own recordings
create policy "Users can delete own meeting recordings"
  on storage.objects for delete
  using (
    bucket_id = 'meeting-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update (overwrite) their own recordings
create policy "Users can update own meeting recordings"
  on storage.objects for update
  using (
    bucket_id = 'meeting-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 4. RLS policies for user-documents bucket
-- ============================================================

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own documents"
  on storage.objects for select
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own documents"
  on storage.objects for delete
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own documents"
  on storage.objects for update
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
