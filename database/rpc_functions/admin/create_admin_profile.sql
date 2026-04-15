CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ensures the function has permission to insert, bypassing frontend RLS
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _email text;
  _exists boolean;
  _is_staff_active boolean; -- Variable for the staff check
  _expiry_date timestamptz;
BEGIN
  -- 1. Get the authenticated user's ID and Email directly from their secure session token
  _uid := auth.uid();
  _email := auth.jwt() ->> 'email';

  IF _uid IS NULL THEN
    RAISE EXCEPTION 'لا تملك الصلاحية لاتمام العملية';
  END IF;

  -- 2. Check if the user already exists in the admin table
  SELECT EXISTS (
    SELECT 1 FROM admin WHERE id = _uid
  ) INTO _exists;

  -- If they exist in admin, return conflict
  IF _exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'هذا الحساب مسجل مسبقا',
      'status', 409
    );
  END IF;

  -- 3. NEW CHECK: Check if the email exists and is active in the staff table
  SELECT EXISTS (
    SELECT 1 FROM staff 
    WHERE email = _email 
    AND is_active = true
  ) INTO _is_staff_active;

  -- If they are an active staff member, return the same conflict response
  IF _is_staff_active THEN
    RETURN json_build_object(
      'success', false,
      'message', 'هذا الحساب مسجل مسبقا كموظف، احذف الحساب اولا لاكمال التسجيل كمدير',
      'status', 409
    );
  END IF;

  -- 4. Calculate expiry date (31 days from exactly right now)
  _expiry_date := NOW() + INTERVAL '30 days';

  -- 5. Insert the new admin record
  INSERT INTO admin (id, email, expiry_date)
  VALUES (_uid, _email, _expiry_date);

  -- 6. Return a success payload
  RETURN json_build_object(
    'success', true,
    'message', 'تم التسجيل بنجاح',
    'expiry_date', _expiry_date,
    'status', 201
  );
END;
$$;