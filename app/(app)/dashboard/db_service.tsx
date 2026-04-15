"use server";

import { permission } from "node:process";
import { sasApiCall } from "../../lib/sas-client";

const dashboardId = 1

export async function getUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_count",
    undefined,
    dashboardId
  );
  return response;
}


export async function getActiveUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_active_count",
    undefined,
    dashboardId
  );
  return response;
}

export async function getOnlineUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_online",
    undefined,
    dashboardId
  );
  return response;
}




export async function getExpiredUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expired_count",
    undefined,
    dashboardId
  );
  return response;
}



export async function getExpiringUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expiring_in_3_days",
    undefined,
    dashboardId
  );
  return response;
}


export async function getBalance() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_balance",
    undefined,
    dashboardId
  );
  return response;
}


export async function getFupOnlineCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_fup_online",
    undefined,
    dashboardId
  );
  return response;
}


export async function getExpiringTodayCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expiring_today",
    undefined,
    dashboardId
  );
  return response;
}