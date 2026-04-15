CREATE OR REPLACE FUNCTION manage_staff_and_permissions(
  p_staff_email text,
  p_full_name text,
  p_is_active boolean,
  p_permissions int[] -- An array of permission IDs (e.g., [1, 2, 5])
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to ensure we can read/write the necessary tables safely
SET search_path = public
AS $$
DECLARE
  _user_info json;
  _admin_id uuid;
  _is_admin boolean;
  _executor_email text := auth.jwt() ->> 'email';
  _staff_id uuid;
  _action_text text;
  _perm_id int;
BEGIN
  -- 1. Get the current user's admin_id and role
  _user_info := get_user_admin_info();
  _admin_id := (_user_info->>'admin_id')::uuid;
  _is_admin := (_user_info->>'is_admin')::boolean;

  -- Security Check: Only allow logged-in users with a valid company
  IF _admin_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'ليس لديك الصلاحيات الكافية.');
  END IF;

  -- Security Check: Managing staff is restricted to Admins OR Staff with permission ID 1
  IF NOT _is_admin AND NOT has_permission(1) THEN
    RETURN json_build_object('success', false, 'message', 'ليس لديك صلاحية لإدارة الموظفين.');
  END IF;

  -- Validate inputs
  IF p_staff_email IS NULL OR trim(p_staff_email) = '' OR p_full_name IS NULL OR trim(p_full_name) = '' THEN
    RETURN json_build_object('success', false, 'message', 'البريد الإلكتروني والاسم مطلوبان.');
  END IF;

  p_staff_email := lower(trim(p_staff_email));

  -- Ensure the email isn't already used by a DIFFERENT company (due to your UNIQUE constraint)
  IF EXISTS (SELECT 1 FROM staff WHERE email = p_staff_email AND id_admin != _admin_id) THEN
    RETURN json_build_object('success', false, 'message', 'هذا البريد الإلكتروني مسجل مسبقاً في نظام آخر.');
  END IF;

  -- 2. Check if this staff member already exists for THIS admin
  SELECT id INTO _staff_id FROM staff WHERE email = p_staff_email AND id_admin = _admin_id;

  IF _staff_id IS NOT NULL THEN
    -- UPDATE existing staff
    UPDATE staff 
    SET full_name = p_full_name, is_active = p_is_active 
    WHERE id = _staff_id;

    -- Build the history note for an update
    _action_text := 'قام بتحديث بيانات الموظف (' || p_staff_email || ') وتعديل حالته إلى ' || CASE WHEN p_is_active THEN 'نشط' ELSE 'غير نشط' END;
  ELSE
    -- INSERT new staff
    INSERT INTO staff (email, full_name, id_admin, is_active)
    VALUES (p_staff_email, p_full_name, _admin_id, p_is_active)
    RETURNING id INTO _staff_id;

    -- Build the history note for a creation
    _action_text := 'قام بإضافة موظف جديد (' || p_staff_email || ') باسم (' || p_full_name || ')';
  END IF;

  -- 3. Manage Permissions (UPDATED to use email_staff)
  -- First, clear out old permissions so we can apply the new exact list cleanly
  DELETE FROM staff_permission WHERE email_staff = p_staff_email;

  -- Insert the new array of permissions (if any were provided)
  IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
    FOREACH _perm_id IN ARRAY p_permissions
    LOOP
      INSERT INTO staff_permission (email_staff, id_access_list) VALUES (p_staff_email, _perm_id);
    END LOOP;
    
    -- Append the exact permission IDs to the history note
    _action_text := _action_text || ' مع تعيين الصلاحيات بالأرقام: ' || array_to_string(p_permissions, ', ');
  ELSE
    -- Append that no permissions were given
    _action_text := _action_text || ' بدون أي صلاحيات إضافية.';
  END IF;

  -- 4. Log the detailed action into the History table
  INSERT INTO history (id_admin, note)
  VALUES (
    _admin_id, 
    'المستخدم [' || COALESCE(_executor_email, 'غير معروف') || '] ' || _action_text
  );

  -- 5. Return Success
  RETURN json_build_object(
    'success', true, 
    'message', 'تم حفظ بيانات الموظف وصلاحياته بنجاح.'
  );
END;
$$;