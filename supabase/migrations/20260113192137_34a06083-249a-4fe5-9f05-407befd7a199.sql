-- Create GTM market zones table for market prioritization
CREATE TABLE public.gtm_market_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 50,
  lead_score_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  target_monthly_leads INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gtm_market_zones ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their org's GTM zones"
ON public.gtm_market_zones
FOR SELECT
USING (public.is_org_member(org_id));

CREATE POLICY "Admins can create GTM zones"
ON public.gtm_market_zones
FOR INSERT
WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Admins can update their org's GTM zones"
ON public.gtm_market_zones
FOR UPDATE
USING (public.is_org_admin(org_id));

CREATE POLICY "Admins can delete their org's GTM zones"
ON public.gtm_market_zones
FOR DELETE
USING (public.is_org_admin(org_id));

-- Add updated_at trigger
CREATE TRIGGER update_gtm_market_zones_updated_at
BEFORE UPDATE ON public.gtm_market_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();