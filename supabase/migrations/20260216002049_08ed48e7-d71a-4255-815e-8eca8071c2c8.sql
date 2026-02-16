
-- Canvassing leads table for door-to-door sales from SendJim postcards
CREATE TABLE public.canvassing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id),
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  property_type TEXT,
  sendjim_code TEXT,
  sendjim_mailing_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_name TEXT,
  status TEXT NOT NULL DEFAULT 'unvisited',
  notes TEXT,
  knocked_at TIMESTAMP WITH TIME ZONE,
  outcome_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_canvassing_org_status ON public.canvassing_leads(org_id, status);
CREATE INDEX idx_canvassing_assigned ON public.canvassing_leads(assigned_to);
CREATE UNIQUE INDEX idx_canvassing_unique_address ON public.canvassing_leads(org_id, address);

-- Enable RLS
ALTER TABLE public.canvassing_leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "canvassing_read" ON public.canvassing_leads
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "canvassing_insert" ON public.canvassing_leads
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "canvassing_update" ON public.canvassing_leads
  FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "canvassing_delete" ON public.canvassing_leads
  FOR DELETE USING (is_org_admin(org_id));

-- Updated_at trigger
CREATE TRIGGER update_canvassing_leads_updated_at
  BEFORE UPDATE ON public.canvassing_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
