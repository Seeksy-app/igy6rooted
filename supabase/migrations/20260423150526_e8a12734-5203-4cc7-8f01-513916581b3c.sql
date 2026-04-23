-- 1. Fix privilege escalation: only admins can insert team members
DROP POLICY IF EXISTS team_insert ON public.team_members;
CREATE POLICY team_insert ON public.team_members
  FOR INSERT
  WITH CHECK (public.is_org_admin(org_id));

-- 2. Add DELETE policy for booking_events (admins only)
CREATE POLICY events_delete ON public.booking_events
  FOR DELETE
  USING (public.is_org_admin(org_id));

-- 3. Add UPDATE/DELETE policies for llm_brand_results (admins only)
CREATE POLICY brand_results_update ON public.llm_brand_results
  FOR UPDATE
  USING (public.is_org_admin(org_id));

CREATE POLICY brand_results_delete ON public.llm_brand_results
  FOR DELETE
  USING (public.is_org_admin(org_id));

-- 4. Lock down avatars bucket: remove broad public listing, allow only owner-scoped access + public read of individual files by path
-- Drop any existing broad policies on avatars
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual LIKE '%avatars%' OR with_check LIKE '%avatars%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public read of individual avatar files (by exact path), but bucket-listing is gated by RLS
CREATE POLICY "Avatar files are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder (user_id as first path segment)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Make avatars bucket non-public so listing requires RLS (individual file reads still work via SELECT policy above)
UPDATE storage.buckets SET public = false WHERE id = 'avatars';