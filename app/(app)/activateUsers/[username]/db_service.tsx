'use server';
// start here
import CryptoJS from 'crypto-js';
import { cookies } from 'next/headers';

// Helper to check if token is expired (or about to expire in the next 5 mins)
// ########################################################
// THis is only for (clients) not the staff 
function isTokenExpired(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(decodedJson);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < (currentTimeInSeconds + 300); 
  } catch (error) {
    return true; // If we can't parse it, assume it's expired
  }
}

/**
 * 1. The Smart Token Manager
 */
/**
 * 1. The Smart Token Manager
 */
// THis is only for (clients) not the staff 
// #########################################################
export async function getSmartToken(username: string) {
  // FIX: Added 'await' because cookies() is async in Next.js 15+
  const cookieStore = await cookies(); 
  const cookieName = `sas4_token_${username}`;
  
  // Check if we have a valid cookie
  const existingToken = cookieStore.get(cookieName)?.value;
  if (existingToken && !isTokenExpired(existingToken)) {
    return existingToken;
  }

  // If missing or expired, fetch a new one
  const secretKey = process.env.SECRET_KEY;
  const baseUrl = process.env.BASE_URL;
  if (!secretKey || !baseUrl) throw new Error("Server environment variables missing.");

  const rawData = JSON.stringify({ username, password: "2211", language: "en" });
  const encryptedText = CryptoJS.AES.encrypt(rawData, secretKey).toString();
  
  const formData = new URLSearchParams();
  formData.append('payload', encryptedText);

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const response = await fetch(`${cleanBaseUrl}/user/api/index.php/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
    cache: 'no-store'
  });

  if (!response.ok) throw new Error(`SAS4 Login Failed: ${response.status}`);
  
  const responseText = await response.text();
  const token = JSON.parse(responseText).token;
  
  if (!token) throw new Error("No token returned from SAS4.");

  // Save securely to cookies (7 days, HTTP-only)
  // Since cookieStore was awaited, .set() will now work perfectly
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return token;
}

/**
 * 2. The Main Dashboard Fetcher
 * Your client component calls this function directly!
 */
export async function loginUser(username: string) {
  try {
    // Get the token (instantly from cookie, or fetches a new one)
    const token = await getSmartToken(username);
    
    const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
    const fetchOptions = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      cache: 'no-store' as RequestCache
    };

    // Fetch the 3 endpoints simultaneously
    const [userRes, dashboardRes, serviceRes] = await Promise.all([
      fetch(`${baseUrl}/user/api/index.php/api/user`, fetchOptions),
      fetch(`${baseUrl}/user/api/index.php/api/dashboard`, fetchOptions),
      fetch(`${baseUrl}/user/api/index.php/api/service`, fetchOptions)
    ]);

    const userData = userRes.ok ? await userRes.json() : null;
    const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
    const serviceData = serviceRes.ok ? await serviceRes.json() : null;

    return { 
      success: true, 
      data: { user: userData, dashboard: dashboardData, service: serviceData } 
    };

  } catch (error: any) {
    console.error("Dashboard Fetch Error:", error);
    return { success: false, error: error.message };
  }
}

// end here


// ########################################################
// fetching the avilable cards
// # ########################################################
import { sasApiCall } from '@/app/lib/sas-client';

export async function getOldestAvailableSeries() {
  const payload = {
    page: 1,
    count: 1000, // Fetch a large batch to ensure we find available stock
    sortBy: "series_date",
    direction: "asc", // "asc" ensures the OLDEST records come first
    search: "",
    columns: [
      "series", 
      "type", 
      "value", 
      "qty", 
      "used", 
      "username", 
      "name", 
      "expiration", 
      "series_date"
    ]
  };

  try {
    const result = await sasApiCall("POST", "/admin/api/index.php/api/index/series", payload);

    if (!result.success || !result.data || !Array.isArray(result.data.data)) {
      throw new Error(result.error || "Failed to fetch series data");
    }

    const allRows = result.data.data;
    
    // Use a Map to keep only the UNIQUE oldest row per 'value'
    const uniqueValueMap = new Map();

    allRows.forEach((row: any) => {
      const qty = Number(row.qty) || 0;
      const used = Number(row.used) || 0;
      const value = row.value;

      // 1. Only process rows that have stock left
      // 2. Only add to Map if we haven't seen this 'value' yet
      // Because the list is sorted by oldest date, the first one we find is the oldest
      if (used < qty && !uniqueValueMap.has(value)) {
        uniqueValueMap.set(value, {
          ...row,
          quantity_left: qty - used
        });
      }
    });

    // // Convert Map back to an array
    // return Array.from(uniqueValueMap.values());
    // Convert Map to array AND sort by 'value'
    return Array.from(uniqueValueMap.values()).sort((a, b) => 
      // alphanumeric sort ensures 10 comes after 2
      String(a.value).localeCompare(String(b.value), undefined, { numeric: true, sensitivity: 'base' })
    );

  } catch (error) {
    console.error("Error fetching oldest series:", error);
    throw error;
  }
}


// ########################################################
// get first available PIN
/**
 * Fetches the first available (unused) PIN from a specific card series.
 * @param series The series ID/name (e.g., "NOVA-40")
 * @returns The PIN string or null if no unused cards are found.
 */
export async function getFirstAvailablePin(series: string): Promise<string | null> {
  const payload = {
    page: 1,
    count: 50, // Fetch a small batch to find at least one unused card
    sortBy: "used_at",
    direction: "asc",
    search: "",
    columns: [
      "id",
      "serialnumber",
      "pin",
      "username",
      "password",
      "used_at"
    ]
  };

  try {
    // API endpoint includes the series parameter in the URL
    const endpoint = `/admin/api/index.php/api/index/card/${series}`;
    const result = await sasApiCall("POST", endpoint, payload);

    if (!result.success || !result.data || !Array.isArray(result.data.data)) {
      throw new Error(result.error || "Failed to fetch cards for this series");
    }

    const cards = result.data.data;

    // Find the first card where used_at is null, undefined, or an empty string
    const availableCard = cards.find((card: any) => {
      return !card.used_at || card.used_at === "" || card.used_at === "0000-00-00 00:00:00";
    });

    if (availableCard && availableCard.pin) {
      return availableCard.pin;
    }

    // Return null if no unused card is found in the batch
    return null;

  } catch (error) {
    console.error(`Error fetching PIN for series ${series}:`, error);
    return null;
  }
}



// ########################################################
// activate subscription for a client 
/**
 * Activates a subscription using a PIN for a specific user.
 * @param username The username (used to retrieve the Bearer token)
 * @param pin The card PIN to redeem
 */
export async function activateSubscription(username: string, pin: string) {
  try {
    // 1. Get the Bearer Token for this user
    const token = await getSmartToken(username);
    
    const secretKey = process.env.SECRET_KEY;
    const baseUrl = process.env.BASE_URL;
    
    if (!secretKey || !baseUrl) {
      throw new Error("Server environment variables (SECRET_KEY or BASE_URL) are missing.");
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // 2. Prepare and Encrypt the Payload
    const rawData = JSON.stringify({ pin: pin });
    const encryptedText = CryptoJS.AES.encrypt(rawData, secretKey).toString();
    
    // 3. Format as URLSearchParams (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('payload', encryptedText);

    // 4. Execute the POST request to /api/redeem
    const response = await fetch(`${cleanBaseUrl}/user/api/index.php/api/redeem`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: formData.toString(),
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      return { 
        success: false, 
        error: result.error || result.message || "Failed to redeem PIN." 
      };
    }

    return { 
      success: true, 
      data: result 
    };

  } catch (error: any) {
    console.error("Redemption Error:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during activation." 
    };
  }
}





// ########################################################
// ###################### INVOICES ########################
// ########################################################
/**
 * Fetches the invoice history for a specific user.
 * @param username The username (used to retrieve the Bearer token)
 * @param page The page number to fetch (default: 1)
 * @param count The number of records per page (default: 10)
 */
export async function getUserInvoices(
  username: string,
  page: number = 1,
  count: number = 10
) {
  try {
    const token = await getSmartToken(username);

    const secretKey = process.env.SECRET_KEY;
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl || !secretKey) {
      throw new Error("Server environment variables (SECRET_KEY or BASE_URL) are missing.");
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const invoicePayload = {
      page,
      count,
      sortBy: "id",
      direction: "desc"
    };

    const encryptedPayload = CryptoJS.AES.encrypt(
      JSON.stringify(invoicePayload),
      secretKey
    ).toString();

    const body = new URLSearchParams({
      payload: encryptedPayload
    });

    const response = await fetch(
      `${cleanBaseUrl}/user/api/index.php/api/index/invoice`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
        cache: "no-store"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.message || "Failed to fetch invoices."
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred while fetching invoices."
    };
  }
}



// test starts here
// ########################################################
// extend subscription for a client 
/**
 * extend a subscription for a specific user.
 * @param username The username (used to retrieve the Bearer token)
 * @param pin The card PIN to redeem
 */
export async function extendSubscription(username: string) {
  try {
    // 1. Get the Bearer Token for this user
    const token = await getSmartToken(username);
    
    const secretKey = process.env.SECRET_KEY;
    const baseUrl = process.env.BASE_URL;
    
    if (!secretKey || !baseUrl) {
      throw new Error("Server environment variables (SECRET_KEY or BASE_URL) are missing.");
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // 2. Prepare and Encrypt the Payload
    const rawData = JSON.stringify({ profile_id: "5", current_passoword : true });
    const encryptedText = CryptoJS.AES.encrypt(rawData, secretKey).toString();
    
    // 3. Format as URLSearchParams (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('payload', encryptedText);

    // 4. Execute the POST request to /api/redeem
    const response = await fetch(`${cleanBaseUrl}/user/api/index.php/api/user/extend`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: formData.toString(),
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      return { 
        success: false, 
        error: result.error || result.message || "Failed to extend subscription." 
      };
    }

    return { 
      success: true, 
      data: result 
    };

  } catch (error: any) {
    console.error("Extend Error:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during extending." 
    };
  }
}



// test ends here