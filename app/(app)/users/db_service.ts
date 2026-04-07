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

export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
  const accessToken = await getAccessToken();
  return sasApiCall(
    accessToken,
    "POST",
    "/admin/api/index.php/api/index/user",
    {
      page,
      count,
      sortBy: sortBy || "",
      direction: direction || "",
      search: search || "",
      columns: [
        "id",
        "username",
        "firstname",
        "lastname",
        "profile_id",
        "enabled",
        "expiration",
        "balance",
      ],
    }
  );
}




export async function getProfiles(managerId: number = 0) {
  const accessToken = await getAccessToken();
  return sasApiCall(
    accessToken,
    "GET",
    `/admin/api/index.php/api/list/profile/${managerId}`
  );
}
