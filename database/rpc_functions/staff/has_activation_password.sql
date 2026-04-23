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

  -- 3. Get the admin ID where this staff member is currently active
  SELECT id_admin INTO _active_admin_id
  FROM staff
  WHERE email = _email AND is_active = true
  LIMIT 1;

  -- If they have no active admin record, they logically cannot have a valid active password
  IF _active_admin_id IS NULL THEN
    RETURN false;
  END IF;

  -- 4. Check if a record exists for this specific email AND active admin
  SELECT EXISTS (
    SELECT 1 FROM activation_password 
    WHERE email = _email AND id_admin = _active_admin_id
  ) INTO _has_record;

  RETURN _has_record;
END;
$$;