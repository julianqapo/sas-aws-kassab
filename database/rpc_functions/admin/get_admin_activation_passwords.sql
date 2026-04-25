CREATE OR REPLACE FUNCTION get_admin_activation_passwords()
RETURNS TABLE (
  email text,
  password text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  -- 1. Get the authenticated user's ID
  _uid := auth.uid();

  -- 2. Return the matching records
  RETURN QUERY
  SELECT ap.email, ap.password
  FROM activation_password ap
  WHERE ap.id_admin = _uid;
END;
$$;