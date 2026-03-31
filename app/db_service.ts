"use server";

import { createServerSupabaseClient } from "./lib/supabase-server";

export async function getSessionUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function logoutAction() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
}

export async function isAdmin(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data, error } = await supabase.rpc("login_admin");

  if (error) {
    console.error("RPC Error (login_admin):", error.message);
    return false;
  }

  return Boolean(data);
}

// --- SIGN IN ACTION (Admin) ---
export async function handleSignInAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      ok: false,
      message: "Email and password are required.",
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      return {
        ok: false,
        message: signInResult.error.message,
        redirectTo: null,
      };
    }

    if (signInResult.data?.session) {
      const allowed = await isAdmin(supabase);

      if (!allowed) {
        await supabase.auth.signOut();
        return {
          ok: false,
          message:
            "Access denied. Your admin account is inactive or does not exist.",
          redirectTo: null,
        };
      }

      return {
        ok: true,
        message: "Logged in successfully.",
        redirectTo: "/dashboard",
      };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Authentication failed.",
      redirectTo: null,
    };
  }
}

// --- STAFF SIGN IN ACTION ---
export async function handleStaffSignInAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      ok: false,
      message: "البريد الإلكتروني وكلمة المرور مطلوبان.",
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      return {
        ok: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        redirectTo: null,
      };
    }

    if (signInResult.data?.session) {
      const { data: rpcData, error: rpcError } =
        await supabase.rpc("staff_signin");

      if (rpcError || (rpcData && rpcData.success === false)) {
        await supabase.auth.signOut();
        return {
          ok: false,
          message:
            rpcData?.message || "هذا المستخدم غير مرتبط بشركة أو غير مسجل.",
          redirectTo: null,
        };
      }

      return {
        ok: true,
        message: "تم تسجيل الدخول بنجاح.",
        redirectTo: "/dashboard",
      };
    }
  } catch (error) {
    return {
      ok: false,
      message: "فشلت عملية المصادقة.",
      redirectTo: null,
    };
  }
}
