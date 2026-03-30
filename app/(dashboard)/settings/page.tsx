"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Save, User, Lock } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchCredential() {
      const { data } = await supabase
        .from("credential")
        .select("*")
        .eq("id_admin", user!.id)
        .single();

      if (data) {
        setUsername(data.username ?? "");
        setPassword(data.password ?? "");
      }
      setLoading(false);
    }

    fetchCredential();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("credential")
      .upsert({
        id_admin: user.id,
        username,
        password,
      });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Credentials updated successfully!" });
    }
    setSaving(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account credentials
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Credentials</CardTitle>
            <CardDescription>
              Update your username and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 max-w-md">
                {message && (
                  <div
                    className={`p-3 text-sm rounded-lg ${
                      message.type === "success"
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                        : "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400 w-20">Email:</span>
                <span className="dark:text-white">{user?.email ?? "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400 w-20">User ID:</span>
                <span className="dark:text-white font-mono text-xs">{user?.id ?? "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
