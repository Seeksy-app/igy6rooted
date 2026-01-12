-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "orgs_insert" ON public.orgs;

CREATE POLICY "orgs_insert" 
ON public.orgs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);