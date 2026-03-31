module.exports = [
"[project]/app/lib/supabase-server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createServerSupabaseClient",
    ()=>createServerSupabaseClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://xiswhnthrqzsuxrzdfvt.supabase.co");
const SUPABASE_ANON_KEY = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3dobnRocnF6c3V4cnpkZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDMxNzMsImV4cCI6MjA5MDQ3OTE3M30.CdYc3Qd7Gg69TLuJSnYSrCYRWm2dD8BAHzsF9o_rSpo");
function createServerSupabaseClient() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll: async ()=>{
                const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
                return cookieStore.getAll();
            },
            setAll: async (cookieList)=>{
                const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
                cookieList.forEach(({ name, value, options })=>{
                    cookieStore.set(name, value, options);
                });
            }
        }
    });
}
}),
"[project]/app/register/db_service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"603bfcab358faf0f66907f39b791dfb59bfee9d0dd":"handleStaffSignUpAction","6050ee3070e67501ddd9ae94e748b6d01e7fd1cb9d":"handleSignUpAction"},"",""] */ __turbopack_context__.s([
    "handleSignUpAction",
    ()=>handleSignUpAction,
    "handleStaffSignUpAction",
    ()=>handleStaffSignUpAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/supabase-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function handleSignUpAction(_prevState, formData) {
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
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        // 1. Attempt Supabase Auth Sign Up
        const signUpResult = await supabase.auth.signUp({
            email,
            password
        });
        if (signUpResult.error) {
            return {
                ok: false,
                message: signUpResult.error.message,
                redirectTo: null
            };
        }
        let session = signUpResult.data?.session;
        // In Next.js SSR, Supabase signUp might return a null session even if email verification is disabled.
        // If we have a user but no session, we explicitly sign them in to establish the session cookies.
        if (!session && signUpResult.data?.user) {
            const signInResult = await supabase.auth.signInWithPassword({
                email,
                password
            });
            session = signInResult.data?.session;
        }
        // 2. If a session is returned (Auto-login enabled in Supabase)
        if (session) {
            // Execute the RPC to create the admin profile record
            const { data: rpcData, error: rpcError } = await supabase.rpc("create_admin_profile");
            if (rpcError || rpcData && rpcData.success === false) {
                console.error("Admin Profile Creation Error:", rpcError?.message || rpcData?.message);
                // Security: Sign out if the profile creation fails
                await supabase.auth.signOut();
                return {
                    ok: false,
                    message: rpcData?.message || "Account created, but failed to initialize admin profile. Please try again.",
                    redirectTo: null
                };
            }
            return {
                ok: true,
                message: "Account created successfully.",
                redirectTo: "/dashboard"
            };
        } else {
            // Handles case where Email Confirmation is required (Session is null)
            return {
                ok: true,
                message: "Account created. Check your email to confirm before logging in.",
                redirectTo: null
            };
        }
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Authentication failed.",
            redirectTo: null
        };
    }
}
async function handleStaffSignUpAction(_prevState, formData) {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    if (!email || !password) {
        return {
            ok: false,
            message: "البريد الإلكتروني وكلمة المرور مطلوبان.",
            redirectTo: null
        };
    }
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        // 1. Attempt Supabase Auth Sign Up
        const signUpResult = await supabase.auth.signUp({
            email,
            password
        });
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
            const signInResult = await supabase.auth.signInWithPassword({
                email,
                password
            });
            session = signInResult.data?.session;
        }
        // 2. If a session is returned
        if (session) {
            // Verify staff eligibility via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc("staff_signin");
            if (rpcError || rpcData && rpcData.success === false) {
                await supabase.auth.signOut();
                return {
                    ok: false,
                    message: rpcData?.message || "هذا المستخدم غير مرتبط بشركة أو غير مسجل.",
                    redirectTo: null
                };
            }
            return {
                ok: true,
                message: "تم إنشاء الحساب بنجاح.",
                redirectTo: "/dashboard"
            };
        } else {
            return {
                ok: true,
                message: "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول.",
                redirectTo: null
            };
        }
    } catch (error) {
        return {
            ok: false,
            message: "فشلت عملية المصادقة.",
            redirectTo: null
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    handleSignUpAction,
    handleStaffSignUpAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(handleSignUpAction, "6050ee3070e67501ddd9ae94e748b6d01e7fd1cb9d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(handleStaffSignUpAction, "603bfcab358faf0f66907f39b791dfb59bfee9d0dd", null);
}),
"[project]/.next-internal/server/app/register/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/register/db_service.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$register$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/register/db_service.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/register/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/register/db_service.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "603bfcab358faf0f66907f39b791dfb59bfee9d0dd",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$register$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleStaffSignUpAction"],
    "6050ee3070e67501ddd9ae94e748b6d01e7fd1cb9d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$register$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleSignUpAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$register$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$register$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/register/page/actions.js { ACTIONS_MODULE0 => "[project]/app/register/db_service.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$register$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/register/db_service.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_1fb6f58c._.js.map