"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  FileText,
  BarChart,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart, label: "Analytics", path: "/analytics" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div
      className="h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-white flex flex-col relative border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out"
      style={{ width: isExpanded ? "16rem" : "5rem" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="font-bold text-white">A</span>
          </div>
          {isExpanded && (
            <span className="font-semibold whitespace-nowrap overflow-hidden text-gray-900 dark:text-white">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-600 dark:bg-orange-500 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-900 hover:text-orange-600 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
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
          {isExpanded && (
            <span className="whitespace-nowrap overflow-hidden">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-900 hover:text-orange-600 dark:hover:text-white justify-start"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && (
            <span className="whitespace-nowrap overflow-hidden">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
}
