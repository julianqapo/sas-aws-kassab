"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loginUser } from "./db_service"; // Adjust this import path to where your loginUser function is
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"; // Adjust your UI imports as needed
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
} from "lucide-react";

export default function SubscriberDashboard() {
  // 1. Grab the dynamic username from the URL (e.g., /users/HM01083601)
  const params = useParams();
  // Note: if your folder is literally named [usename] without the 'r', change this to params.usename
  const username = params.username;

  // 2. Setup state for loading, errors, and the data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Fetch the data when the page loads
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

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Helper to format date
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

  // --- Rendering States ---

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

  // --- Main Dashboard Render ---

  const { user, dashboard, service } = data;
  const u = user?.data || {};
  const d = dashboard?.data || {};
  const s = service?.data || {};

  const isServiceActive = s.status;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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

        {/* Main Status Badge */}
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
          <span>{isServiceActive ? "Service Active" : "Service Expired"}</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remaining Days
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {d.remaining_days ?? 0}
                </h3>
              </div>
              <Calendar className="w-8 h-8 text-orange-200 dark:text-orange-900" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Plan
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[120px]">
                  {s.profile_name || "—"}
                </h3>
              </div>
              <Wifi className="w-8 h-8 text-blue-200 dark:text-blue-900" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Balance
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(d.balance ?? 0)}
                </h3>
              </div>
              <CreditCard className="w-8 h-8 text-green-200 dark:text-green-900" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Unpaid Invoices
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {d.unpaid_invoices ?? 0}
                </h3>
              </div>
              <Activity className="w-8 h-8 text-red-200 dark:text-red-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Package Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-orange-600" />
              Internet Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Package Description</p>
              <p
                className="text-base font-medium text-gray-900 dark:text-gray-100"
                dir="auto"
              >
                {s.description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <p className="text-sm text-gray-500 mb-1">Package Price</p>
                <p className="font-semibold">{formatCurrency(s.price ?? 0)}</p>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <p className="text-sm text-gray-500 mb-1">Expiration Date</p>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(s.expiration)}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-3">Subscription Status</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${s.subscription_status?.traffic ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
                >
                  Traffic: {s.subscription_status?.traffic ? "OK" : "Exhausted"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${s.subscription_status?.uptime ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
                >
                  Uptime: {s.subscription_status?.uptime ? "OK" : "Exhausted"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-md border ${s.subscription_status?.expiration ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}
                >
                  Time:{" "}
                  {s.subscription_status?.expiration ? "Expired" : "Valid"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">First Name</span>
                <span className="font-medium" dir="auto">
                  {u.firstname || "—"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Last Name</span>
                <span className="font-medium" dir="auto">
                  {u.lastname || "—"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Registered On</span>
                <span className="font-medium">
                  {formatDate(u.registered_on?.date)}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Auto Renew</span>
                <span
                  className={`font-medium ${u.auto_renew ? "text-green-600" : "text-gray-500"}`}
                >
                  {u.auto_renew ? "Enabled" : "Disabled"}
                </span>
              </li>
              <li className="flex justify-between items-center pb-2">
                <span className="text-gray-500">Loan Balance</span>
                <span className="font-medium">
                  {formatCurrency(u.loan_balance ?? 0)}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
