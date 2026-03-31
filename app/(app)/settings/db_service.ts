"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";

export async function getCredential() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("credential")
    .select("username, password")
    .eq("id_admin", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return { username: data.username, password: data.password };
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
