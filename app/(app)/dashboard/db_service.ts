"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";
import { sasApiCall } from "../../lib/sas-client";

export async function getDashboardData() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return sasApiCall(accessToken, "GET", "/admin/api/index.php/api/dashboard");
}

export async function getOnlineUsersCount() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const result = await sasApiCall(
    accessToken,
    "POST",
    "/admin/api/index.php/api/index/online",
    { page: 1, count: 1, sortBy: "", direction: "", search: "" }
  );

  return result?.total ?? 0;
}
