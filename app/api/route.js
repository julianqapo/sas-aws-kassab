import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(request) {
  try {
    const { user, password } = await request.json();

    // The specific key provided in your snippet
    const key = "abcdefghijuklmno0123456789012345";
    const form = { user, password };

    // Your original logic used the default OpenSSL-compatible encryption
    // This generates a Salt, Key, and IV automatically from the string.
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(form), key);
    const encryptedData = encrypted.toString();

    const externalUrl = "http://91.192.6.230/admin/api/index.php/api/login";

    const response = await fetch(externalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: encryptedData,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
