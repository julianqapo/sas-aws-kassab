"use server";

import CryptoJS from 'crypto-js';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from "./supabase-server"; // Adjust path to your setup

// --- Helper 1: Token Expiration Check ---
function isTokenExpired(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(decodedJson);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < (currentTimeInSeconds + 300); // 5-minute buffer
  } catch (error) {
    return true; 
  }
}

// --- Helper 2: Smart Token Manager (with DB Lookup) ---
async function getDynamicSas4Token(adminId: number, supabase: any) {
  const cookieStore = await cookies();
  const cookieName = `sas4_admin_token_${adminId}`;
  
  // 1. Check if we already have a valid cookie for this specific admin
  const existingToken = cookieStore.get(cookieName)?.value;
  if (existingToken && !isTokenExpired(existingToken)) {
    console.log(`[Proxy] Using cached token for Admin ID: ${adminId}`);
    return existingToken;
  }

  // 2. Token missing or expired. Fetch credentials from DB.
  console.log(`[Proxy] Fetching new token for Admin ID: ${adminId}...`);
  const { data: cred, error: credError } = await supabase
    .from('credential')
    .select('username, password')
    .eq('id_admin', adminId)
    .single();

  if (credError || !cred) {
    throw new Error('SAS4 credentials not found. Please set them in Settings.');
  }

  const secretKey = process.env.SECRET_KEY;
  const baseUrl = process.env.BASE_URL;
  if (!secretKey || !baseUrl) throw new Error("Server configuration error: Missing environment variables.");

  // 3. Encrypt payload and fetch new token from SAS4
  const loginForm = {
    username: cred.username,
    password: cred.password,
    language: 'en',
  };
  
  const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(loginForm), secretKey).toString();
  const formData = new URLSearchParams();
  formData.append('payload', encryptedText);

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const loginRes = await fetch(`${cleanBaseUrl}/admin/api/index.php/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    cache: 'no-store'
  });

  if (!loginRes.ok) throw new Error(`SAS4 login failed with status: ${loginRes.status}`);
  
  const responseText = await loginRes.text();
  const token = JSON.parse(responseText).token;
  
  if (!token) throw new Error("Login succeeded but no token returned.");

  // 4. Cache the new token in the browser securely
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

// --- Main Export: The SAS4 Proxy Action ---
export async function sasApiCall(
  method: 'GET' | 'POST' | 'DELETE', 
  path: string, 
  body?: Record<string, unknown>,
  permission?: number
) {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Validate Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User is not authenticated.', status: 401 };
    }

    

    // 2. Check admin permission via get_user_admin_info()
    const { data: roleData, error: roleError } = await supabase.rpc('get_user_admin_info');
    if (roleError) {
      return { success: false, error: 'Failed to verify permissions: ' + roleError.message, status: 500 };
    }

    if (!roleData || !roleData.admin_id) {
      return { success: false, error: 'ليس لديك صلاحية لإجراء هذه العملية.', status: 403 };
    }

    if (roleData.is_admin == false){
      // check permission 
    const { data: permissionData, error: permissionError } = await supabase.rpc('has_permission', { p_permission_id: permission });
    if (permissionError) {
      return { success: false, error: 'Failed to verify permissions: ' + permissionError.message, status: 500 };
    }
    if (!permissionData) {
      return { success: false, error: 'ليس لديك صلاحية لإجراء هذه العملية.', status: 403 };
    }
    }

    const adminId = roleData.admin_id;

    // 3. Retrieve the SAS4 Token (Using the Smart Cookie Manager)
    const sasToken = await getDynamicSas4Token(adminId, supabase);

    // 4. Prepare the forward request
    const secretKey = process.env.SECRET_KEY!;
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '');
    const targetUrl = `${baseUrl}${path}`;

    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${sasToken}`,
      },
      cache: 'no-store'
    };

    // 5. Encrypt the body if it is a POST request
    if (method === 'POST' && body) {
      const encryptedBody = CryptoJS.AES.encrypt(JSON.stringify(body), secretKey).toString();
      const formData = new URLSearchParams();
      formData.append('payload', encryptedBody);
      
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      fetchOptions.body = formData.toString();
    } else if (method === 'POST' && !body) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
    }

    // 6. Execute the forward request
    const sasResponse = await fetch(targetUrl, fetchOptions);
    
    // 7. Safely parse the response
    const contentType = sasResponse.headers.get('content-type') || '';
    let responseData: any;
    
    if (contentType.includes('application/json')) {
      responseData = await sasResponse.json();
    } else {
      const text = await sasResponse.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { raw: text };
      }
    }

    if (!sasResponse.ok) {
      return { success: false, error: `SAS4 API Error: ${sasResponse.status}`, detail: responseData, status: sasResponse.status };
    }

    return { success: true, data: responseData, status: sasResponse.status };

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return { success: false, error: error.message || "Unknown error occurred.", status: 500 };
  }
}