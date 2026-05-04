
-- 1. Fix avatar storage: require authentication for reading avatars
DROP POLICY IF EXISTS "Avatar files are publicly readable" ON storage.objects;
CREATE POLICY "Authenticated users can read avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- 2. Tighten team_insert to verify the inserter's own org membership
-- The current policy allows any admin to insert into any org they admin.
-- This is correct behavior since is_org_admin already checks auth.uid() membership.
-- But we add an explicit check that the inserted role cannot be 'owner' to prevent escalation.
DROP POLICY IF EXISTS "team_insert" ON public.team_members;
CREATE POLICY "team_insert" ON public.team_members
FOR INSERT TO public
WITH CHECK (
  is_org_admin(org_id)
  AND role IN ('member', 'admin')
);

-- 3. Create a secure view for integration_ad_accounts that excludes tokens
-- Client app should use this view instead of direct table access
CREATE OR REPLACE VIEW public.integration_ad_accounts_safe AS
SELECT
  id,
  org_id,
  provider,
  account_id,
  account_name,
  status,
  connected_at,
  token_expires_at,
  scopes,
  last_error,
  created_at,
  updated_at
FROM public.integration_ad_accounts;

-- 4. Revoke direct SELECT on integration_ad_accounts from anon and authenticated
-- Edge functions using service_role key are unaffected
REVOKE SELECT ON public.integration_ad_accounts FROM anon, authenticated;

-- 5. Grant SELECT on the safe view
GRANT SELECT ON public.integration_ad_accounts_safe TO anon, authenticated;
