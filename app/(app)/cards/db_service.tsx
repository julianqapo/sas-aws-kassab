"use server";

import { sasApiCall } from "../../lib/sas-client"; // Adjust this import to point to your proxy file

export async function getSeries(page = 1, count = 500, search = "", sortBy = "series_date", direction = "desc") {
  const payload = {
    page: page,
    count: count,
    sortBy: sortBy,
    direction: direction,
    search: search,
    columns: [
      "series", 
      "type", 
      "value", 
      "qty", 
      "used", 
      "expiration"
    ]
  };

  // We use the proxy we built earlier to handle the token and forwarding!
  return await sasApiCall("POST", "/admin/api/index.php/api/index/series", payload);
}