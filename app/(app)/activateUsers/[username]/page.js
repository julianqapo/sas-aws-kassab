"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { loginUser } from "./db_service";
import AssignSeriesModal from "./subscriptionModal";
import InvoicesModal from "./InvoicesModal";
import ExtendModal from "./ExtendModal";
import ActivationGate from "./ActivationGate";
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
  Loader2,
  PlusCircle,
  Receipt,
  RefreshCcw,
  Package,
} from "lucide-react";

export default function SubscriberDashboard() {
  const params = useParams();
  const username = params?.username;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);

  const fetchSubscriberData = useCallback(async () => {
    if (!username) return;
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
  }, [username]);

  useEffect(() => {
    fetchSubscriberData();
  }, [fetchSubscriberData]);

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "—";
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
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
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
          Loading Subscriber...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl border-red-200 dark:border-red-900">
          <CardContent className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <p className="font-bold text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { user, dashboard, service } = data;
  const u = user?.data || {};
  const d = dashboard?.data || {};
  const s = service?.data || {};
  const isServiceActive = Boolean(s.status);
  const resolvedUsername = u.username || username;

  const stats = [
    {
      label: "Remaining Days",
      val: d.remaining_days ?? 0,
      icon: Calendar,
      color: "text-orange-500",
      border: "border-l-orange-500",
    },
    {
      label: "Current Plan",
      val: s.profile_name || "—",
      icon: Wifi,
      color: "text-blue-500",
    },
    {
      label: "Balance",
      val: formatCurrency(d.balance ?? 0),
      icon: CreditCard,
      color: "text-green-500",
    },
    {
      label: "Unpaid Invoices",
      val: d.unpaid_invoices ?? 0,
      icon: Activity,
      color: "text-red-500",
    },
  ];

  const personalInfo = [
    { label: "First Name", value: u.firstname, dir: "auto" },
    { label: "Last Name", value: u.lastname, dir: "auto" },
    { label: "Registered On", value: formatDate(u.registered_on?.date) },
    {
      label: "Loan Balance",
      value: formatCurrency(u.loan_balance ?? 0),
      color: "text-red-500",
    },
  ];

  return (
    <ActivationGate>
      <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
        {isExtendModalOpen && (
          <ExtendModal
            username={resolvedUsername}
            isOpen={isExtendModalOpen}
            onClose={() => setIsExtendModalOpen(false)}
            onSuccess={() => {
              setIsExtendModalOpen(false);
              fetchSubscriberData();
            }}
          />
        )}

        {isAssignModalOpen && (
          <AssignSeriesModal
            username={resolvedUsername}
            currentSubscription={s.profile_name || "Basic"}
            onClose={() => setIsAssignModalOpen(false)}
          />
        )}

        {isInvoiceModalOpen && (
          <InvoicesModal
            username={resolvedUsername}
            firstname={u.firstname || ""}
            lastname={u.lastname || ""}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1
                className="text-2xl font-black text-gray-900 dark:text-white"
                dir="auto"
              >
                {u.name || u.username || username}
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                ID: {u.id || "N/A"} • @{resolvedUsername}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="rounded-xl font-bold text-xs uppercase h-11 px-5 border-gray-200 dark:border-gray-700 active:scale-95 transition-transform"
            >
              <Receipt className="w-4 h-4 mr-2 text-blue-500" />
              Billing History
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsExtendModalOpen(true)}
              className="rounded-xl font-bold text-xs uppercase h-11 px-5 border-blue-200 text-blue-600 dark:border-blue-900 hover:bg-blue-50 active:scale-95 transition-transform"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Extend
            </Button>

            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase h-11 px-5 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Activate
            </Button>

            <div
              className={`h-11 px-5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-wider border ${
                isServiceActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isServiceActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              {isServiceActive ? "Active" : "Expired"}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className={`shadow-sm ${stat.border ? `border-l-4 ${stat.border}` : ""}`}
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className={`text-xl font-black mt-1 ${stat.color}`}>
                    {stat.val}
                  </h3>
                </div>
                <stat.icon className="w-8 h-8 opacity-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wifi className="w-5 h-5 text-orange-600" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Description
                </p>
                <p className="text-sm font-medium" dir="auto">
                  {s.description || "No package details found."}
                </p>
              </div>
              <div className="flex justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Price
                  </p>
                  <p className="font-black text-lg">
                    {formatCurrency(s.price ?? 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Expires
                  </p>
                  <p className="font-bold flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-3 h-3 text-orange-500" />
                    {formatDate(s.expiration)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {personalInfo.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-bold ${item.color || ""}`}
                    {...(item.dir ? { dir: item.dir } : {})}
                  >
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ActivationGate>
  );
}
