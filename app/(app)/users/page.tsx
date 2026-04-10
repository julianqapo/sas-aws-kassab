"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Loader2,
  CalendarClock,
  CheckSquare,
  Square,
  Settings2,
  Filter,
  ListOrdered,
  Users as UsersIcon,
  RefreshCw,
  AlertTriangle,
  XCircle,
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
  { id: "remaining_days", label: "Remaining Days" },
  { id: "traffic", label: "Traffic" },
  { id: "balance", label: "Balance" },
  { id: "created_at", label: "Created At" },
  { id: "loan_balance", label: "Debt" },
  { id: "phone", label: "Phone" },
  { id: "parent_username", label: "Parent Username" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function UsersPage() {
  const router = useRouter();
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
    "username", "firstname", "profile", "last_online", "expiration", "remaining_days", "traffic",
  ]);

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await getUsers(page, pageSize, searchQuery)) as any;
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

  const handleRowClick = (username: string) => {
    router.push(`/activateUsers/${username}`);
  };

  const formatTraffic = (bytes: number | string | undefined) => {
    if (!bytes || bytes === "—") return "0 GB";
    const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
    const gb = b / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const calculateRemainingDays = (expirationDate: string | null) => {
    if (!expirationDate || expirationDate === "—") return null;
    const now = new Date();
    const exp = new Date(expirationDate.replace(" ", "T"));
    const diffTime = exp.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  };

  const getRowStyles = (expirationDate: string | null) => {
    if (!expirationDate || expirationDate === "—") return "";
    const remaining = calculateRemainingDays(expirationDate);
    if (remaining === null) return "";
    if (remaining === 0) {
      return "bg-red-100 dark:bg-red-950/50 border-l-4 border-l-red-500";
    } else if (remaining <= 7) {
      return "bg-amber-100 dark:bg-amber-950/50 border-l-4 border-l-amber-500";
    }
    return "border-l-4 border-l-transparent";
  };

  const getRemainingDaysDisplay = (remaining: number | null) => {
    if (remaining === null) return <span className="text-gray-400">—</span>;
    if (remaining === 0) {
      return (
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="font-black text-red-600 dark:text-red-400 text-sm">Expired</span>
        </div>
      );
    }
    if (remaining <= 7) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="font-black text-amber-700 dark:text-amber-400 text-sm">{remaining}d</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm tabular-nums">{remaining}d</span>
      </div>
    );
  };

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    const maxVisible = 3;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > maxVisible + 2) items.push("...");
      const start = Math.max(2, page - maxVisible);
      const end = Math.min(totalPages - 1, page + maxVisible);
      for (let i = start; i <= end; i++) items.push(i);
      if (page < totalPages - (maxVisible + 1)) items.push("...");
      items.push(totalPages);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Users</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage SAS4 user accounts and subscriptions</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <div className="hidden md:flex items-center gap-3 mr-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-gray-500">Expired</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-gray-500">≤ 7 days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 h-11 shadow-sm hover:shadow-md transition-shadow duration-300">
              <ListOrdered className="w-4 h-4 text-gray-400" />
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsColumnModalOpen(true)}
              className="rounded-xl border-gray-200 dark:border-gray-800 font-bold text-xs uppercase gap-2 h-11 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <Settings2 className="w-4 h-4 text-orange-600" />
              Columns
            </Button>

            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              disabled={loading}
              className="rounded-xl border-gray-200 dark:border-gray-800 h-11 w-11 p-0 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSearchSubmit}
          className="flex gap-2"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
            <Input
              placeholder="Search by username, name, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-12 shadow-sm rounded-xl border-gray-200 dark:border-gray-800 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300"
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 px-6 rounded-xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 gap-2 transition-all duration-300 active:scale-[0.97]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
            Search
          </Button>
        </motion.form>

        {/* Column Modal */}
        <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-orange-600" />
                Customize View
              </DialogTitle>
              <DialogDescription>Select the data fields to show in the table.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {ALL_COLUMNS.map((col) => (
                <motion.div
                  key={col.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                    visibleColumns.includes(col.id)
                      ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 shadow-sm"
                      : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`transition-colors duration-200 ${visibleColumns.includes(col.id) ? "text-orange-600" : "text-gray-300"}`}>
                    {visibleColumns.includes(col.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm font-bold transition-colors duration-200 ${visibleColumns.includes(col.id) ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                    {col.label}
                  </span>
                </motion.div>
              ))}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsColumnModalOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold h-11 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 active:scale-[0.98]"
              >
                Save Layout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-gray-200/80 dark:border-gray-800 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-950/90">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">User List</CardTitle>
              {!loading && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-black uppercase bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-orange-600 dark:text-orange-400"
                >
                  {total.toLocaleString()} Records
                </motion.span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 space-y-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-100 dark:border-orange-900/30" />
                      <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-orange-500 animate-spin absolute inset-0" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium animate-pulse">Updating directory...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.id)).map((col) => (
                              <TableHead key={col.id} className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                          {users.map((user: any) => {
                            const remaining = calculateRemainingDays(user.expiration);
                            return (
                              <motion.tr
                                key={user.id}
                                // variants={rowVariants}
                                onClick={() => handleRowClick(user.username)}
                                whileHover={{
                                  scale: 1.015,
                                  zIndex: 20,
                                  boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                                  transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    mass: 0.8,
                                  },
                                }}
                                whileTap={{ scale: 0.995 }}
                                className={`border-b border-gray-100 dark:border-gray-800/50 cursor-pointer origin-center relative select-none ${getRowStyles(user.expiration)}`}
                                style={{ position: "relative" }}
                              >
                                {visibleColumns.includes("username") && (
                                  <TableCell className="font-bold py-3.5">
                                    <span className="text-orange-600">{user.username}</span>
                                  </TableCell>
                                )}
                                {visibleColumns.includes("firstname") && (
                                  <TableCell className="py-3.5">{user.firstname || "—"}</TableCell>
                                )}
                                {visibleColumns.includes("lastname") && (
                                  <TableCell className="py-3.5">{user.lastname || "—"}</TableCell>
                                )}
                                {visibleColumns.includes("profile") && (
                                  <TableCell className="py-3.5">
                                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                      {user.profile_details?.name || "—"}
                                    </span>
                                  </TableCell>
                                )}
                                {visibleColumns.includes("last_online") && (
                                  <TableCell className="py-3.5">
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                        user.enabled
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                      }`}
                                    >
                                      {user.last_online || "Never"}
                                    </span>
                                  </TableCell>
                                )}
                                {visibleColumns.includes("expiration") && (
                                  <TableCell className="py-3.5">
                                    <div
                                      className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-black ${
                                        remaining === 0
                                          ? "text-red-700 dark:text-red-400"
                                          : remaining && remaining <= 7
                                          ? "text-amber-700 dark:text-amber-400"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {user.expiration && <CalendarClock className="w-3.5 h-3.5 opacity-70" />}
                                      {user.expiration || "—"}
                                    </div>
                                  </TableCell>
                                )}
                                {visibleColumns.includes("remaining_days") && (
                                  <TableCell className="py-3.5">
                                    {getRemainingDaysDisplay(remaining)}
                                  </TableCell>
                                )}
                                {visibleColumns.includes("traffic") && (
                                  <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs py-3.5">
                                    {user.daily_traffic_details?.traffic ? (
                                      <>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                          {formatTraffic(user.daily_traffic_details.traffic).split(" ")[0]}
                                        </span>
                                        <span className="text-[9px] ml-1 opacity-50">GB</span>
                                      </>
                                    ) : "—"}
                                  </TableCell>
                                )}
                                {visibleColumns.includes("balance") && (
                                  <TableCell className="font-mono font-black text-xs py-3.5">
                                    {Number(user.balance).toLocaleString()}
                                  </TableCell>
                                )}
                                {visibleColumns.includes("created_at") && (
                                  <TableCell className="text-[10px] text-gray-500 font-medium py-3.5">
                                    {user.created_at || "—"}
                                  </TableCell>
                                )}
                                {visibleColumns.includes("loan_balance") && (
                                  <TableCell className="py-3.5">
                                    <span className={`font-black text-xs ${user.loan_balance > 0 ? "text-red-700 dark:text-red-400" : "text-gray-400"}`}>
                                      {user.loan_balance}
                                    </span>
                                  </TableCell>
                                )}
                                {visibleColumns.includes("phone") && (
                                  <TableCell className="text-xs font-medium py-3.5">{user.phone || "—"}</TableCell>
                                )}
                                {visibleColumns.includes("parent_username") && (
                                  <TableCell className="text-xs text-purple-600 font-bold uppercase tracking-tighter py-3.5">
                                    @{user.parent_username || "System"}
                                  </TableCell>
                                )}
                              </motion.tr>
                            );
                          })}
                        </motion.tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-4">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Showing {from} – {to} of {total}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1 || loading}
                          className="h-9 px-3 rounded-lg hidden sm:flex font-bold text-xs uppercase hover:border-orange-300 transition-all duration-200">
                          First
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
                          className="h-9 w-9 p-0 rounded-lg hover:border-orange-300 transition-all duration-200">
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {getPaginationItems().map((p, idx) =>
                            typeof p === "number" ? (
                              <motion.div key={idx} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant={p === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPage(p)}
                                  disabled={loading}
                                  className={`h-9 w-9 p-0 rounded-lg text-xs font-black transition-all duration-200 ${
                                    p === page
                                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500 shadow-md shadow-orange-500/25"
                                      : "hover:border-orange-300"
                                  }`}
                                >
                                  {p}
                                </Button>
                              </motion.div>
                            ) : (
                              <span key={idx} className="px-1.5 text-gray-300 font-bold select-none">···</span>
                            )
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
                          className="h-9 w-9 p-0 rounded-lg hover:border-orange-300 transition-all duration-200">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages || loading}
                          className="h-9 px-3 rounded-lg hidden sm:flex font-bold text-xs uppercase hover:border-orange-300 transition-all duration-200">
                          Last
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}