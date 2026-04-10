"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  UserCheck, 
  Activity, 
  UserX, 
  Clock, 
  Wallet, 
  Zap, 
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { 
  getUserCount, 
  getActiveUserCount, 
  getOnlineUserCount, 
  getExpiredUserCount, 
  getExpiringUserCount, 
  getBalance, 
  getFupOnlineCount, 
  getExpiringTodayCount 
} from "./db_service";

export default function AdminDashboardHeader() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      // Execute all 8 API calls in parallel
      const [
        total, 
        active, 
        online, 
        expired, 
        aboutToExpire, 
        balance, 
        fup, 
        expToday
      ] = await Promise.all([
        getUserCount(),
        getActiveUserCount(),
        getOnlineUserCount(),
        getExpiredUserCount(),
        getExpiringUserCount(),
        getBalance(),
        getFupOnlineCount(),
        getExpiringTodayCount()
      ]);

      const dataConfig = [
        {
          label: "Total Users",
          sublabel: "Registered Users",
          value: total?.data?.data ?? "0",
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-100 dark:border-blue-800",
        },
        {
          label: "Active Users",
          sublabel: "Valid Subscriptions",
          value: active?.data?.data ?? "0",
          icon: UserCheck,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-100 dark:border-green-800",
        },
        {
          label: "Online Users",
          sublabel: "Connected Now",
          value: online?.data?.data ?? "0",
          icon: Activity,
          color: "text-cyan-600",
          bg: "bg-cyan-50 dark:bg-cyan-900/20",
          border: "border-cyan-100 dark:border-cyan-800",
        },
        {
          label: "Expired Users",
          sublabel: "Needs Renewal",
          value: expired?.data?.data ?? "0",
          icon: UserX,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-100 dark:border-red-800",
        },
        {
          label: "About to Expire",
          sublabel: "Next 3 Days",
          value: aboutToExpire?.data?.data ?? "0",
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-100 dark:border-yellow-800",
        },
        {
          label: "Expiring Today",
          sublabel: "Urgent Attention",
          value: expToday?.data?.data ?? "0",
          icon: AlertCircle,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-100 dark:border-orange-800",
        },
        {
          label: "Online FUP",
          sublabel: "Fair Use Policy",
          value: fup?.data?.data ?? "0",
          icon: Zap,
          color: "text-purple-600",
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-100 dark:border-purple-800",
        },
        {
          label: "Current Balance",
          sublabel: "Total Credit",
          value: `${balance?.data?.data ?? 0}`,
          icon: Wallet,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-100 dark:border-emerald-800",
        },
      ];

      setStats(dataConfig);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 dark:bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Network Overview</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAllStats} 
          disabled={loading}
          className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Skeleton Loaders
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-100 dark:border-gray-800" />
          ))
        ) : (
          stats.map((stat, i) => (
            <Card 
              key={i} 
              className={`group overflow-hidden border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {stat.label}
                    </p>
                    <h3 className={`text-2xl font-black tracking-tight ${stat.color}`}>
                      {stat.value}
                    </h3>
                  </div>
                  
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <p className="text-[11px] font-bold text-gray-400 italic">
                    {stat.sublabel}
                  </p>
                </div>
              </CardContent>
              <div className={`h-1 w-full opacity-30 ${stat.color.replace('text', 'bg')}`} />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}