"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function AnalyticsPage() {
  const [totalSalary, setTotalSalary] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: salaries } = await supabase.from("salary").select("*");
      if (salaries) {
        const total = salaries.reduce(
          (sum, s) => sum + (Number(s.amount) || 0),
          0
        );
        setTotalSalary(total);
        setPaidCount(salaries.filter((s) => s.is_paid).length);
        setUnpaidCount(salaries.filter((s) => !s.is_paid).length);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View detailed analytics and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Salary</CardTitle>
              <CardDescription>Sum of all salary records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                ${totalSalary.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paid</CardTitle>
              <CardDescription>Completed salary payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {paidCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Unpaid</CardTitle>
              <CardDescription>Pending salary payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {unpaidCount}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
