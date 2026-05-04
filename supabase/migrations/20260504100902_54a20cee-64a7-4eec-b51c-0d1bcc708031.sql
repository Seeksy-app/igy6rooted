
-- Fix the view to use SECURITY INVOKER (safe default)
DROP VIEW IF EXISTS public.integration_ad_accounts_safe;
CREATE VIEW public.integration_ad_accounts_safe
WITH (security_invoker = true) AS
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

-- Re-grant SELECT on the safe view
GRANT SELECT ON public.integration_ad_accounts_safe TO anon, authenticated;
