-- Create a function to create an org and add the creator as admin atomically
CREATE OR REPLACE FUNCTION public.create_org_with_admin(org_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create the org
  INSERT INTO orgs (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;
  
  -- Add the current user as admin
  INSERT INTO team_members (org_id, user_id, role)
  VALUES (new_org_id, auth.uid(), 'admin');
  
  RETURN new_org_id;
END;
$$;