"use server";

import { sasApiCall } from "../../lib/sas-client"; // Adjust this import to point to your proxy file

const cardId = 4
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
  return await sasApiCall("POST", "/admin/api/index.php/api/index/series", payload, cardId);
}


export async function getProfileStats() {
  // 1. Fetch all series records (using a high count to get the full picture)
  const result = await sasApiCall("POST", "/admin/api/index.php/api/index/series", {
    page: 1,
    count: 1000, 
    columns: ["qty", "used"] // We only need these for the math
  }, cardId);

  if (!result.success || !result.data || !Array.isArray(result.data.data)) {
    throw new Error(result.error || "Failed to fetch data for grouping");
  }

  const allSeries = result.data.data;

  // 2. Use a Map to group by Profile Name
  const statsMap = new Map<string, number>();

  allSeries.forEach((item: any) => {
    const profileName = item.profile_details?.name || "Unknown Profile";
    const qty = Number(item.qty) || 0;
    const used = Number(item.used) || 0;
    const left = qty - used;

    const currentTotal = statsMap.get(profileName) || 0;
    statsMap.set(profileName, currentTotal + left);
  });

  // 3. Convert Map back to the requested list format
  return Array.from(statsMap, ([profile_name, quantity_left]) => ({
    profile_name,
    quantity_left,
  }));
}