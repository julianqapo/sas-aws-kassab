"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { Button } from "../../components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  ListOrdered,
  BarChart3,
  Package,
  RefreshCw,
} from "lucide-react";
import { getSeries, getProfileStats } from "./db_service";

interface SASSeries {
  series: string;
  type: string;
  value: string | number;
  qty: number;
  used: number;
  username: string;
  name: string;
  series_date: string;
  expiration: string;
  profile_details?: { name?: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

const COUNT_OPTIONS = [25, 50, 100, 200, 400];

const COLUMNS = [
  { key: "series", label: "Series ID" },
  { key: "name", label: "Profile" },
  { key: "value", label: "Value" },
  { key: "used", label: "Used" },
  { key: "qty", label: "Qty" },
  { key: "expiration", label: "Expiration" },
  { key: "series_date", label: "Created At" },
];

export default function SeriesScreen() {
  const [seriesData, setSeriesData] = useState<SASSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(50);
  const [sortBy, setSortBy] = useState("series_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<{ profile_name: string; quantity_left: number }[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    async function loadSeries() {
      try {
        setIsLoading(true);
        const result = await getSeries(page, count, "", sortBy, direction);
        if (!result.success || !result.data || !Array.isArray(result.data.data)) {
          throw new Error(result.error || "Failed to load series data.");
        }
        setSeriesData(result.data.data);
        setTotalPages(result.data.last_page || 1);
        setTotalItems(result.data.total || 0);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    loadSeries();
  }, [page, count, sortBy, direction]);

  const handleOpenStats = async () => {
    setIsStatsOpen(true);
    setIsStatsLoading(true);
    try {
      const stats = await getProfileStats();
      setStatsData(stats.sort((a: any, b: any) => b.quantity_left - a.quantity_left));
    } catch (err) {
      console.error(err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("desc");
    }
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl border-red-200 dark:border-red-900">
          <CardContent className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <p className="font-bold text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Series Management</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track voucher series and inventory</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <Button
              onClick={handleOpenStats}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 px-5 rounded-xl font-bold text-xs uppercase shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 gap-2 transition-all duration-300 active:scale-[0.97]"
            >
              <BarChart3 className="w-4 h-4" />
              Inventory Stats
            </Button>

            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 h-11 shadow-sm hover:shadow-md transition-shadow duration-300">
              <ListOrdered className="w-4 h-4 text-gray-400" />
              <select
                value={count}
                onChange={(e) => { setCount(Number(e.target.value)); setPage(1); }}
                className="bg-transparent text-xs font-bold uppercase outline-none cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {COUNT_OPTIONS.map((c) => (
                  <option key={c} value={c}>Show {c}</option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => { setPage(1); }}
              disabled={isLoading}
              className="rounded-xl border-gray-200 dark:border-gray-800 h-11 w-11 p-0 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </motion.div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-gray-200/80 dark:border-gray-800 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-950/90">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Series List</CardTitle>
              {!isLoading && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-black uppercase bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-orange-600 dark:text-orange-400"
                >
                  {totalItems.toLocaleString()} Records
                </motion.span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {isLoading && seriesData.length === 0 ? (
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
                    <span className="text-sm text-gray-400 font-medium animate-pulse">Loading series...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {/* Inline loading overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-800">
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          <span className="text-xs font-bold text-gray-500">Refreshing...</span>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto custom-scrollbar px-2">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            {COLUMNS.map((col) => (
                              <TableHead
                                key={col.key}
                                onClick={() => handleSort(col.key)}
                                className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 select-none"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{col.label}</span>
                                  <div className="flex flex-col -space-y-1">
                                    <ChevronUp className={`w-3 h-3 ${sortBy === col.key && direction === "asc" ? "text-orange-500" : "text-gray-300 dark:text-gray-600"}`} />
                                    <ChevronDown className={`w-3 h-3 ${sortBy === col.key && direction === "desc" ? "text-orange-500" : "text-gray-300 dark:text-gray-600"}`} />
                                  </div>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                          {seriesData.map((item, idx) => (
                            // Replace the motion.tr and its className with this:

                              <motion.tr
                                key={item.series || idx}
                                variants={rowVariants}
                                whileHover={{
                                  scale: 1.015,
                                  zIndex: 20,
                                  boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                                  transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 },
                                }}
                                whileTap={{ scale: 0.995 }}
                                className={`border-b border-gray-100 dark:border-gray-800/50 cursor-pointer origin-center relative select-none ${
                                  item.used >= item.qty
                                    ? "bg-red-100 dark:bg-red-950/50 border-l-4 border-l-red-500"
                                    : "border-l-4 border-l-transparent"
                                }`}
                                style={{ position: "relative" }}
                              >
                              <TableCell className="py-3.5 font-mono font-bold text-sm text-orange-600">
                                {item.series}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                  {item.profile_details?.name || "—"}
                                </span>
                              </TableCell>
                              <TableCell className="py-3.5 font-black text-sm text-gray-900 dark:text-white">
                                {item.value}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <span className={`font-black text-sm ${item.used == item.qty ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                  {item.used ?? 0}
                                </span>
                              </TableCell>
                              <TableCell className="py-3.5 font-bold text-sm text-gray-700 dark:text-gray-300">
                                {item.qty}
                              </TableCell>
                              <TableCell className="py-3.5 text-xs text-gray-700">
                                {item.expiration ? new Date(item.expiration).toLocaleDateString() : "—"}
                              </TableCell>
                              <TableCell className="py-3.5 text-xs text-gray-700">
                                {item.series_date
                                  ? new Date(item.series_date.replace(" ", "T")).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                  : "—"}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-4">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          disabled={page === 1 || isLoading}
                          className="h-9 px-3 rounded-lg hidden sm:flex font-bold text-xs uppercase hover:border-orange-300 transition-all duration-200"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1 || isLoading}
                          className="h-9 w-9 p-0 rounded-lg hover:border-orange-300 transition-all duration-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page numbers */}
                        {/* Page numbers */}
                        {(() => {
                          const items: (number | string)[] = [];
                          const maxVisible = 2;
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
                          return items.map((p, idx) =>
                            typeof p === "number" ? (
                              <motion.div key={idx} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant={p === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPage(p)}
                                  disabled={isLoading}
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
                              <span key={idx} className="px-1.5 text-gray-300 dark:text-gray-600 font-bold select-none">
                                ···
                              </span>
                            )
                          );
                        })()}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages || isLoading}
                          className="h-9 w-9 p-0 rounded-lg hover:border-orange-300 transition-all duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          disabled={page >= totalPages || isLoading}
                          className="h-9 px-3 rounded-lg hidden sm:flex font-bold text-xs uppercase hover:border-orange-300 transition-all duration-200"
                        >
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

        {/* Stats Modal */}
        <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Inventory Summary
              </DialogTitle>
              <DialogDescription>Remaining quantity by profile type.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto space-y-2 py-2">
              {isStatsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-100 dark:border-orange-900/30" />
                    <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-orange-500 animate-spin absolute inset-0" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium animate-pulse">Calculating balances...</span>
                </div>
              ) : statsData.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">No data found.</div>
              ) : (
                statsData.map((stat) => (
                  <motion.div
                    key={stat.profile_name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-200 group"
                  >
                    <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors duration-200">
                      {stat.profile_name}
                    </span>
                    <span className={`font-mono font-black text-lg ${stat.quantity_left > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {stat.quantity_left.toLocaleString()}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsStatsOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold h-11 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 active:scale-[0.98]"
              >
                Close Overview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}