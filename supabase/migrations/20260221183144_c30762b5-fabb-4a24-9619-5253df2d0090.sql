-- Allow org members (including sales role) to insert canvassing leads
DROP POLICY IF EXISTS "canvassing_insert" ON public.canvassing_leads;
CREATE POLICY "canvassing_insert"
ON public.canvassing_leads
FOR INSERT
WITH CHECK (is_org_member(org_id));