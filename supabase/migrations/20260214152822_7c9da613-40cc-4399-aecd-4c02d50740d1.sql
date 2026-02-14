
-- GTM onboarding profiles
CREATE TABLE public.gtm_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id),
  business_name TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  industry TEXT,
  service_zip_codes TEXT[] NOT NULL DEFAULT '{}',
  service_radius_miles INTEGER DEFAULT 25,
  monthly_marketing_budget NUMERIC DEFAULT 0,
  target_monthly_revenue NUMERIC DEFAULT 0,
  average_job_value NUMERIC DEFAULT 0,
  current_monthly_leads INTEGER DEFAULT 0,
  target_monthly_leads INTEGER DEFAULT 0,
  active_channels JSONB NOT NULL DEFAULT '[]',
  gbp_url TEXT,
  website_url TEXT,
  semrush_connected BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

ALTER TABLE public.gtm_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gtm_profiles_read" ON public.gtm_profiles FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "gtm_profiles_insert" ON public.gtm_profiles FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY "gtm_profiles_update" ON public.gtm_profiles FOR UPDATE USING (is_org_admin(org_id));
CREATE POLICY "gtm_profiles_delete" ON public.gtm_profiles FOR DELETE USING (is_org_admin(org_id));

-- AI-generated GTM strategies
CREATE TABLE public.gtm_ai_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id),
  gtm_profile_id UUID NOT NULL REFERENCES public.gtm_profiles(id),
  strategy_type TEXT NOT NULL DEFAULT 'full', -- full, channel_specific, roi_forecast
  channel TEXT, -- null for full strategy
  ai_model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  prompt_used TEXT,
  strategy_content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gtm_ai_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gtm_strategies_read" ON public.gtm_ai_strategies FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "gtm_strategies_insert" ON public.gtm_ai_strategies FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "gtm_strategies_update" ON public.gtm_ai_strategies FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "gtm_strategies_delete" ON public.gtm_ai_strategies FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at on gtm_profiles
CREATE TRIGGER update_gtm_profiles_updated_at
  BEFORE UPDATE ON public.gtm_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
