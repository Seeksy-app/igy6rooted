
-- Fix: OAuth tokens should only be readable by admins, not all org members
-- integration_jobber_accounts: change SELECT from is_org_member to is_org_admin
DROP POLICY IF EXISTS "jobber_accounts_read" ON public.integration_jobber_accounts;
CREATE POLICY "jobber_accounts_read" ON public.integration_jobber_accounts
  FOR SELECT USING (is_org_admin(org_id));

-- integration_ad_accounts: change SELECT from is_org_member to is_org_admin
DROP POLICY IF EXISTS "ad_accounts_read" ON public.integration_ad_accounts;
CREATE POLICY "ad_accounts_read" ON public.integration_ad_accounts
  FOR SELECT USING (is_org_admin(org_id));
