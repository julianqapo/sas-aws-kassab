CREATE OR REPLACE FUNCTION read_credential()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_admin boolean;
  _creds record;
BEGIN
  -- 1. Check if the user has an active session
  IF _uid IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'يرجى تسجيل الدخول أولاً.');
  END IF;

  -- 2. Check if the user is an admin
  SELECT EXISTS (SELECT 1 FROM admin WHERE id = _uid) INTO _is_admin;
  
  IF NOT _is_admin THEN
    RETURN json_build_object('success', false, 'message', 'ليس لديك صلاحية لإجراء هذه العملية.');
  END IF;

  -- 3. Fetch the credentials for this admin
  SELECT username, password INTO _creds FROM credential WHERE id_admin = _uid LIMIT 1;

  -- 4. Check if credentials were actually found
  IF _creds IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'لا توجد بيانات اعتماد مسجلة.');
  END IF;

  -- 5. Return the credentials on success
  RETURN json_build_object(
    'success', true,
    'username', _creds.username,
    'password', _creds.password
  );
END;
$$;