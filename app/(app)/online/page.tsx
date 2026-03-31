"use client";

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
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getOnlineUsers, pingUser } from "./db_service";
import type { SASOnlineUser, PaginatedResponse } from "../../types/sas-types";

const PAGE_SIZE = 15;

export default function OnlinePage() {
  const [users, setUsers] = useState<SASOnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [pinging, setPinging] = useState<number | null>(null);

  const fetchOnline = useCallback(async () => {
    setLoading(true);
    try {
      const result: PaginatedResponse<SASOnlineUser> = await getOnlineUsers(
        page,
        PAGE_SIZE,
        search
      );
      setUsers(result.data || []);
      setTotalPages(result.last_page || 1);
      setTotal(result.total || 0);
      setFrom(result.from || 0);
      setTo(result.to || 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load online users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOnline();
  }, [fetchOnline]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePing = async (user: SASOnlineUser) => {
    setPinging(user.id);
    try {
      await pingUser(user.id, user.nas_id);
      toast.success(`Ping sent to "${user.username}"`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ping failed";
      toast.error(message);
    } finally {
      setPinging(null);
    }
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Online Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Currently connected users
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search online users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Online
              {!loading && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({total} connected)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {search
                  ? "No online users matching your search."
                  : "No users currently online."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>NAS IP</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Download</TableHead>
                        <TableHead>Upload</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.nas_ip || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.start_time || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.download || "0"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.upload || "0"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePing(user)}
                              disabled={pinging === user.id}
                            >
                              {pinging === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Radio className="w-4 h-4" />
                              )}
                              <span className="ml-1">Ping</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {from} to {to} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
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
