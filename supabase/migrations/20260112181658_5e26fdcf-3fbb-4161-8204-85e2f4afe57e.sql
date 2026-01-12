-- Drop all existing insert policies on orgs
DROP POLICY IF EXISTS "orgs_insert" ON public.orgs;

-- Create an explicitly PERMISSIVE policy for insert
CREATE POLICY "orgs_insert" 
ON public.orgs 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (true);