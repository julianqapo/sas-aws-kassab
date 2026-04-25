"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";

// const activationPasswordId = 6


export async function hasActivationPassword() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("has_activation_password");

  if (error) {
    return { error: true, message: error.message };
  }

  return { hasPassword: !!data, error: false };
}

export async function upsertActivationPassword(oldPassword: string, newPassword: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("upsert_activation_password", {
    p_old_password: oldPassword,
    p_new_password: newPassword,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}


export async function getAdminActivationPasswords() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_admin_activation_passwords");

  if (error) {
    return { success: false, error: true, message: error.message, data: [] };
  }

  return { success: true, error: false, data: data as { email: string, password: string }[] };
}