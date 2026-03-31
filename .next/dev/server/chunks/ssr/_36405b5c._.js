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
"[project]/app/db_service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00d6dcec207f5ce447e74bfb2cfd9e93d2d67cd914":"getSessionUser","00d81a839b757b91bd45951593658b9f2a4e0b15e6":"logoutAction","40b1be0d2225c91aa25d49c445caab4d3d9ea13e89":"isAdmin","6048258c363208368185e6b7f47b8df750e8b462e0":"handleStaffSignInAction","60d50d333a0b4778787bcdf0f0ab2b1b58434f9b19":"handleSignInAction"},"",""] */ __turbopack_context__.s([
    "getSessionUser",
    ()=>getSessionUser,
    "handleSignInAction",
    ()=>handleSignInAction,
    "handleStaffSignInAction",
    ()=>handleStaffSignInAction,
    "isAdmin",
    ()=>isAdmin,
    "logoutAction",
    ()=>logoutAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/supabase-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getSessionUser() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return null;
    }
    return user;
}
async function logoutAction() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$supabase$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
    await supabase.auth.signOut();
}
async function isAdmin(supabase) {
    const { data, error } = await supabase.rpc("login_admin");
    if (error) {
        console.error("RPC Error (login_admin):", error.message);
        return false;
    }
    return Boolean(data);
}
async function handleSignInAction(_prevState, formData) {
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
        const signInResult = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (signInResult.error) {
            return {
                ok: false,
                message: signInResult.error.message,
                redirectTo: null
            };
        }
        if (signInResult.data?.session) {
            const allowed = await isAdmin(supabase);
            if (!allowed) {
                await supabase.auth.signOut();
                return {
                    ok: false,
                    message: "Access denied. Your admin account is inactive or does not exist.",
                    redirectTo: null
                };
            }
            return {
                ok: true,
                message: "Logged in successfully.",
                redirectTo: "/dashboard"
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
async function handleStaffSignInAction(_prevState, formData) {
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
        const signInResult = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (signInResult.error) {
            return {
                ok: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
                redirectTo: null
            };
        }
        if (signInResult.data?.session) {
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
                message: "تم تسجيل الدخول بنجاح.",
                redirectTo: "/dashboard"
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
    getSessionUser,
    logoutAction,
    isAdmin,
    handleSignInAction,
    handleStaffSignInAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSessionUser, "00d6dcec207f5ce447e74bfb2cfd9e93d2d67cd914", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(logoutAction, "00d81a839b757b91bd45951593658b9f2a4e0b15e6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(isAdmin, "40b1be0d2225c91aa25d49c445caab4d3d9ea13e89", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(handleSignInAction, "60d50d333a0b4778787bcdf0f0ab2b1b58434f9b19", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(handleStaffSignInAction, "6048258c363208368185e6b7f47b8df750e8b462e0", null);
}),
"[project]/.next-internal/server/app/(app)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/db_service.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db_service.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/(app)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/db_service.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00d81a839b757b91bd45951593658b9f2a4e0b15e6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logoutAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$app$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(app)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/app/db_service.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db_service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db_service.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_36405b5c._.js.map