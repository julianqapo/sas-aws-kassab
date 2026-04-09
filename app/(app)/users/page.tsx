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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  CalendarClock,
  CheckSquare,
  Square,
  Settings2,
  Filter,
  ListOrdered
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getUsers } from "./db_service";
import type { SASUser } from "../../types/sas-types";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

const ALL_COLUMNS = [
  { id: "username", label: "Username" },
  { id: "firstname", label: "First Name" },
  { id: "lastname", label: "Last Name" },
  { id: "profile", label: "Profile" },
  { id: "last_online", label: "Last Online" },
  { id: "expiration", label: "Expiration" },
  { id: "traffic", label: "Traffic" },
  { id: "balance", label: "Balance" },
  { id: "created_at", label: "Created At" },
  { id: "debt_days", label: "Debt Days" },
  { id: "phone", label: "Phone" },
  { id: "parent_username", label: "Parent Username" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SASUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "username", "firstname", "profile", "last_online", "expiration", "traffic"
  ]);

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await getUsers(page, pageSize, searchQuery)) as any;
      // console.log(result.data.data[0])
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
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const formatTraffic = (bytes: number | string | undefined) => {
    if (!bytes || bytes === "—") return "0 GB";
    const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
    const gb = b / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const getExpirationStyles = (expirationDate: string | null) => {
    if (!expirationDate || expirationDate === "—") return "text-gray-600 dark:text-gray-400";
    const now = new Date();
    const exp = new Date(expirationDate.replace(" ", "T"));
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"; 
    if (diffDays <= 7) return "text-yellow-600 dark:text-yellow-500 font-semibold bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded";
    return "text-green-600 dark:text-green-400 font-medium";
  };

  // Logic to generate page range (Current +/- 3)
  const getPageRange = () => {
    const range = [];
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, page + 3);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage SAS4 user accounts and subscriptions</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 h-11">
              <ListOrdered className="w-4 h-4 text-gray-400" />
              <select 
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setIsColumnModalOpen(true)}
              className="rounded-xl border-gray-200 dark:border-gray-800 font-bold text-xs uppercase gap-2 h-11"
            >
              <Settings2 className="w-4 h-4 text-orange-600" />
              Columns
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by username, name, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-11 shadow-sm rounded-xl"
            />
          </div>
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700 h-11 px-6 rounded-xl font-bold shadow-lg shadow-orange-500/20 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
            Search
          </Button>
        </form>

        {/* Column Modal */}
        <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-orange-600" />
                Customize View
              </DialogTitle>
              <DialogDescription>
                Select which data fields you want to see in the table.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {ALL_COLUMNS.map((col) => (
                <div 
                  key={col.id} 
                  onClick={() => toggleColumn(col.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors select-none"
                >
                  <div className={visibleColumns.includes(col.id) ? "text-orange-600" : "text-gray-300"}>
                    {visibleColumns.includes(col.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm font-bold ${visibleColumns.includes(col.id) ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                    {col.label}
                  </span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsColumnModalOpen(false)} className="w-full rounded-xl bg-gray-900 text-white font-bold h-11">
                Save Layout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <Card className="shadow-md border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800 flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">User List</CardTitle>
            {!loading && (
              <span className="text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
                {total} Records
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="text-sm text-gray-500">Updating directory...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500 italic">No matching users found.</div>
            ) : (
              <>
                <div className="overflow-x-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                        {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                          <TableHead key={col.id} className="font-black text-[10px] uppercase tracking-wider text-gray-500">
                            {col.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                          {visibleColumns.includes("username") && (
                            <TableCell className="font-bold">
                              <Link href={`/users/${user.username}`} className="text-orange-600 hover:underline">
                                {user.username}
                              </Link>
                            </TableCell>
                          )}
                          {visibleColumns.includes("firstname") && <TableCell>{user.firstname || "—"}</TableCell>}
                          {visibleColumns.includes("lastname") && <TableCell>{user.lastname || "—"}</TableCell>}
                          {visibleColumns.includes("profile") && (
                            <TableCell>
                              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-wider">
                                {user.profile_details?.name || "—"}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumns.includes("last_online") && (
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.enabled ? "bg-green-100 text-green-700 dark:bg-green-900/40" : "bg-red-100 text-red-700 dark:bg-red-900/40"}`}>
                                {user.last_online || "Never"}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumns.includes("expiration") && (
                            <TableCell className={getExpirationStyles(user.expiration)}>
                              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-bold">
                                {user.expiration && <CalendarClock className="w-3.5 h-3.5" />}
                                {user.expiration || "—"}
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.includes("traffic") && (
                            <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                              {user.daily_traffic_details?.traffic ? (
                                <>
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {formatTraffic(user.daily_traffic_details.traffic).split(' ')[0]}
                                  </span>
                                  <span className="text-[9px] ml-1 opacity-60">GB</span>
                                </>
                              ) : "—"}
                            </TableCell>
                          )}
                          {visibleColumns.includes("balance") && (
                            <TableCell className="font-mono font-black text-gray-900 dark:text-gray-100 text-xs">
                              {Number(user.balance).toLocaleString()}
                            </TableCell>
                          )}
                          {visibleColumns.includes("created_at") && (
                            <TableCell className="text-[10px] text-gray-500 font-medium">{user.created_at || "—"}</TableCell>
                          )}
                          {visibleColumns.includes("debt_days") && (
                            <TableCell>
                              <span className={`font-black text-xs ${user.debt_days > 0 ? "text-red-600" : "text-gray-400"}`}>
                                {user.debt_days}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumns.includes("phone") && <TableCell className="text-xs font-medium">{user.phone || "—"}</TableCell>}
                          {visibleColumns.includes("parent_username") && (
                            <TableCell className="text-xs text-purple-600 font-bold uppercase tracking-tighter">
                              @{user.parent_username || "System"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* --- ADVANCED PAGINATION --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 gap-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Showing {from} - {to} of {total}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1 || loading}
                      className="h-9 px-4 py-2 rounded-lg hidden sm:flex"
                    >
                      {/* <ChevronsLeft className="w-4 h-4" /> */}
                      First
                    </Button>

                    {/* Previous Page */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      className="h-9 w-9 p-0 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button> */}

                    {/* Dynamic Range Buttons */}
                    {getPageRange().map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        disabled={loading}
                        className={`h-9 w-9 p-0 rounded-lg text-xs font-black transition-all ${
                          p === page 
                            ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600" 
                            : "hover:border-orange-200"
                        }`}
                      >
                        {p}
                      </Button>
                    ))}

                    {/* Next Page */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                      className="h-9 w-9 p-0 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button> */}

                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || loading}
                      className="h-9  px-4 py-2 rounded-lg hidden sm:flex"
                    >
                      Last
                      {/* <ChevronsRight className="w-4 h-4" /> */}
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