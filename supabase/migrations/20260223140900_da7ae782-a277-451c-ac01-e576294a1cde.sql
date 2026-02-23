-- Allow public read access to published SEO pages (for article rendering)
CREATE POLICY "public_published_pages_read"
ON public.seo_pages
FOR SELECT
USING (status = 'published');