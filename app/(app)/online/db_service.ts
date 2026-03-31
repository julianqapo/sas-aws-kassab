"use server";

import { createServerSupabaseClient } from "../../lib/supabase-server";
import { sasApiCall } from "../../lib/sas-client";

async function getAccessToken() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("Not authenticated");
  }
  return accessToken;
}

export async function getOnlineUsers(
  page: number,
  count: number,
  search?: string
) {
  const accessToken = await getAccessToken();
  return sasApiCall(
    accessToken,
    "POST",
    "/admin/api/index.php/api/index/online",
    {
      page,
      count,
      sortBy: "",
      direction: "",
      search: search || "",
    }
  );
}

export async function pingUser(userId: number, nasId: number) {
  const accessToken = await getAccessToken();
  return sasApiCall(
    accessToken,
    "POST",
    "/admin/api/index.php/api/user/ping",
    {
      user_id: userId,
      nas_id: nasId,
    }
  );
}
