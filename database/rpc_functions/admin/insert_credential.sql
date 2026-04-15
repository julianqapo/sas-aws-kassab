CREATE OR REPLACE FUNCTION insert_credential(p_username text, p_password text)
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
  -- 1. Check if the user has an active session and is an admin
  IF _uid IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'يرجى تسجيل الدخول أولاً.');
  END IF;

  SELECT EXISTS (SELECT 1 FROM admin WHERE id = _uid) INTO _is_admin;
  
  IF NOT _is_admin THEN
    RETURN json_build_object('success', false, 'message', 'ليس لديك صلاحية لإجراء هذه العملية.');
  END IF;

  -- 2. Check if username and password are provided and not just empty spaces
  IF p_username IS NULL OR trim(p_username) = '' OR p_password IS NULL OR trim(p_password) = '' THEN
    RETURN json_build_object('success', false, 'message', 'اسم المستخدم وكلمة المرور مطلوبان ولا يمكن ترك الحقول فارغة.');
  END IF;

  -- 3. Check if a credential record already exists for this admin
  SELECT EXISTS (SELECT 1 FROM credential WHERE id_admin = _uid) INTO _exists;
  
  IF _exists THEN
    RETURN json_build_object('success', false, 'message', 'لديك بيانات اعتماد مسجلة بالفعل. يرجى تحديثها بدلاً من إضافة بيانات جديدة.');
  END IF;

  -- 4. Insert the new record
  INSERT INTO credential (id_admin, username, password)
  VALUES (_uid, p_username, p_password);

  RETURN json_build_object('success', true, 'message', 'تم حفظ بيانات الاعتماد بنجاح.');
END;
$$;