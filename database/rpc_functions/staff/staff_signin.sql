CREATE OR REPLACE FUNCTION staff_signin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- يضمن تنفيذ الدالة بصلاحيات للوصول إلى الجداول متجاوزاً RLS
SET search_path = public
AS $$
DECLARE
  _email text;
  _is_active boolean;
BEGIN
  -- استخراج البريد الإلكتروني مباشرة من الجلسة الموثقة (Session)
  _email := auth.jwt() ->> 'email';

  -- التحقق من وجود البريد الإلكتروني في الجلسة
  IF _email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'البريد الإلكتروني غير متوفر في الجلسة الحالية.'
    );
  END IF;

  -- التحقق مما إذا كان الموظف موجوداً ونشطاً
  SELECT EXISTS (
    SELECT 1 FROM staff WHERE email = _email AND is_active = true
  ) INTO _is_active;

  -- إرجاع النتيجة بناءً على حالة الموظف
  IF _is_active THEN
    RETURN json_build_object(
      'success', true,
      'message', 'تم التحقق بنجاح.'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'هذا المستخدم غير مرتبط بشركة أو غير مسجل.'
    );
  END IF;
END;
$$;



  -- SELECT EXISTS (
  --   SELECT 1 FROM staff WHERE email = 'julian@gmail.com' AND active = true
  -- ) INTO _is_active;
