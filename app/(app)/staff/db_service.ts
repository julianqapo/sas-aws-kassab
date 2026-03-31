"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";

export async function getStaffWithPermissions() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_staff_with_permissions");
 console.log(data);
console.log(error);
  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return data as {
    success: boolean;
    message: string;
    data: {
      id: string;
      email: string;
      full_name: string;
      is_active: boolean;
      permissions: { id: number; name: string }[];
    }[];
  };
}

export async function getAllPermissions() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_all_permissions");

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return data as {
    success: boolean;
    message: string;
    data: { id: number; name: string }[];
  };
}

export async function manageStaffAndPermissions(
  email: string,
  fullName: string,
  isActive: boolean,
  permissions: number[]
) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("manage_staff_and_permissions", {
    p_staff_email: email,
    p_full_name: fullName,
    p_is_active: isActive,
    p_permissions: permissions,
  });
 

  if (error) {
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}
