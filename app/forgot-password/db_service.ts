"use server";

import { createServerSupabaseClient } from "../lib/supabase-server";

// --- REQUEST PASSWORD RESET ACTION (Forgot Password) ---
export async function handleForgotPasswordAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      ok: false,
      message: "البريد الإلكتروني مطلوب.",
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const resetResult = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    });

    if (resetResult.error) {
      console.error("Password Reset Error:", resetResult.error.message);
      return {
        ok: false,
        message:
          "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور. يرجى التأكد من صحة البريد الإلكتروني.",
        redirectTo: null,
      };
    }

    return {
      ok: true,
      message:
        "تم إرسال رابط إعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني.",
      redirectTo: null,
    };
  } catch (error) {
    return {
      ok: false,
      message: "فشلت العملية. يرجى المحاولة لاحقاً.",
      redirectTo: null,
    };
  }
}

// --- UPDATE PASSWORD ACTION (Save New Password) ---
export async function handleUpdatePasswordAction(_prevState: unknown, formData: FormData) {
  const newPassword = String(formData.get("password") || "");

  if (!newPassword) {
    return {
      ok: false,
      message: "كلمة المرور الجديدة مطلوبة.",
      redirectTo: null,
    };
  }

  if (newPassword.length < 6) {
    return {
      ok: false,
      message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
      redirectTo: null,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const updateResult = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateResult.error) {
      console.error("Update Password Error:", updateResult.error.message);
      return {
        ok: false,
        message:
          "حدث خطأ أثناء تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.",
        redirectTo: null,
      };
    }

    return {
      ok: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
      redirectTo: "/login",
    };
  } catch (error) {
    return {
      ok: false,
      message: "فشلت العملية. يرجى المحاولة لاحقاً.",
      redirectTo: null,
    };
  }
}
