"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleSmartAdminAuthAction, handleSmartStaffAuthAction } from "../db_service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Lock, Mail, Shield, Users } from "lucide-react";
import Link from "next/link";

type UserType = "admin" | "staff";

export function LoginForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    try {
      const action =
        userType === "admin"
          ? handleSmartAdminAuthAction
          : handleSmartStaffAuthAction;
      const result = await action(null, formData);

      if (result?.ok && result?.redirectTo) {
        router.refresh();
        router.push(result.redirectTo);
      } else if (result?.ok && result?.message) {
        setSuccess(result.message);
        setSubmitting(false);
      } else if (result?.message) {
        setError(result.message);
        setSubmitting(false);
      }
    } catch {
      setError("A connection error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
          Welcome
        </CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>

      {/* User Type Switcher */}
      <div className="px-6 pb-2">
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md transition-all ${
              userType === "admin"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setUserType("staff")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md transition-all ${
              userType === "staff"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">Staff</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md">
              {success}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder={
                  userType === "admin"
                    ? "admin@example.com"
                    : "staff@example.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 dark:text-orange-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            {submitting
              ? "Please wait..."
              : `Continue as ${userType === "admin" ? "Admin" : "Staff"}`}
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            If you don&apos;t have an account, one will be created automatically.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
