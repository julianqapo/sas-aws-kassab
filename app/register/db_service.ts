"use server";

import { createServerSupabaseClient } from "../lib/supabase-server";

/**
 * --- ADMIN SIGN UP ACTION ---
 * Creates a Supabase Auth user and initializes their 'admin' table record.
 */
export async function handleSignUpAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { 
      ok: false, 
      message: "Email and password are required.", 
      redirectTo: null 
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Attempt Supabase Auth Sign Up
    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return { ok: false, message: signUpResult.error.message, redirectTo: null };
    }

    let session = signUpResult.data?.session;

    // In Next.js SSR, Supabase signUp might return a null session even if email verification is disabled.
    // If we have a user but no session, we explicitly sign them in to establish the session cookies.
    if (!session && signUpResult.data?.user) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      session = signInResult.data?.session;
    }

    // 2. If a session is returned (Auto-login enabled in Supabase)
    if (session) {
      // Execute the RPC to create the admin profile record
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_admin_profile");

      if (rpcError || (rpcData && rpcData.success === false)) {
        console.error("Admin Profile Creation Error:", rpcError?.message || rpcData?.message);

        // Security: Sign out if the profile creation fails
        await supabase.auth.signOut();
        return {
          ok: false,
          message: rpcData?.message || "Account created, but failed to initialize admin profile. Please try again.",
          redirectTo: null,
        };
      }

      return {
        ok: true,
        message: "Account created successfully.",
        redirectTo: "/dashboard",
      };
    } else {
      // Handles case where Email Confirmation is required (Session is null)
      return { 
        ok: true, 
        message: "Account created. Check your email to confirm before logging in.", 
        redirectTo: null 
      };
    }
  } catch (error: any) {
    return { 
      ok: false, 
      message: error instanceof Error ? error.message : "Authentication failed.", 
      redirectTo: null 
    };
  }
}

/**
 * --- STAFF SIGN UP ACTION ---
 * Creates a Supabase Auth user and verifies they exist in the 'staff' table via RPC.
 */
export async function handleStaffSignUpAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, message: "البريد الإلكتروني وكلمة المرور مطلوبان.", redirectTo: null };
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Attempt Supabase Auth Sign Up
    const signUpResult = await supabase.auth.signUp({ email, password });

    if (signUpResult.error) {
      return { 
        ok: false, 
        message: "حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من البيانات والمحاولة مرة أخرى.", 
        redirectTo: null 
      };
    }

    let session = signUpResult.data?.session;

    // In Next.js SSR, Supabase signUp might return a null session even if email verification is disabled.
    // Explicitly sign them in to establish the session cookies if needed.
    if (!session && signUpResult.data?.user) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      session = signInResult.data?.session;
    }

    // 2. If a session is returned
    if (session) {
      // Verify staff eligibility via RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc("staff_signin");

      if (rpcError || (rpcData && rpcData.success === false)) {
        await supabase.auth.signOut();
        return {
          ok: false,
          message: rpcData?.message || "هذا المستخدم غير مرتبط بشركة أو غير مسجل.",
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
        message: "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.", 
        redirectTo: null 
      };
    }
  } catch (error: any) {
    return { ok: false, message: "فشلت عملية المصادقة.", redirectTo: null };
  }
}