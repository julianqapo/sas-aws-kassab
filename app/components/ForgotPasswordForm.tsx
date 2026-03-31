"use client";

import { useState } from "react";
import { handleForgotPasswordAction } from "../forgot-password/db_service";
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
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("email", email);

    const result = await handleForgotPasswordAction(null, formData);

    if (result?.ok) {
      setSubmitted(true);
    } else if (result?.message) {
      setError(result.message);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            We&apos;ve sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you don&apos;t see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Send Reset Link
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
