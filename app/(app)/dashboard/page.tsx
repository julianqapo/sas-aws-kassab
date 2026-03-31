"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Users, Wifi, Activity, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getDashboardData, getOnlineUsersCount } from "./db_service";

interface DashboardStats {
  total_users?: number;
  active_users?: number;
  expired_users?: number;
  online_users?: number;
  total_traffic?: string;
  total_balance?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashData, onlineData] = await Promise.all([
          getDashboardData(),
          getOnlineUsersCount(),
        ]);
        setStats(dashData);
        setOnlineCount(onlineData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      description: "Registered accounts",
      value: stats?.total_users ?? "—",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Online Users",
      description: "Currently connected",
      value: onlineCount,
      icon: Wifi,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Active Users",
      description: "Enabled accounts",
      value: stats?.active_users ?? "—",
      icon: Activity,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900",
    },
    {
      title: "Expired Users",
      description: "Expired accounts",
      value: stats?.expired_users ?? "—",
      icon: DollarSign,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900",
    },
  ];

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            SAS4 system overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {card.description}
                    </CardDescription>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Raw dashboard data */}
        {stats && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                System Details
              </CardTitle>
              <CardDescription>
                Additional data from SAS4 dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats)
                  .filter(
                    ([key]) =>
                      ![
                        "total_users",
                        "active_users",
                        "expired_users",
                        "online_users",
                      ].includes(key)
                  )
                  .map(([key, value]) => (
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
        )}

        {!loading && !stats && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Could not load dashboard data. Please check your SAS4
                credentials in Settings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
