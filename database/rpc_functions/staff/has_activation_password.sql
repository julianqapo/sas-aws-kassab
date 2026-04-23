CREATE OR REPLACE FUNCTION has_activation_password()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _active_admin_id uuid;
  _has_record boolean;
BEGIN
  -- 1. Get the authenticated user's email from the JWT
  _email := auth.jwt() ->> 'email';

  -- 2. If not logged in, return false immediately
  IF _email IS NULL THEN
    RETURN false;
  END IF;

  -- 3. First, check if the user is an Admin
  SELECT id INTO _active_admin_id
  FROM admin
  WHERE email = _email
  LIMIT 1;

  -- 4. If not an admin, check if they are an active staff member
  IF _active_admin_id IS NULL THEN
    SELECT id_admin INTO _active_admin_id
    FROM staff
    WHERE email = _email AND is_active = true
    LIMIT 1;
  END IF;

  -- If neither an admin nor an active staff member, they can't have a valid active password
  IF _active_admin_id IS NULL THEN
    RETURN false;
  END IF;

  -- 5. Check if a record exists for this specific email AND active admin connection
  SELECT EXISTS (
    SELECT 1 FROM activation_password 
    WHERE email = _email AND id_admin = _active_admin_id
  ) INTO _has_record;

  RETURN _has_record;
END;
$$;