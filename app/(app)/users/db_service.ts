"use server";

import { sasApiCall } from "../../lib/sas-client";

const usersId = 2

export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
  console.log("sortby", sortBy)
  console.log("direction", direction)
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
    },
    usersId

  );
  // console.log(response);
  return response;
}




