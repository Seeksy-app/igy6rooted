-- Create table for client ad account connections (Google Ads and Meta Ads)
CREATE TABLE public.integration_ad_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_ads', 'meta_ads')),
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'pending', 'error', 'expired')),
  last_error TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, provider)
);

-- Enable RLS
ALTER TABLE public.integration_ad_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "ad_accounts_read" ON public.integration_ad_accounts
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "ad_accounts_insert" ON public.integration_ad_accounts
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "ad_accounts_update" ON public.integration_ad_accounts
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "ad_accounts_delete" ON public.integration_ad_accounts
  FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at
CREATE TRIGGER update_integration_ad_accounts_updated_at
  BEFORE UPDATE ON public.integration_ad_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();