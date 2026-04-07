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