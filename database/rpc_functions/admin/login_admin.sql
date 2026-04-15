CREATE OR REPLACE FUNCTION login_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user trying to log in has an active account in a specific table
  IF EXISTS (SELECT 1 FROM admin WHERE id = auth.uid()) THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;