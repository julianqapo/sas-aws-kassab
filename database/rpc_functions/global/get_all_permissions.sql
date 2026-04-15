CREATE OR REPLACE FUNCTION get_all_permissions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _permissions json;
BEGIN
  -- 1. Fetch all permissions from the access_list table
  SELECT json_agg(json_build_object('id', id, 'name', name))
  INTO _permissions
  FROM access_list;

  -- If the table is completely empty, return an empty array instead of null
  IF _permissions IS NULL THEN
    _permissions := '[]'::json;
  END IF;

  -- (History logging removed for Read requests)

  -- 2. Return the successful payload
  RETURN json_build_object(
    'success', true,
    'message', 'تم جلب قائمة الصلاحيات بنجاح.',
    'data', _permissions
  );
END;
$$;