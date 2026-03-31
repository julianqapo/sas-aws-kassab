"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function createServerSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase credentials are missing in .env.local");
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: async () => {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      setAll: async (cookieList) => {
        const cookieStore = await cookies();

        cookieList.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

// Updated to use your new login_admin RPC
async function isAdmin(supabase) {
  const { data, error } = await supabase.rpc("login_admin");

  if (error) {
    console.error("RPC Error (login_admin):", error.message);
    return false;
  }

  return Boolean(data);
}

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
  redirect("/");
}

// --- SIGN UP ACTION ---
export async function handleSignUpAction(_prevState, formData) {
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

    // 1. Attempt purely sign-up
    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return {
        ok: false,
        message: signUpResult.error.message,
        redirectTo: null,
      };
    }

    // 2. Handle successful sign-up and auto-login
    if (signUpResult.data?.session) {
      // --- EXECUTE RPC HERE ---
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_admin_profile",
      );

      // If the RPC fails, or returns our custom 'success: false' payload, abort and signout.
      if (rpcError || (rpcData && rpcData.success === false)) {
        console.error(
          "Admin Profile Creation Error:",
          rpcError?.message || rpcData?.message,
        );

        // Rollback the session so they aren't stuck in a broken state
        await supabase.auth.signOut();
        return {
          ok: false,
          message:
            rpcData?.message ||
            "Account created, but failed to initialize admin profile. Please try again.",
          redirectTo: null,
        };
      }
      // ------------------------

      // Double check they have an active admin profile
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

    // 3. Handle successful sign-up where email confirmation is required
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

// --- SIGN IN ACTION ---
export async function handleSignInAction(_prevState, formData) {
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

    // 1. Log the user into Supabase Auth
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

    // 2. Check if they have an active admin profile
    if (signInResult.data?.session) {
      const allowed = await isAdmin(supabase);

      // 3. If the RPC returned false, sign them out immediately
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

// do not touch the code above, only add function that will signin and another to signup the staff
// --- STAFF SIGN UP ACTION ---

// --- STAFF SIGN UP ACTION ---
export async function handleStaffSignUpAction(_prevState, formData) {
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

    // 1. Attempt purely sign-up
    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return {
        ok: false,
        // Fallback to a generic Arabic error if Supabase throws an English one
        message:
          "حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من البيانات والمحاولة مرة أخرى.",
        redirectTo: null,
      };
    }

    // 2. Handle successful sign-up and auto-login
    if (signUpResult.data?.session) {
      // Verify they are an active staff member using the RPC
      const { data: rpcData, error: rpcError } =
        await supabase.rpc("staff_signin");

      // If the RPC fails, or returns success: false, abort and signout.
      if (rpcError || (rpcData && rpcData.success === false)) {
        console.error(
          "Staff Verification Error:",
          rpcError?.message || rpcData?.message,
        );

        // Rollback the session
        await supabase.auth.signOut();
        return {
          ok: false,
          // Uses the Arabic message returned from your PostgreSQL function, or a default Arabic fallback
          message:
            rpcData?.message || "هذا المستخدم غير مرتبط بشركة أو غير مسجل.",
          redirectTo: null,
        };
      }

      return {
        ok: true,
        message: "تم إنشاء الحساب وتسجيل الدخول بنجاح.",
        redirectTo: "/dashboard", // Adjust this if staff have a different dashboard path
      };
    }

    // 3. Handle successful sign-up where email confirmation is required
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

// --- STAFF SIGN IN ACTION ---
export async function handleStaffSignInAction(_prevState, formData) {
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

    // 1. Log the user into Supabase Auth
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

    // 2. Check if they are an active staff member
    if (signInResult.data?.session) {
      const { data: rpcData, error: rpcError } =
        await supabase.rpc("staff_signin");

      // 3. If the RPC returned false or errored, sign them out immediately
      if (rpcError || (rpcData && rpcData.success === false)) {
        await supabase.auth.signOut();
        return {
          ok: false,
          // Uses the Arabic message returned from your PostgreSQL function
          message:
            rpcData?.message || "هذا المستخدم غير مرتبط بشركة أو غير مسجل.",
          redirectTo: null,
        };
      }

      return {
        ok: true,
        message: "تم تسجيل الدخول بنجاح.",
        redirectTo: "/dashboard", // Adjust this if staff have a different dashboard path
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

// --- REQUEST PASSWORD RESET ACTION (Forgot Password) ---
export async function handleForgotPasswordAction(_prevState, formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      ok: false,
      message: "البريد الإلكتروني مطلوب.", // "Email is required."
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Send the password reset email.
    // The redirectTo URL determines where the user goes AFTER clicking the link in their email.
    // Make sure to replace this with your actual app URL (e.g., process.env.NEXT_PUBLIC_SITE_URL + "/update-password")
    const resetResult = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    });

    if (resetResult.error) {
      console.error("Password Reset Error:", resetResult.error.message);
      return {
        ok: false,
        message:
          "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور. يرجى التأكد من صحة البريد الإلكتروني.", // "Error sending reset link. Please verify the email."
        redirectTo: null,
      };
    }

    return {
      ok: true,
      message:
        "تم إرسال رابط إعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني.", // "Reset link sent. Please check your email."
      redirectTo: null,
    };
  } catch (error) {
    return {
      ok: false,
      message: "فشلت العملية. يرجى المحاولة لاحقاً.", // "Operation failed. Please try again later."
      redirectTo: null,
    };
  }
}

// --- UPDATE PASSWORD ACTION (Save New Password) ---
// This function should be called from the page the user lands on AFTER clicking the email link.
export async function handleUpdatePasswordAction(_prevState, formData) {
  const newPassword = String(formData.get("password") || "");

  if (!newPassword) {
    return {
      ok: false,
      message: "كلمة المرور الجديدة مطلوبة.", // "New password is required."
      redirectTo: null,
    };
  }

  if (newPassword.length < 6) {
    return {
      ok: false,
      message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.", // "Password must be at least 6 characters."
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Update the user's password.
    // This works because clicking the email link securely logs the user in temporarily.
    const updateResult = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateResult.error) {
      console.error("Update Password Error:", updateResult.error.message);
      return {
        ok: false,
        message:
          "حدث خطأ أثناء تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.", // "Error updating password. The link might be expired."
        redirectTo: null,
      };
    }

    // Optional: Sign the user out immediately after changing the password, forcing them to log in normally.
    // await supabase.auth.signOut();

    return {
      ok: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.", // "Password updated successfully. You can now log in."
      redirectTo: "/login", // Redirect them to your main login page
    };
  } catch (error) {
    return {
      ok: false,
      message: "فشلت العملية. يرجى المحاولة لاحقاً.", // "Operation failed. Please try again later."
      redirectTo: null,
    };
  }
}
