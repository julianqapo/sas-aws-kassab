const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/sas-proxy`;

export async function sasApiCall(
  accessToken: string,
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: Record<string, unknown>
) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ method, path, body }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `SAS4 API error: ${response.status}`);
  }

  return response.json();
}
