-- Create table for saved Meta ad campaigns
CREATE TABLE public.meta_ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  checked_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meta_ad_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for org members
CREATE POLICY "Org members can view campaigns"
ON public.meta_ad_campaigns
FOR SELECT
USING (public.is_org_member(org_id));

CREATE POLICY "Org members can create campaigns"
ON public.meta_ad_campaigns
FOR INSERT
WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "Org members can update campaigns"
ON public.meta_ad_campaigns
FOR UPDATE
USING (public.is_org_member(org_id));

CREATE POLICY "Org members can delete campaigns"
ON public.meta_ad_campaigns
FOR DELETE
USING (public.is_org_member(org_id));

-- Add trigger for updated_at
CREATE TRIGGER update_meta_ad_campaigns_updated_at
BEFORE UPDATE ON public.meta_ad_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();