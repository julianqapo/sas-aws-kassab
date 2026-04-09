"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getUsers } from "./db_service";
import type { SASUser } from "../../types/sas-types";

const PAGE_SIZE = 15;

export default function ActivateUsersPage() {
  const [users, setUsers] = useState<SASUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const getExpirationStyles = (expirationDate: string | null) => {
    if (!expirationDate || expirationDate === "—") return "text-gray-600 dark:text-gray-400";
    const now = new Date();
    const exp = new Date(expirationDate.replace(" ", "T"));
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "text-red-600 font-bold bg-red-50 px-2 py-1 rounded"; 
    if (diffDays <= 7) return "text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded";
    return "text-green-600 font-medium";
  };

  const fetchUsers = useCallback(async (targetPage: number, query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setLoading(true);
    try {
      const result = (await getUsers(targetPage, PAGE_SIZE, query)) as any;

      if (!result.success) {
        throw new Error(result.error || "Failed to load users");
      }
      
      setUsers(result.data.data);
      setTotalPages(result.data.last_page || 1);
      setTotal(result.data.total || 0);
      setFrom(result.data.from || 0);
      setTo(result.data.to || 0);
      setPage(targetPage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      toast.error(message);
      setUsers([]); // Clear table on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchUsers(1, search);
  };

  const formatTraffic = (bytes: number | string | undefined) => {
    if (!bytes || bytes === "—") return "0 GB";
    const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
    const gb = b / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Search for SAS4 user accounts to manage</p>
        </div>

        {/* Search Bar with Submit Button */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Enter username, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 shadow-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !search.trim()} 
            className="h-11 px-6 bg-orange-600 hover:bg-orange-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Search
          </Button>
        </form>

        <Card className="shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              Search Results
              {total > 0 && (
                <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                  {total} Found
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="text-sm text-gray-500">Searching database...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                {total === 0 && search && !loading ? "No users found. Try a different search." : "Enter a search term above to find users."}
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
                        <TableHead>Expiration</TableHead>
                        <TableHead>Traffic</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                          <TableCell className="font-bold">
                            <Link href={`/activateUsers/${user.username}`} className="text-orange-600 hover:text-orange-700">
                              {user.username}
                            </Link>
                          </TableCell>
                          <TableCell>{user.firstname || "—"}</TableCell>
                          <TableCell>{user.lastname || "—"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold uppercase tracking-wider">
                              {user.profile_details?.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell className={getExpirationStyles(user.expiration)}>
                            <div className="flex items-center gap-1.5">
                              {user.expiration && <CalendarClock className="w-3 h-3 opacity-70" />}
                              {user.expiration || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {user.daily_traffic_details?.traffic ? (
                              <>{formatTraffic(user.daily_traffic_details.traffic).split(' ')[0]} <span className="opacity-70 font-sans">GB</span></>
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Showing {from} to {to} of {total}</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(page - 1, search)}
                      disabled={page <= 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-semibold">Page {page} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(page + 1, search)}
                      disabled={page >= totalPages || loading}
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