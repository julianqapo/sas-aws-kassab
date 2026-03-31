"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Users,
  Wifi,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getAnalyticsData, getOnlineUsersCount } from "./db_service";

interface AnalyticsStats {
  total_users?: number;
  active_users?: number;
  expired_users?: number;
  online_users?: number;
  [key: string]: unknown;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [data, online] = await Promise.all([
          getAnalyticsData(),
          getOnlineUsersCount(),
        ]);
        setStats(data);
        setOnlineCount(online);
        console.log(data)
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load analytics";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalUsers = stats?.total_users ?? 0;
  const activeUsers = stats?.active_users ?? 0;
  const expiredUsers = stats?.expired_users ?? 0;
  const activeRate =
    totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0";
  const onlineRate =
    totalUsers > 0 ? ((onlineCount / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            SAS4 system analytics and insights
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              Loading analytics...
            </span>
          </div>
        ) : !stats ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Could not load analytics data. Please check your SAS4
                credentials in Settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </CardTitle>
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalUsers}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Online Now
                  </CardTitle>
                  <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {onlineCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {onlineRate}% of total users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Users
                  </CardTitle>
                  <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {activeUsers}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activeRate}% active rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expired Users
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {expiredUsers}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  System Breakdown
                </CardTitle>
                <CardDescription>
                  All metrics from SAS4 dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    User Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Active
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {activeRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${activeRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Expired
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {totalUsers > 0
                            ? ((expiredUsers / totalUsers) * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              totalUsers > 0
                                ? (expiredUsers / totalUsers) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Online
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {onlineRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${onlineRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Accounts
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Active Accounts
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {activeUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Expired Accounts
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {expiredUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Currently Online
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {onlineCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
