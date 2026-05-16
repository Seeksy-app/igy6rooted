CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  path text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_org_created ON public.page_views (org_id, created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views (org_id, path, created_at DESC);
CREATE INDEX idx_page_views_session ON public.page_views (session_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_insert_public" ON public.page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "page_views_read_org_members" ON public.page_views
  FOR SELECT USING (is_org_member(org_id));