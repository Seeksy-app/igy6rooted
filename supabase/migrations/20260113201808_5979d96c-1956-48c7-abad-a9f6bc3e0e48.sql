-- Create competitor analysis table
CREATE TABLE public.competitor_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  competitor_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  scraped_content TEXT,
  extracted_services JSONB DEFAULT '[]'::jsonb,
  extracted_pricing TEXT,
  extracted_unique_selling_points JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "competitor_analyses_read" ON public.competitor_analyses
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "competitor_analyses_insert" ON public.competitor_analyses
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "competitor_analyses_update" ON public.competitor_analyses
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "competitor_analyses_delete" ON public.competitor_analyses
  FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at
CREATE TRIGGER update_competitor_analyses_updated_at
  BEFORE UPDATE ON public.competitor_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();