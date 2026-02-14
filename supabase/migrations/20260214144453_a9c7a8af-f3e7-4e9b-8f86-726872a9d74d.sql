
-- ============================================
-- SEO CLIENT PROFILES (full marketing stack per client)
-- ============================================
CREATE TABLE public.seo_client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  
  -- Core identity
  domain TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  industry TEXT,
  
  -- Analytics
  ga4_measurement_id TEXT,
  ga4_property_id TEXT,
  search_console_property TEXT,
  
  -- SEO tools
  semrush_project_id TEXT,
  
  -- Ads
  google_ads_cid TEXT,
  meta_ad_account_id TEXT,
  
  -- Social
  google_business_profile_url TEXT,
  facebook_page_url TEXT,
  instagram_handle TEXT,
  linkedin_url TEXT,
  youtube_channel_url TEXT,
  tiktok_handle TEXT,
  x_handle TEXT,
  
  -- CRM
  crm_platform TEXT,
  crm_account_id TEXT,
  
  -- Status
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(org_id, domain)
);

ALTER TABLE public.seo_client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_profiles_read" ON public.seo_client_profiles
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "seo_profiles_insert" ON public.seo_client_profiles
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "seo_profiles_update" ON public.seo_client_profiles
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "seo_profiles_delete" ON public.seo_client_profiles
  FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at
CREATE TRIGGER update_seo_client_profiles_updated_at
  BEFORE UPDATE ON public.seo_client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- LLM BRAND SCANS (one row per scan run)
-- ============================================
CREATE TABLE public.llm_brand_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES seo_client_profiles(id) ON DELETE CASCADE,
  
  -- Scan config
  prompts_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  models_queried TEXT[] NOT NULL DEFAULT '{}',
  
  -- Aggregate scores
  overall_brand_score NUMERIC,
  
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.llm_brand_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_scans_read" ON public.llm_brand_scans
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "brand_scans_insert" ON public.llm_brand_scans
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "brand_scans_update" ON public.llm_brand_scans
  FOR UPDATE USING (is_org_member(org_id));

-- ============================================
-- LLM BRAND RESULTS (one row per model per prompt)
-- ============================================
CREATE TABLE public.llm_brand_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES llm_brand_scans(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  
  -- What was queried
  model_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_category TEXT, -- e.g. 'recommendation', 'comparison', 'review'
  
  -- Raw response
  response_text TEXT NOT NULL,
  
  -- Analysis
  brand_mentioned BOOLEAN NOT NULL DEFAULT false,
  brand_position INTEGER, -- 1st, 2nd, 3rd etc. in recommendation list
  sentiment TEXT, -- positive, neutral, negative
  sentiment_score NUMERIC, -- -1.0 to 1.0
  citation_found BOOLEAN NOT NULL DEFAULT false,
  citation_url TEXT,
  competitor_mentions JSONB DEFAULT '[]'::jsonb,
  
  -- Scoring
  presence_score NUMERIC, -- 0-100
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.llm_brand_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_results_read" ON public.llm_brand_results
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "brand_results_insert" ON public.llm_brand_results
  FOR INSERT WITH CHECK (is_org_member(org_id));

-- Indexes
CREATE INDEX idx_seo_client_profiles_org ON seo_client_profiles(org_id);
CREATE INDEX idx_llm_brand_scans_client ON llm_brand_scans(client_profile_id);
CREATE INDEX idx_llm_brand_scans_org ON llm_brand_scans(org_id);
CREATE INDEX idx_llm_brand_results_scan ON llm_brand_results(scan_id);
CREATE INDEX idx_llm_brand_results_org ON llm_brand_results(org_id);
