"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loginUser } from "./db_service";
import AssignSeriesModal from "./subscriptionModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  User,
  Wifi,
  Calendar,
  CreditCard,
  Activity,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  PlusCircle,
} from "lucide-react";

export default function SubscriberDashboard() {
  const params = useParams();
  const username = params.username;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    if (!username) return;

    async function fetchSubscriberData() {
      setLoading(true);
      setError(null);
      try {
        const response = await loginUser(username);
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error || "Failed to load subscriber data.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchSubscriberData();
  }, [username]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-gray-500">Loading data for {username}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-100">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Error Loading User
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, dashboard, service } = data;
  const u = user?.data || {};
  const d = dashboard?.data || {};
  const s = service?.data || {};
  const isServiceActive = s.status;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Assign Series Modal Overlay */}
      {isAssignModalOpen && (
        <AssignSeriesModal
          username={u.username || username}
          currentSubscription={s.profile_name || "Basic"}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-orange-600 dark:text-orange-500" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-gray-900 dark:text-white"
              dir="auto"
            >
              {u.name || u.username || username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account ID: {u.id || "N/A"} | Username: {u.username || username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Assign Series
          </Button>

          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium ${
              isServiceActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isServiceActive ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
            <span>{isServiceActive ? "Active" : "Expired"}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Remaining Days
                </p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {d.remaining_days ?? 0}
                </h3>
              </div>
              <Calendar className="w-8 h-8 text-orange-100 dark:text-orange-900/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Current Plan
                </p>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 truncate max-w-[140px]">
                  {s.profile_name || "—"}
                </h3>
              </div>
              <Wifi className="w-8 h-8 text-blue-100 dark:text-blue-900/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Balance
                </p>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(d.balance ?? 0)}
                </h3>
              </div>
              <CreditCard className="w-8 h-8 text-green-100 dark:text-green-900/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Unpaid Invoices
                </p>
                <h3 className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">
                  {d.unpaid_invoices ?? 0}
                </h3>
              </div>
              <Activity className="w-8 h-8 text-red-100 dark:text-red-900/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Details */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-orange-600" />
              Internet Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Package Description
              </p>
              <p
                className="text-base font-medium text-gray-900 dark:text-gray-100"
                dir="auto"
              >
                {s.description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="pb-3">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Price
                </p>
                <p className="font-bold text-lg">
                  {formatCurrency(s.price ?? 0)}
                </p>
              </div>
              <div className="pb-3 text-right">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Expiration
                </p>
                <p className="font-bold flex items-center justify-end gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {formatDate(s.expiration)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                Health Status
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Traffic",
                    val: s.subscription_status?.traffic,
                    ok: "OK",
                    fail: "Exhausted",
                  },
                  {
                    label: "Uptime",
                    val: s.subscription_status?.uptime,
                    ok: "OK",
                    fail: "Exhausted",
                  },
                  {
                    label: "Time",
                    val: !s.subscription_status?.expiration,
                    ok: "Valid",
                    fail: "Expired",
                  },
                ].map((status, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                      status.val
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {status.label}: {status.val ? status.ok : status.fail}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1">
              {[
                { label: "First Name", value: u.firstname, dir: "auto" },
                { label: "Last Name", value: u.lastname, dir: "auto" },
                {
                  label: "Registered On",
                  value: formatDate(u.registered_on?.date),
                },
                {
                  label: "Auto Renew",
                  value: u.auto_renew ? "Enabled" : "Disabled",
                  color: u.auto_renew ? "text-green-600" : "text-gray-400",
                },
                {
                  label: "Loan Balance",
                  value: formatCurrency(u.loan_balance ?? 0),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-bold ${item.color || "text-gray-900 dark:text-gray-100"}`}
                    dir={item.dir}
                  >
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
