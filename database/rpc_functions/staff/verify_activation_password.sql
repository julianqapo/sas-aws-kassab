CREATE OR REPLACE FUNCTION verify_activation_password(p_current_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _active_admin_id uuid;
  _stored_password text;
BEGIN
  -- 1. Get the authenticated user's email from the JWT
  _email := auth.jwt() ->> 'email';

  IF _email IS NULL THEN
    RETURN false;
  END IF;

  -- 2. First, check if the user is an Admin
  SELECT id INTO _active_admin_id
  FROM admin
  WHERE email = _email
  LIMIT 1;

  -- 3. If not an admin, check if they are an active staff member
  IF _active_admin_id IS NULL THEN
    SELECT id_admin INTO _active_admin_id
    FROM staff
    WHERE email = _email AND is_active = true
    LIMIT 1;
  END IF;

  -- If neither an admin nor an active staff member, they cannot verify a password
  IF _active_admin_id IS NULL THEN
    RETURN false;
  END IF;

  -- 4. Retrieve the stored password for this specific active connection
  SELECT password INTO _stored_password
  FROM activation_password
  WHERE email = _email AND id_admin = _active_admin_id;

  -- 5. If no password exists, return false
  IF _stored_password IS NULL THEN
    RETURN false;
  END IF;

  -- 6. Return true if they match, false otherwise
  RETURN _stored_password = p_current_password;
END;
$$;