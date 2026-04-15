CREATE OR REPLACE FUNCTION get_user_admin_info()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ensures the function can read the tables regardless of RLS
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text := auth.jwt() ->> 'email';
  _resolved_admin_id uuid;
BEGIN
  -- 1. First, check if the authenticated user is an Admin
  SELECT id INTO _resolved_admin_id 
  FROM admin 
  WHERE id = _uid;

  -- If an admin record is found, return their ID and is_admin = true
  IF _resolved_admin_id IS NOT NULL THEN
    RETURN json_build_object(
      'admin_id', _resolved_admin_id,
      'is_admin', true
    );
  END IF;

  -- 2. If not an admin, check if they are an active Staff member
  IF _email IS NOT NULL THEN
    SELECT id_admin INTO _resolved_admin_id 
    FROM staff 
    WHERE email = _email AND is_active = true;

    -- If an active staff record is found, return their associated admin's ID and is_admin = false
    IF _resolved_admin_id IS NOT NULL THEN
      RETURN json_build_object(
        'admin_id', _resolved_admin_id,
        'is_admin', false
      );
    END IF;
  END IF;

  -- 3. If they are neither an admin nor an active staff member, return null for the ID
  RETURN json_build_object(
    'admin_id', NULL,
    'is_admin', false
  );
END;
$$;