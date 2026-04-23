"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Home,
  Users,
  Settings,
  FileText,
  BarChart,
  LogOut,
  Moon,
  Sun,
  Wifi,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { logoutAction } from "../db_service";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  // { icon: BarChart, label: "Analytics", path: "/analytics" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: FileText, label: "Activate Users", path: "/activateUsers" },
  { icon: ShieldCheck, label: "Activation Password", path: "/activationPassword" },
  { icon: Wifi, label: "Cards", path: "/cards" },
  { icon: UserCog, label: "Staff", path: "/staff" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
  };

  return (
    <motion.div
      className="h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-white flex flex-col relative border-r border-gray-200 dark:border-gray-800"
      initial={{ width: "5rem" }}
      animate={{ width: isExpanded ? "16rem" : "5rem" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center h-16 border-b border-gray-200 dark:border-gray-800">
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="font-bold text-white">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <motion.div
            className="flex flex-col whitespace-nowrap overflow-hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-semibold text-gray-900 dark:text-white leading-tight">
              Admin Panel
            </span>
            {userEmail && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[160px]">
                {userEmail}
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange-600 dark:bg-orange-500 text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-900 hover:text-orange-600 dark:hover:text-white"
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                      className="whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{
                        opacity: isExpanded ? 1 : 0,
                        width: isExpanded ? "auto" : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle and Logout */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-900 hover:text-orange-600 dark:hover:text-white justify-start"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Sun className="w-5 h-5 flex-shrink-0" />
          )}
          <motion.span
            className="whitespace-nowrap overflow-hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </motion.span>
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-900 hover:text-orange-600 dark:hover:text-white justify-start"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            className="whitespace-nowrap overflow-hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            Logout
          </motion.span>
        </Button>
      </div>
    </motion.div>
  );
}
