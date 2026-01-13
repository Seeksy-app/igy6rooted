-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'awareness',
  status TEXT NOT NULL DEFAULT 'active',
  budget NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing metrics table (daily/weekly tracking)
CREATE TABLE public.marketing_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing leads table
CREATE TABLE public.marketing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  source TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  zip_code TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  lead_score NUMERIC DEFAULT 0,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_campaigns
CREATE POLICY "marketing_campaigns_read" ON public.marketing_campaigns
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "marketing_campaigns_insert" ON public.marketing_campaigns
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "marketing_campaigns_update" ON public.marketing_campaigns
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "marketing_campaigns_delete" ON public.marketing_campaigns
  FOR DELETE USING (is_org_admin(org_id));

-- RLS Policies for marketing_metrics
CREATE POLICY "marketing_metrics_read" ON public.marketing_metrics
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "marketing_metrics_insert" ON public.marketing_metrics
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "marketing_metrics_update" ON public.marketing_metrics
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "marketing_metrics_delete" ON public.marketing_metrics
  FOR DELETE USING (is_org_admin(org_id));

-- RLS Policies for marketing_leads
CREATE POLICY "marketing_leads_read" ON public.marketing_leads
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "marketing_leads_insert" ON public.marketing_leads
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "marketing_leads_update" ON public.marketing_leads
  FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "marketing_leads_delete" ON public.marketing_leads
  FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_leads_updated_at
  BEFORE UPDATE ON public.marketing_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();