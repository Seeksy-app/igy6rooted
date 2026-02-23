-- Add page_content column for article body JSON
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS page_content jsonb DEFAULT NULL;