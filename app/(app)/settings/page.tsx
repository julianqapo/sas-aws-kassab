"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, Loader2, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { getCredential, saveCredential, updateCredential } from "./db_service";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCredential() {
      try {
        const credential = await getCredential();
        
        console.log(credential);
        if (credential.success) {
          setUsername(credential.username);
          setPassword(credential.password);
          setHasExisting(true);
        }else{
          setError(credential.message);
        }
      } catch {
        setError("لا تملك الصلاحيات الكافية لعرض هذه الصفحة");
      } finally {
        setLoading(false);
      }
    }
    loadCredential();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = hasExisting
        ? await updateCredential(username, password)
        : await saveCredential(username, password);

      setMessage({ text: result.message, success: result.success });

      if (result.success && !hasExisting) {
        setHasExisting(true);
      }
    } catch {
      setMessage({ text: "حدث خطأ غير متوقع", success: false });
    } finally {
      setSaving(false);
    }
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl border-red-200 dark:border-red-900">
          <CardContent className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <p className="font-bold text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your application preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              بيانات الاعتماد
            </CardTitle>
            <CardDescription>
              إدارة بيانات الاعتماد الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="size-4 animate-spin" />
                <span>جاري التحميل...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="pr-10 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {message && (
                  <p
                    className={
                      message.success
                        ? "text-green-600 dark:text-green-400 text-sm"
                        : "text-red-600 dark:text-red-400 text-sm"
                    }
                  >
                    {message.text}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
