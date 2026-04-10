"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  RefreshCw,
  LayoutDashboard,
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
  getExpiringTodayCount,
} from "./db_service";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function AdminDashboardHeader() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      const [
        total,
        active,
        online,
        expired,
        aboutToExpire,
        balance,
        fup,
        expToday,
      ] = await Promise.all([
        getUserCount(),
        getActiveUserCount(),
        getOnlineUserCount(),
        getExpiredUserCount(),
        getExpiringUserCount(),
        getBalance(),
        getFupOnlineCount(),
        getExpiringTodayCount(),
      ]);
      // console.log("balance : ", balance)

      const dataConfig = [
        {
          label: "Total Users",
          sublabel: "Registered Users",
          value: total?.data?.data ?? "0",
          icon: Users,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/40",
          accent: "from-blue-500 to-blue-600",
          glow: "shadow-blue-500/20",
        },
        {
          label: "Active Users",
          sublabel: "Valid Subscriptions",
          value: active?.data?.data ?? "0",
          icon: UserCheck,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/40",
          accent: "from-emerald-500 to-emerald-600",
          glow: "shadow-emerald-500/20",
        },
        {
          label: "Online Users",
          sublabel: "Connected Now",
          value: online?.data?.data ?? "0",
          icon: Activity,
          color: "text-cyan-600 dark:text-cyan-400",
          bg: "bg-cyan-100 dark:bg-cyan-900/40",
          accent: "from-cyan-500 to-cyan-600",
          glow: "shadow-cyan-500/20",
        },
        {
          label: "Expired Users",
          sublabel: "Needs Renewal",
          value: expired?.data?.data ?? "0",
          icon: UserX,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/40",
          accent: "from-red-500 to-red-600",
          glow: "shadow-red-500/20",
        },
        {
          label: "About to Expire",
          sublabel: "Next 3 Days",
          value: aboutToExpire?.data?.data ?? "0",
          icon: Clock,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/40",
          accent: "from-amber-500 to-amber-600",
          glow: "shadow-amber-500/20",
        },
        {
          label: "Expiring Today",
          sublabel: "Urgent Attention",
          value: expToday?.data?.data ?? "0",
          icon: AlertCircle,
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-100 dark:bg-orange-900/40",
          accent: "from-orange-500 to-orange-600",
          glow: "shadow-orange-500/20",
        },
        {
          label: "Online FUP",
          sublabel: "Fair Use Policy",
          value: fup?.data?.data ?? "0",
          icon: Zap,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-100 dark:bg-purple-900/40",
          accent: "from-purple-500 to-purple-600",
          glow: "shadow-purple-500/20",
        },
        {
          label: "Current Balance",
          sublabel: "Total Credit",
          value: balance?.data?.data?.replace(/iqd/gi, "").trim() ?? 0,
          icon: Wallet,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/40",
          accent: "from-emerald-500 to-teal-600",
          glow: "shadow-emerald-500/20",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header — matches Users page */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Network Overview
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Real-time statistics and system health
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Button
              variant="outline"
              onClick={fetchAllStats}
              disabled={loading}
              className="rounded-xl border-gray-200 dark:border-gray-800 font-bold text-xs uppercase gap-2 h-11 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[140px] w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                        <div className="h-7 w-14 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                      </div>
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="h-1 w-full bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  whileHover={{
                    y: -4,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`group overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-lg hover:${stat.glow} backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 transition-all duration-300 rounded-2xl cursor-default`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {stat.label}
                          </p>
                          <h3 className={`text-3xl font-black tracking-tight ${stat.color}`}>
                            {typeof stat.value === "number"
                              ? stat.value.toLocaleString()
                              : Number(stat.value).toLocaleString() || stat.value}
                          </h3>
                        </div>

                        <div
                          className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <p className="text-[11px] font-bold text-gray-400">
                          {stat.sublabel}
                        </p>
                      </div>
                    </CardContent>

                    {/* Bottom accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${stat.accent} opacity-40 group-hover:opacity-80 transition-opacity duration-300`} />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}