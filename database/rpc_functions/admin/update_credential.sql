CREATE OR REPLACE FUNCTION update_credential(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_admin boolean;
  _exists boolean;
BEGIN
  -- 1. Check if the user is logged in and is an admin
  IF _uid IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'يرجى تسجيل الدخول أولاً.');
  END IF;

  SELECT EXISTS (SELECT 1 FROM admin WHERE id = _uid) INTO _is_admin;
  
  IF NOT _is_admin THEN
    RETURN json_build_object('success', false, 'message', 'ليس لديك صلاحية لإجراء هذه العملية.');
  END IF;

  -- 2. Check for empty inputs
  IF p_username IS NULL OR trim(p_username) = '' OR p_password IS NULL OR trim(p_password) = '' THEN
    RETURN json_build_object('success', false, 'message', 'اسم المستخدم وكلمة المرور مطلوبان ولا يمكن ترك الحقول فارغة.');
  END IF;

  -- 3. Ensure the record actually exists before updating
  SELECT EXISTS (SELECT 1 FROM credential WHERE id_admin = _uid) INTO _exists;
  
  IF NOT _exists THEN
    RETURN json_build_object('success', false, 'message', 'لا توجد بيانات اعتماد مسجلة مسبقاً لتحديثها.');
  END IF;

  -- 4. Update the record
  UPDATE credential 
  SET username = p_username, password = p_password 
  WHERE id_admin = _uid;

  RETURN json_build_object('success', true, 'message', 'تم تحديث بيانات الاعتماد بنجاح.');
END;
$$;