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
import { Plus, Trash2, Users, DollarSign, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [staffCount, setStaffCount] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      // Fetch staff count
      const { count: sCount } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("id_admin", user!.id);

      // Fetch active staff count
      const { count: aCount } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("id_admin", user!.id)
        .eq("is_active", true);

      // Fetch total salaries
      const { data: salaryData } = await supabase
        .from("salary")
        .select("amount")
        .eq("id_admin", user!.id);

      const total = salaryData?.reduce((sum, s) => sum + Number(s.amount), 0) ?? 0;

      setStaffCount(sCount ?? 0);
      setActiveStaff(aCount ?? 0);
      setTotalSalaries(total);
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your organization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : staffCount}
              </p>
              <p className="text-xs text-muted-foreground">registered employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : activeStaff}
              </p>
              <p className="text-xs text-muted-foreground">currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${totalSalaries.toLocaleString()}`}
              </p>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
