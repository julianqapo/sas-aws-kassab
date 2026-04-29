"use server";

import { sasApiCall } from "../../lib/sas-client";

export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
  if (!search || search.trim() === "") {
    return { success: false, error: "Search query cannot be empty." };
  }

  const query = search.trim();
  const lowerQuery = query.toLowerCase();

  const isIdPattern =
    lowerQuery.startsWith("h") ||
    lowerQuery.startsWith("hm") ||
    lowerQuery.startsWith("hm0");

  if (isIdPattern && query.length <= 7) {
    return {
      success: false,
      error:
        "For ID-based searches (starting with HM0), the input must be more than 7 characters.",
    };
  }

  const activateUsers = 3;
  const columns = [
    "id",
    "username",
    "firstname",
    "lastname",
    "profile_id",
    "enabled",
    "expiration",
    "balance",
  ];

  const runSearch = (term: string) =>
    sasApiCall(
      "POST",
      "/admin/api/index.php/api/index/user",
      {
        page,
        count,
        sortBy: sortBy || "",
        direction: direction || "",
        search: term,
        columns,
      },
      activateUsers
    );

  const tokens = query.split(/\s+/).filter(Boolean);

  // Single token → original behavior, original shape
  if (tokens.length === 1) {
    return runSearch(query);
  }

  // Multi-token → run one request per token in parallel
  const responses = await Promise.all(tokens.map((t) => runSearch(t)));

  // If any call failed, return that failure as-is (same shape the UI already handles)
  const failed = responses.find((r: any) => !r?.success);
  if (failed) return failed;

  // Helper to locate the users array inside the response, whatever its key is
  const findUsersArray = (resp: any): { container: any; key: string } | null => {
    if (!resp) return null;
    const candidates = [resp, resp.data, resp.result, resp.payload];
    for (const c of candidates) {
      if (!c) continue;
      for (const k of Object.keys(c)) {
        if (Array.isArray(c[k]) && c[k].length >= 0 && (k === "users" || k === "data" || k === "items" || k === "rows")) {
          return { container: c, key: k };
        }
      }
    }
    // Fallback: first array property we find
    for (const c of candidates) {
      if (!c) continue;
      for (const k of Object.keys(c)) {
        if (Array.isArray(c[k])) return { container: c, key: k };
      }
    }
    return null;
  };

  const lists = responses.map((r: any) => {
    const loc = findUsersArray(r);
    return loc ? (loc.container[loc.key] as any[]) : [];
  });

  // Intersect by id across all token results
  const [firstList, ...restLists] = lists;
  const restIdSets = restLists.map((l) => new Set(l.map((u: any) => u.id)));

  let merged = firstList.filter((u: any) =>
    restIdSets.every((set) => set.has(u.id))
  );

  // Extra safety: ensure every token actually matches firstname or lastname
  merged = merged.filter((u: any) => {
    const fn = (u.firstname || "").toString().toLowerCase();
    const ln = (u.lastname || "").toString().toLowerCase();
    return tokens.every((t) => {
      const lt = t.toLowerCase();
      return fn.includes(lt) || ln.includes(lt);
    });
  });

  // Clone the first response and replace ONLY the users array in-place.
  // This preserves every other field (success, pagination meta, totals, etc.)
  // so the UI keeps working without any changes.
  const template = JSON.parse(JSON.stringify(responses[0]));
  const loc = findUsersArray(template);
  if (loc) {
    loc.container[loc.key] = merged;

    // If the response carries a count/total field, update it to reflect merged length
    for (const metaKey of ["total", "count", "totalCount", "recordsTotal"]) {
      if (loc.container[metaKey] !== undefined) {
        loc.container[metaKey] = merged.length;
      }
      if (template[metaKey] !== undefined) {
        template[metaKey] = merged.length;
      }
    }
  }

  return template;
}