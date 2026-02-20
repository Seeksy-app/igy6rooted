
-- SEO page metadata table
CREATE TABLE public.seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id),
  route_path TEXT NOT NULL,
  page_name TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index, follow',
  h1_override TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_image_alt TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  twitter_image_alt TEXT,
  structured_data JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, route_path)
);

-- Enable RLS
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_pages_read" ON public.seo_pages FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "seo_pages_insert" ON public.seo_pages FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY "seo_pages_update" ON public.seo_pages FOR UPDATE USING (is_org_admin(org_id));
CREATE POLICY "seo_pages_delete" ON public.seo_pages FOR DELETE USING (is_org_admin(org_id));

-- Trigger for updated_at
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
