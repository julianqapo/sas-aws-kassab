"use server";

import { createServerSupabaseClient, isAdmin } from "../lib/supabase-server";

// --- ADMIN SIGN UP ACTION ---
export async function handleSignUpAction(_prevState: unknown, formData: FormData) {
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

    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return {
        ok: false,
        message: signUpResult.error.message,
        redirectTo: null,
      };
    }

    if (signUpResult.data?.session) {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_admin_profile",
      );

      if (rpcError || (rpcData && rpcData.success === false)) {
        console.error(
          "Admin Profile Creation Error:",
          rpcError?.message || rpcData?.message,
        );

        await supabase.auth.signOut();
        return {
          ok: false,
          message:
            rpcData?.message ||
            "Account created, but failed to initialize admin profile. Please try again.",
          redirectTo: null,
        };
      }

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
        message: "Account created and logged in.",
        redirectTo: "/dashboard",
      };
    }

    return {
      ok: true,
      message:
        "Account created. Check your email to confirm before logging in.",
      redirectTo: null,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Authentication failed.",
      redirectTo: null,
    };
  }
}

// --- STAFF SIGN UP ACTION ---
export async function handleStaffSignUpAction(_prevState: unknown, formData: FormData) {
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

    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return {
        ok: false,
        message:
          "حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من البيانات والمحاولة مرة أخرى.",
        redirectTo: null,
      };
    }

    if (signUpResult.data?.session) {
      const { data: rpcData, error: rpcError } =
        await supabase.rpc("staff_signin");

      if (rpcError || (rpcData && rpcData.success === false)) {
        console.error(
          "Staff Verification Error:",
          rpcError?.message || rpcData?.message,
        );

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
        message: "تم إنشاء الحساب وتسجيل الدخول بنجاح.",
        redirectTo: "/dashboard",
      };
    }

    return {
      ok: true,
      message:
        "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.",
      redirectTo: null,
    };
  } catch (error) {
    return {
      ok: false,
      message: "فشلت عملية المصادقة.",
      redirectTo: null,
    };
  }
}
