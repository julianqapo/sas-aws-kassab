"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Salary } from "@/app/types/models";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchSalaryData() {
      const { data, error } = await supabase
        .from("salary")
        .select("*")
        .eq("id_admin", user!.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSalaries(data);
      }
      setLoading(false);
    }

    fetchSalaryData();
  }, [user]);

  const totalAmount = salaries.reduce((sum, s) => sum + Number(s.amount), 0);
  const paidCount = salaries.filter((s) => s.is_paid).length;
  const unpaidCount = salaries.filter((s) => !s.is_paid).length;
  const paidAmount = salaries
    .filter((s) => s.is_paid)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Salary data and financial insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Salaries
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : `$${totalAmount.toLocaleString()}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {salaries.length} records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {loading ? "..." : `$${paidAmount.toLocaleString()}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {paidCount} paid records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {loading ? "..." : paidCount}
              </p>
              <p className="text-xs text-muted-foreground">completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? "..." : unpaidCount}
              </p>
              <p className="text-xs text-muted-foreground">pending payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Salary Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Salary Records</CardTitle>
            <CardDescription>Latest salary entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : salaries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No salary records found.
              </p>
            ) : (
              <div className="space-y-3">
                {salaries.slice(0, 10).map((salary) => (
                  <div
                    key={salary.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium dark:text-white">
                        ${Number(salary.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Month: {salary.month}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        salary.is_paid
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      }`}
                    >
                      {salary.is_paid ? "Paid" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
