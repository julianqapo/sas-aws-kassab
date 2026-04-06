"use server";

import CryptoJS from 'crypto-js';

export async function loginUser(username: string) {
  const secretKey = process.env.SECRET_KEY;
  const baseUrl = process.env.BASE_URL;
  const loginPath = 'user/api/index.php/api/auth/login';

  if (!secretKey || !baseUrl) {
    return { success: false, error: "Server environment variables missing." };
  }

  // 1. Prepare the raw JSON data
  const rawData = JSON.stringify({
    username: username,
    password: "2211",
    language: "en"
  });

  try {
    // 2. Encrypt the data and format as URL-Encoded
    const encryptedText = CryptoJS.AES.encrypt(rawData, secretKey).toString();
    const formData = new URLSearchParams();
    formData.append('payload', encryptedText);

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const fullUrl = `${cleanBaseUrl}/${loginPath}`;

    // 3. Execute the Login Fetch
    const loginResponse = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: 'no-store'
    });

    const responseStatus = loginResponse.status;
    const responseText = await loginResponse.text();

    if (loginResponse.ok) {
      // 4. Parse the successful login and extract the token
      const loginData = JSON.parse(responseText);
      const token = loginData.token;

      if (!token) {
         return { success: false, error: "Login succeeded but no token was returned." };
      }

      // 5. Setup the headers for the authorized GET requests
      const fetchOptions = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Pass the JWT token here
          "Accept": "application/json"
        },
        cache: 'no-store' as RequestCache
      };

      // 6. Fetch the 3 endpoints simultaneously for better performance
      const [userRes, dashboardRes, serviceRes] = await Promise.all([
        fetch(`${cleanBaseUrl}/user/api/index.php/api/user`, fetchOptions),
        fetch(`${cleanBaseUrl}/user/api/index.php/api/dashboard`, fetchOptions),
        fetch(`${cleanBaseUrl}/user/api/index.php/api/service`, fetchOptions)
      ]);

      // 7. Parse the responses
      // We check .ok for each just in case one endpoint fails, so the others still return data
      const userData = userRes.ok ? await userRes.json() : null;
      const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
      const serviceData = serviceRes.ok ? await serviceRes.json() : null;

      // 8. Return everything bundled nicely to the client
      return { 
        success: true, 
        data: {
          user: userData,
          dashboard: dashboardData,
          service: serviceData
        } 
      };
      
    } else {
      console.error("API Error Response:", responseText);
      return { 
        success: false, 
        error: `Server Error ${responseStatus}`,
        detail: responseText 
      };
    }

  } catch (error: any) {
    console.error("Client/Server Action Error:", error);
    return { success: false, error: error.message };
  }
}