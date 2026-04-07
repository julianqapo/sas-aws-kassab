"use server";

import { sasApiCall } from "../../lib/sas-client";


export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
  const response = await sasApiCall(
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
  return response;
}




export async function getProfiles(managerId: number = 0) {
  return sasApiCall(
    "GET",
    `/admin/api/index.php/api/list/profile/${managerId}`
  );
}
