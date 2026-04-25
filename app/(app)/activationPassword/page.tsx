"use client";

import { useState, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  Package, 
  ShieldCheck,
  KeyRound,
  Mail,
  Copy,
  Check
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { 
  hasActivationPassword, 
  upsertActivationPassword,
  getAdminActivationPasswords 
} from "./db_service";

type PasswordRecord = {
  email: string;
  password: string;
};

export default function ActivationPasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  // --- New States for Staff Passwords ---
  const [staffRecords, setStaffRecords] = useState<PasswordRecord[] | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        // Run both fetches simultaneously
        const [statusResult, adminResult] = await Promise.all([
          hasActivationPassword(),
          getAdminActivationPasswords()
        ]);

        if (statusResult.error) {
           setError(statusResult.message);
        } else {
           setHasExisting(statusResult.hasPassword!);
        }

        // Only populate if successful AND has valid data
        if (adminResult.success && adminResult.data && adminResult.data.length > 0) {
          setStaffRecords(adminResult.data);
        }

      } catch {
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: "كلمة المرور الجديدة غير متطابقة", success: false });
      return;
    }
    
    if (newPassword.length < 4) {
      setMessage({ text: "كلمة المرور يجب أن تكون 4 أحرف على الأقل", success: false });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const result = await upsertActivationPassword(oldPassword, newPassword);

      setMessage({ text: result.message, success: result.success });

      if (result.success) {
        setHasExisting(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ text: "حدث خطأ غير متوقع", success: false });
    } finally {
      setSaving(false);
    }
  }

  // --- Helper functions for the table ---
  const toggleVisibility = (email: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(email)) {
      newVisible.delete(email);
    } else {
      newVisible.add(email);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (email: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedEmail(email);
      toast.success("تم نسخ كلمة المرور بنجاح");
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      toast.error("فشل في نسخ كلمة المرور");
    }
  };

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
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            كلمة مرور التفعيل
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة كلمة مرور التفعيل الخاصة بالتطبيق
          </p>
        </div>

        {/* --- YOUR ORIGINAL FORM CARD --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              {hasExisting ? "تغيير كلمة المرور" : "تعيين كلمة مرور جديدة"}
            </CardTitle>
            <CardDescription>
              {hasExisting 
                ? "قم بإدخال كلمة المرور القديمة والجديدة لتحديثها" 
                : "قم بتعيين كلمة مرور تفعيل جديدة لاستخدامها لاحقاً"}
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
                {hasExisting && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="oldPassword"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      كلمة المرور القديمة
                    </Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور القديمة"
                        className="pr-10 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {showOldPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    كلمة المرور الجديدة
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="pr-10 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    تأكيد كلمة المرور الجديدة
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد كلمة المرور الجديدة"
                      className="pr-10 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto mt-4"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* --- NEW CONDITIONAL TABLE RENDERING --- */}
        {staffRecords && staffRecords.length > 0 && (
          <Card className="shadow-md border-gray-200 dark:border-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <CardTitle className="text-gray-900 dark:text-white">
                كلمات مرور الموظفين
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                      <TableHead className="font-black text-[10px] uppercase tracking-wider text-gray-500 w-1/2">
                        البريد الإلكتروني
                      </TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-wider text-gray-500 w-1/3">
                        كلمة المرور
                      </TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-wider text-gray-500 text-left pl-6">
                        إجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffRecords.map((record) => {
                      const isVisible = visiblePasswords.has(record.email);
                      const isCopied = copiedEmail === record.email;

                      return (
                        <TableRow 
                          key={record.email} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                <Mail className="w-4 h-4" />
                              </div>
                              <span className="text-gray-900 dark:text-gray-100 font-bold">
                                {record.email}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                                <KeyRound className="w-4 h-4" />
                              </div>
                              <span className={`font-mono text-sm ${isVisible ? "text-gray-900 dark:text-white font-bold" : "text-gray-400 tracking-widest mt-1"}`}>
                                {isVisible ? record.password : "••••••••"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-left pl-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => toggleVisibility(record.email)}
                                className="h-9 w-9 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => copyToClipboard(record.email, record.password)}
                                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                                  isCopied 
                                    ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800" 
                                    : "border-gray-200 text-gray-500 hover:text-orange-600 hover:border-orange-200 dark:border-gray-700"
                                }`}
                              >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}