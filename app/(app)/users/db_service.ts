"use server";

import { sasApiCall } from "../../lib/sas-client";

const usersId = 2;

export async function getUsers(
  page: number,
  count: number,
  search?: string,
  sortBy?: string,
  direction?: string
) {
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
      usersId
    );

  const query = (search || "").trim();
  const tokens = query.split(/\s+/).filter(Boolean);

  // No search or single token → original behavior, original response shape
  if (tokens.length <= 1) {
    return runSearch(query);
  }

  // Multi-token → one request per token, in parallel
  const responses = await Promise.all(tokens.map((t) => runSearch(t)));

  // Bubble up any failure with its original shape
  const failed = responses.find((r: any) => !r?.success);
  if (failed) return failed;

  // Locate the users array no matter which key the API uses
  const findUsersArray = (resp: any): { container: any; key: string } | null => {
    if (!resp) return null;
    const candidates = [resp, resp.data, resp.result, resp.payload];
    for (const c of candidates) {
      if (!c) continue;
      for (const k of Object.keys(c)) {
        if (
          Array.isArray(c[k]) &&
          (k === "users" || k === "data" || k === "items" || k === "rows")
        ) {
          return { container: c, key: k };
        }
      }
    }
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

  // Intersect by id across every token's result set
  const [firstList, ...restLists] = lists;
  const restIdSets = restLists.map((l) => new Set(l.map((u: any) => u.id)));

  let merged = firstList.filter((u: any) =>
    restIdSets.every((set) => set.has(u.id))
  );

  // Safety: every token must actually match firstname or lastname
  merged = merged.filter((u: any) => {
    const fn = (u.firstname || "").toString().toLowerCase();
    const ln = (u.lastname || "").toString().toLowerCase();
    return tokens.every((t) => {
      const lt = t.toLowerCase();
      return fn.includes(lt) || ln.includes(lt);
    });
  });

  // Clone first response and swap only the users array, keeping the exact original shape
  const template = JSON.parse(JSON.stringify(responses[0]));
  const loc = findUsersArray(template);
  if (loc) {
    loc.container[loc.key] = merged;

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