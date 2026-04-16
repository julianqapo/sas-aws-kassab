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

// --- SMART ADMIN AUTH ACTION (Sign In or Sign Up) ---
export async function handleSmartAdminAuthAction(_prevState: unknown, formData: FormData) {
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

    // 1. Try to sign in first
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign-in succeeds, verify admin — or create admin profile if missing
    if (!signInResult.error && signInResult.data?.session) {
      let allowed = await isAdmin(supabase);

      if (!allowed) {
        // Admin profile doesn't exist yet — try to create it
        // (handles case where user previously signed up as staff only)
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "create_admin_profile"
        );

        if (rpcError || (rpcData && rpcData.success === false)) {
          await supabase.auth.signOut();
          return {
            ok: false,
            message:
              rpcData?.message ||
              "Failed to initialize admin profile. Please try again.",
            redirectTo: null,
          };
        }

        // Re-check after profile creation
        allowed = await isAdmin(supabase);
        if (!allowed) {
          await supabase.auth.signOut();
          return {
            ok: false,
            message:
              "Access denied. Your admin account is inactive or does not exist.",
            redirectTo: null,
          };
        }
      }

      return {
        ok: true,
        message: "Logged in successfully.",
        redirectTo: "/dashboard",
      };
    }

    // 2. If sign-in failed because user doesn't exist, attempt sign-up
    if (
      signInResult.error &&
      signInResult.error.message === "Invalid login credentials"
    ) {
      const signUpResult = await supabase.auth.signUp({ email, password });

      if (signUpResult.error) {
        return {
          ok: false,
          message: signUpResult.error.message,
          redirectTo: null,
        };
      }

      let session = signUpResult.data?.session;

      // Supabase SSR may return null session even with email verification disabled
      if (!session && signUpResult.data?.user) {
        const reSignIn = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        session = reSignIn.data?.session;
      }

      if (session) {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "create_admin_profile"
        );

        if (rpcError || (rpcData && rpcData.success === false)) {
          await supabase.auth.signOut();
          return {
            ok: false,
            message:
              rpcData?.message ||
              "Account created, but failed to initialize admin profile. Please try again.",
            redirectTo: null,
          };
        }

        return {
          ok: true,
          message: "Account created successfully.",
          redirectTo: "/dashboard",
        };
      } else {
        return {
          ok: true,
          message:
            "Account created. Check your email to confirm before logging in.",
          redirectTo: null,
        };
      }
    }

    // 3. Other sign-in errors (wrong password for existing user, etc.)
    return {
      ok: false,
      message: signInResult.error?.message || "Authentication failed.",
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

// --- SMART STAFF AUTH ACTION (Sign In or Sign Up) ---
export async function handleSmartStaffAuthAction(_prevState: unknown, formData: FormData) {
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

    // 1. Try to sign in first
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign-in succeeds, verify staff
    if (!signInResult.error && signInResult.data?.session) {
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

    // 2. If sign-in failed because user doesn't exist, attempt sign-up
    if (
      signInResult.error &&
      signInResult.error.message === "Invalid login credentials"
    ) {
      const signUpResult = await supabase.auth.signUp({ email, password });

      if (signUpResult.error) {
        return {
          ok: false,
          message:
            "حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من البيانات والمحاولة مرة أخرى.",
          redirectTo: null,
        };
      }

      let session = signUpResult.data?.session;

      if (!session && signUpResult.data?.user) {
        const reSignIn = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        session = reSignIn.data?.session;
      }

      if (session) {
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
          message: "تم إنشاء الحساب بنجاح.",
          redirectTo: "/dashboard",
        };
      } else {
        return {
          ok: true,
          message:
            "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.",
          redirectTo: null,
        };
      }
    }

    // 3. Other sign-in errors
    return {
      ok: false,
      message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
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
