CREATE OR REPLACE FUNCTION upsert_activation_password(p_old_password text, p_new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _stored_password text;
  _active_admin_id uuid;
BEGIN
  -- Extract email from the JWT
  _email := auth.jwt() ->> 'email';

  IF _email IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized', 'status', 401);
  END IF;

  -- 1. Find the admin ID where this staff member is currently active
  SELECT id_admin INTO _active_admin_id
  FROM staff
  WHERE email = _email AND is_active = true
  LIMIT 1;

  IF _active_admin_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'حساب الموظف غير فعال أو غير مرتبط بمسؤول', -- "Staff account is inactive or not linked"
      'status', 403
    );
  END IF;

  -- 2. Check if the user already has a password for THIS specific active admin
  SELECT password INTO _stored_password
  FROM activation_password
  WHERE email = _email AND id_admin = _active_admin_id;

  -- 3. If no record exists for the active admin, treat as a fresh INSERT
  IF _stored_password IS NULL THEN
    INSERT INTO activation_password (email, password, id_admin)
    VALUES (_email, p_new_password, _active_admin_id);

    RETURN json_build_object(
      'success', true, 
      'message', 'Password created successfully.', 
      'status', 201
    );

  -- 4. If a record exists for the active admin, treat as UPDATE and verify old password
  ELSE
    IF _stored_password <> p_old_password THEN
      RETURN json_build_object(
        'success', false, 
        'message', 'كلمة المرور القديمة غير صحيحة', 
        'status', 403
      );
    END IF;

    UPDATE activation_password
    SET password = p_new_password,
        updated_at = NOW()
    WHERE email = _email AND id_admin = _active_admin_id;

    RETURN json_build_object(
      'success', true, 
      'message', 'Password updated successfully.', 
      'status', 200
    );
  END IF;
END;
$$;