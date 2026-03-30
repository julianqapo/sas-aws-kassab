"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import { Save } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Credential } from "@/app/types/models";

export default function SettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchCredentials() {
      const { data, error } = await supabase
        .from("credential")
        .select("*")
        .eq("id_admin", user!.id)
        .single();

      if (!error && data) {
        setUsername(data.username || "");
        setPassword(data.password || "");
      }
      setLoading(false);
    }

    fetchCredentials();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("credential")
      .upsert(
        { id_admin: user.id, username, password },
        { onConflict: "id_admin" }
      );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Credentials saved successfully");
    }
    setSaving(false);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your application preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
            <CardDescription>
              Manage your admin username and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credPassword">Password</Label>
                  <Input
                    id="credPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
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
      </div>
    </div>
  );
}
