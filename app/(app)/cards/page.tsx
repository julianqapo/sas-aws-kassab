"use client";

import { useState, useEffect } from "react";
import { getSeries } from "./db_service"; // Adjust import path

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
  profile_details?: {
    name?: string;
  };
}

export default function SeriesScreen() {
  // Data State
  const [seriesData, setSeriesData] = useState<SASSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(50); // Default 50 per page
  const [sortBy, setSortBy] = useState("series_date"); // Default sort
  const [direction, setDirection] = useState<"asc" | "desc">("desc"); // Default direction
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    async function loadSeries() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getSeries(page, count, "", sortBy, direction);
        // console.log("API Result:", result.data.data[0]);

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
  }, [page, count, sortBy, direction]); // Refetch when any of these change

  // --- Handlers ---
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      // New column: set as sortBy and default to descending
      setSortBy(column);
      setDirection("desc");
    }
    setPage(1); // Always reset to page 1 when sorting changes
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCount(Number(e.target.value));
    setPage(1); // Reset to page 1 when page size changes
  };

  // --- Helper for Table Headers ---
  const SortableHeader = ({ label, columnKey }: { label: string; columnKey: string }) => {
    const isActive = sortBy === columnKey;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
        onClick={() => handleSort(columnKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <span className="inline-flex flex-col w-3">
            {/* Up Arrow */}
            <svg className={`h-2 w-3 ${(isActive && direction === 'asc') ? 'text-blue-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8l-6 6h12z" />
            </svg>
            {/* Down Arrow */}
            <svg className={`h-2 w-3 -mt-[2px] ${(isActive && direction === 'desc') ? 'text-blue-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 16l6-6H6z" />
            </svg>
          </span>
        </div>
      </th>
    );
  };

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Series Management</h1>
        
        <div className="flex items-center space-x-4">
          {/* Items Per Page Dropdown */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <label htmlFor="perPage">Show:</label>
            <select 
              id="perPage" 
              value={count} 
              onChange={handleCountChange}
              className="border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={400}>400</option>
            </select>
          </div>

          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
            Total Items: {totalItems}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 mb-4 relative min-h-[400px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <div className="text-blue-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border">Updating...</div>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Series" columnKey="series" />
              <SortableHeader label="Profile" columnKey="name" />
              <SortableHeader label="Value" columnKey="value" />
              <SortableHeader label="Used" columnKey="used" />
              <SortableHeader label="Qty" columnKey="qty" />
              <SortableHeader label="Expiration" columnKey="expiration" />
              <SortableHeader label="Creation Date" columnKey="series_date" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {seriesData.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No series found.
                </td>
              </tr>
            ) : (
              seriesData.map((item, index) => (
                <tr key={item.series || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.series}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.profile_details?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.used == null ? '0' : item.used}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.expiration ? new Date(item.expiration).toLocaleDateString() : 'N/A'}
                  </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.series_date 
                        ? new Date(item.series_date.replace(" ", "T")).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) 
                        : 'N/A'}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
        <p className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}