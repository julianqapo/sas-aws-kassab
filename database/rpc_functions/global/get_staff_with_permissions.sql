CREATE OR REPLACE FUNCTION get_staff_with_permissions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS so the function can aggregate the data securely
SET search_path = public
AS $$
DECLARE
  _user_info json;
  _admin_id uuid;
  _is_admin boolean;
  _has_access boolean;
  _staff_data json;
BEGIN
  -- 1. Get the current user's admin_id and role using your existing function
  _user_info := get_user_admin_info();
  _admin_id := (_user_info->>'admin_id')::uuid;
  _is_admin := (_user_info->>'is_admin')::boolean;

  -- 2. Check if they are valid (belongs to a company)
  IF _admin_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'ليس لديك الصلاحيات الكافية أو أن حسابك غير نشط.' -- "Insufficient permissions or inactive account."
    );
  END IF;

  -- 3. If the user is STAFF (not admin), check if they have the required permission
  IF NOT _is_admin THEN
    -- We reuse the has_permission function built earlier
    -- 1 = staff 
    _has_access := has_permission(1);
    
    IF NOT _has_access THEN
      RETURN json_build_object(
        'success', false, 
        'message', 'ليس لديك صلاحية لعرض قائمة الموظفين.' -- "You do not have permission to view the staff list."
      );
    END IF;
  END IF;

  -- 4. Fetch all staff and their aggregated permissions for this company (admin_id)
  SELECT json_agg(
    json_build_object(
      'id', s.id,
      'email', s.email,
      'full_name', s.full_name,
      'is_active', s.is_active,
      'permissions', COALESCE(
        (
          -- Subquery to get permissions specifically for this staff member
          SELECT json_agg(json_build_object('id', al.id, 'name', al.name))
          FROM staff_permission sp
          JOIN access_list al ON al.id = sp.id_access_list
          WHERE sp.email_staff = s.email
        ), '[]'::json -- If no permissions, return an empty array instead of null
      )
    )
  ) INTO _staff_data
  FROM staff s
  WHERE s.id_admin = _admin_id;

  -- If there are no staff members at all, json_agg returns NULL. We format it as an empty array.
  IF _staff_data IS NULL THEN
    _staff_data := '[]'::json;
  END IF;

  -- 5. Return the successful payload
  RETURN json_build_object(
    'success', true,
    'message', 'تم جلب بيانات الموظفين بنجاح.', -- "Staff data fetched successfully."
    'data', _staff_data
  );
END;
$$;