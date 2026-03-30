"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Salary } from "@/app/types/models";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchSalaries() {
      const { data } = await supabase
        .from("salary")
        .select("*")
        .eq("id_admin", user!.id)
        .order("created_at", { ascending: false });
      setSalaries(data ?? []);
      setLoading(false);
    }

    fetchSalaries();
  }, [user]);

  const totalAmount = salaries.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );
  const paidAmount = salaries
    .filter((s) => s.is_paid)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = salaries.filter((s) => s.is_paid).length;

  // Group by month
  const byMonth = salaries.reduce<Record<number, number>>((acc, s) => {
    acc[s.month] = (acc[s.month] || 0) + (Number(s.amount) || 0);
    return acc;
  }, {});

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Salary data and insights
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${totalAmount.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${paidAmount.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {paidCount} payment{paidCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${unpaidAmount.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Records</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : salaries.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total salary records</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Salary distribution by month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : Object.keys(byMonth).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No salary data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byMonth)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([month, amount]) => {
                    const maxAmount = Math.max(...Object.values(byMonth));
                    const widthPercent =
                      maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    return (
                      <div key={month} className="flex items-center gap-4">
                        <span className="w-10 text-sm text-gray-600 dark:text-gray-400">
                          {monthNames[Number(month) - 1] || `M${month}`}
                        </span>
                        <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-lg flex items-center px-3"
                            style={{ width: `${Math.max(widthPercent, 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium whitespace-nowrap">
                              ${amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
