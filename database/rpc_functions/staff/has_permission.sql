CREATE OR REPLACE FUNCTION has_permission(p_permission_id int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to safely check the permissions
SET search_path = public
AS $$
DECLARE
  _email text;
  _has_permission boolean;
BEGIN
  -- 1. Extract the email from the authenticated user's session
  _email := auth.jwt() ->> 'email';

  -- If there is no email in the session, they are not logged in
  IF _email IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Check if the permission exists for this staff member
  -- We join the staff table to match the JWT email to the id_staff UUID
  SELECT EXISTS (
    SELECT 1 
    FROM staff_permission sp
    JOIN staff s ON s.email = sp.email_staff
    WHERE sp.id_access_list = p_permission_id  -- Note: Change 'permission_id' to 'id' if that is your exact column name
    AND s.email = _email
    AND s.is_active = true -- Extra security: ensure the staff account is actually active
  ) INTO _has_permission;

  -- 3. Return true or false
  RETURN _has_permission;
END;
$$;