"use server";

import { sasApiCall } from "../../lib/sas-client";



export async function getUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_count",
  );
  return response;
}


export async function getActiveUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_active_count",
  );
  return response;
}

export async function getOnlineUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_online",
  );
  return response;
}




export async function getExpiredUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expired_count",
  );
  return response;
}



export async function getExpiringUserCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expiring_in_3_days",
  );
  return response;
}


export async function getBalance() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_balance",
  );
  return response;
}


export async function getFupOnlineCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_fup_online",
  );
  return response;
}


export async function getExpiringTodayCount() {
  const response = await sasApiCall(
    "GET",
    "/admin/api/index.php/api/widgetData/internal/wd_users_expiring_today",
  );
  return response;
}