"use client";

import { useState, useEffect } from "react";
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

export default function SeriesScreen() {
  // Data State
  const [seriesData, setSeriesData] = useState<SASSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(50);
  const [sortBy, setSortBy] = useState("series_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<{profile_name: string, quantity_left: number}[]>([]);
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
      setStatsData(stats.sort((a, b) => b.quantity_left - a.quantity_left));
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

  const SortableHeader = ({ label, columnKey }: { label: string; columnKey: string }) => {
    const isActive = sortBy === columnKey;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
        onClick={() => handleSort(columnKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <span className="inline-flex flex-col">
            <svg className={`h-2 w-3 ${isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 8l-6 6h12z" /></svg>
            <svg className={`h-2 w-3 ${isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l6-6H6z" /></svg>
          </span>
        </div>
      </th>
    );
  };

  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Series Management</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenStats}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Inventory Stats
          </button>

          <select 
            value={count} 
            onChange={(e) => {setCount(Number(e.target.value)); setPage(1);}}
            className="border border-gray-300 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            {[25, 50, 100, 200, 400].map(c => <option key={c} value={c}>Show {c}</option>)}
          </select>

          <span className="text-sm font-medium bg-blue-50 text-blue-700 py-2 px-4 rounded-lg border border-blue-100">
            Total: {totalItems.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 animate-pulse text-blue-600 font-bold">Refreshing...</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader label="Series ID" columnKey="series" />
                <SortableHeader label="Profile" columnKey="name" />
                <SortableHeader label="Value" columnKey="value" />
                <SortableHeader label="Used" columnKey="used" />
                <SortableHeader label="Qty" columnKey="qty" />
                <SortableHeader label="Expiration" columnKey="expiration" />
                <SortableHeader label="Created At" columnKey="series_date" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seriesData.map((item, idx) => (
                <tr key={item.series || idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{item.series}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.profile_details?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{item.value}</td>
                  <td className={`px-6 py-4 text-sm ${item.used == item.qty ? 'text-red-600' : 'text-green-600 font-bold'}`}>{item.used ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.qty}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.expiration ? new Date(item.expiration).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.series_date ? new Date(item.series_date.replace(" ", "T")).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-30">Prev</button>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-30 text-blue-600">Next</button>
        </div>
      </div>

      {/* Stats Modal */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-800">Inventory Summary</h2>
              <button onClick={() => setIsStatsOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-light">×</button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {isStatsLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-400 animate-pulse">Calculating balances...</span>
                </div>
              ) : (
                statsData.map((stat) => (
                  <div key={stat.profile_name} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-all group">
                    <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{stat.profile_name}</span>
                    <span className={`font-mono font-black text-lg ${stat.quantity_left > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.quantity_left.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsStatsOpen(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">Close Overview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}