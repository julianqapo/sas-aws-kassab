"use client";

import { useEffect, useState } from "react";
import { hasActivationPassword } from "./db_service";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";

export default function ActivationGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkGate() {
      try {
        const result = await hasActivationPassword();
        setHasPassword(result.hasPassword);
      } catch (e) {
        setHasPassword(false);
      } finally {
        setLoading(false);
      }
    }
    checkGate();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
          Checking Security...
        </p>
      </div>
    );
  }

  if (hasPassword === false) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-2xl border-orange-200 dark:border-orange-900 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                كلمة مرور التفعيل مطلوبة
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                لأسباب أمنية، يجب عليك تعيين كلمة مرور تفعيل قبل التمكن من إجراء أي عمليات على المشتركين.
              </p>
            </div>
            <Link 
              href="/activationPassword"
              className="inline-flex items-center justify-center px-6 py-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              تعيين كلمة المرور الآن
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
