"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";

const settingId = 6

export async function getCredential() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }
  

  const { data, error } = await supabase.rpc("read_credential")
//   const res = await supabase.functions.invoke("admin-login")
  // console.log(data)

  if (error || !data) {
    return "حدث خطا في تحميل البيانات";
  }

  

  return data;

  // return { username: data.username, password: data.password };
}

export async function saveCredential(username: string, password: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("insert_credential", {
    p_username: username,
    p_password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}

export async function updateCredential(username: string, password: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("update_credential", {
    p_username: username,
    p_password: password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}
