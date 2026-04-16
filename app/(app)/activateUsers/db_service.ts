"use server";

import { sasApiCall } from "../../lib/sas-client";



export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
  // 1. Initial Empty Check
  if (!search || search.trim() === "") {
    return {
      success: false,
      error: "Search query cannot be empty."
    };
  }

  const query = search.trim();
  const lowerQuery = query.toLowerCase();

  // 2. ID-Pattern Validation
  // Checks if the search starts with 'h', 'hm', or 'hm0' (case-insensitive)
  const isIdPattern = lowerQuery.startsWith("h") || 
                      lowerQuery.startsWith("hm") || 
                      lowerQuery.startsWith("hm0");

  if (isIdPattern && query.length <= 7) {
    return {
      success: false,
      error: "For ID-based searches (starting with HM0), the input must be more than 7 characters."
    };
  }

  const activateUsers = 3

  // 3. API Call
  const response = await sasApiCall(
    "POST",
    "/admin/api/index.php/api/index/user",
    {
      page,
      count,
      sortBy: sortBy || "",
      direction: direction || "",
      search: query,
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
    activateUsers
  );
  
  return response;
}