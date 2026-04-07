"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getUsers } from "./db_service";
import type { SASUser, SASProfile } from "../../types/sas-types";

const PAGE_SIZE = 15;

export default function UsersPage() {
  const [users, setUsers] = useState<SASUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  // --- Logic Helpers ---

  const getExpirationStyles = (expirationDate: string | null) => {
    if (!expirationDate || expirationDate === "—") return "text-gray-600 dark:text-gray-400";

    const now = new Date();
    // Cross-browser safety for "YYYY-MM-DD HH:mm:ss"
    const exp = new Date(expirationDate.replace(" ", "T"));
    
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return "text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"; 
    } else if (diffDays <= 7) {
      return "text-yellow-600 dark:text-yellow-500 font-semibold bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded";
    } else {
      return "text-green-600 dark:text-green-400 font-medium";
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await getUsers(page, PAGE_SIZE, search)) as any;

      if (!result.success || !result.data || !Array.isArray(result.data.data)) {
        throw new Error(result.error || "Failed to load users");
      }
      setUsers(result.data.data);
      setTotalPages(result.data.last_page || 1);
      setTotal(result.data.total || 0);
      setFrom(result.data.from || 0);
      setTo(result.data.to || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const formatTraffic = (bytes: number | string | undefined) => {
  if (!bytes || bytes === "—") return "0 GB";
  
  const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
  
  // Convert Bytes to GB (using 1024 for binary GB / GiB)
  const gb = b / (1024 * 1024 * 1024);
  
  // Fix to 2 decimal places
  return `${gb.toFixed(2)} GB`;
};


  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage SAS4 user accounts and subscriptions
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by username, name, or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 shadow-sm"
          />
        </div>

        {/* Users Table Card */}
        <Card className="shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              User List
              {!loading && (
                <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                  {total} Total
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="text-sm text-gray-500">Syncing user database...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                {search ? "No results found for your search criteria." : "No users currently registered."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                        <TableHead className="font-bold text-gray-700 dark:text-gray-300">Username</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Last Online</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Traffic</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                          <TableCell className="font-bold">
                            <Link 
                              href={`/users/${user.username}`} 
                              className="text-orange-600 hover:text-orange-700 transition-colors"
                            >
                              {user.username}
                            </Link>
                          </TableCell>
                          <TableCell>{user.firstname || "—"}</TableCell>
                          <TableCell>{user.lastname || "—"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold uppercase tracking-wider">
                              {user.profile_details?.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                user.enabled
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                              }`}>
                              {user.last_online}
                            </span>
                          </TableCell>
                          
                          {/* APPLYING EXPIRATION COLORS HERE */}
                          <TableCell className={getExpirationStyles(user.expiration)}>
                            <div className="flex items-center gap-1.5">
                              {user.expiration && <CalendarClock className="w-3 h-3 opacity-70" />}
                              {/* {user.expiration 
                                ? new Date(user.expiration.replace(" ", "T")).toLocaleDateString(undefined, { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                  }) 
                                : "—"} */}
                                {user.expiration}
                            </div>
                          </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400 font-mono">
                              {user.daily_traffic_details?.traffic ? (
                                <>
                                  {formatTraffic(user.daily_traffic_details.traffic).split(' ')[0]}
                                  <span className="text-[10px] ml-1 opacity-70">GB</span>
                                </>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-bold text-gray-900 dark:text-gray-200">{from}</span> to <span className="font-bold text-gray-900 dark:text-gray-200">{to}</span> of {total}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-semibold">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    
    </div>
  );
}