"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, DollarSign, UserCheck, Clock } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [staffCount, setStaffCount] = useState(0);
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      const [staffRes, activeRes, salaryRes, unpaidRes] = await Promise.all([
        supabase
          .from("staff")
          .select("id", { count: "exact", head: true })
          .eq("id_admin", user!.id),
        supabase
          .from("staff")
          .select("id", { count: "exact", head: true })
          .eq("id_admin", user!.id)
          .eq("is_active", true),
        supabase
          .from("salary")
          .select("amount")
          .eq("id_admin", user!.id),
        supabase
          .from("salary")
          .select("id", { count: "exact", head: true })
          .eq("id_admin", user!.id)
          .eq("is_paid", false),
      ]);

      setStaffCount(staffRes.count ?? 0);
      setActiveStaffCount(activeRes.count ?? 0);

      const total = (salaryRes.data ?? []).reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0
      );
      setTotalSalaries(total);
      setUnpaidCount(unpaidRes.count ?? 0);
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your admin panel
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : staffCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Registered staff members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : activeStaffCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${totalSalaries.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All salary records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : unpaidCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pending salary payments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
