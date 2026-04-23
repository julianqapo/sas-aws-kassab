CREATE OR REPLACE FUNCTION has_permission(p_permission_id int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to safely check the permissions
SET search_path = public
AS $$
DECLARE
  _email text;
  _has_permission boolean;
  _is_admin boolean;
BEGIN
  -- 1. Extract the email from the authenticated user's session
  _email := auth.jwt() ->> 'email';

  -- If there is no email in the session, they are not logged in
  IF _email IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Check if the permission exists for this staff member
  SELECT EXISTS (
    SELECT 1 
    FROM staff_permission sp
    JOIN staff s ON s.email = sp.email_staff
    WHERE sp.id_access_list = p_permission_id
    AND s.email = _email
    AND s.is_active = true -- Extra security: ensure the staff account is actually active
  ) INTO _has_permission;

  -- If the staff check passes, return true immediately to save processing time
  IF _has_permission THEN
    RETURN true;
  END IF;

  -- 3. If they don't have the specific staff permission, check if they are an Admin
  SELECT EXISTS (
    SELECT 1 
    FROM admin 
    WHERE email = _email
  ) INTO _is_admin;

  -- Return true if they are an admin, otherwise false
  RETURN _is_admin;
END;
$$;