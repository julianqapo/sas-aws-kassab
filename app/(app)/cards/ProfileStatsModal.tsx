"use client";

import { useState } from "react";
import { getProfileStats } from "./db_service"; // Adjust path

interface ProfileStat {
  profile_name: string;
  quantity_left: number;
}

export default function ProfileStatsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<ProfileStat[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await getProfileStats();
      console.log("Fetched Profile Stats:", data); // Debug log
      // Sort by highest quantity left
      setStats(data.sort((a, b) => b.quantity_left - a.quantity_left));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
      >
        View Profile Inventory
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Inventory by Profile</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Calculating inventory totals...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.map((stat) => (
                <div 
                  key={stat.profile_name} 
                  className="flex justify-between items-center p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-blue-200 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Profile Name</p>
                    <p className="text-gray-900 font-semibold">{stat.profile_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Qty Left</p>
                    <p className={`text-xl font-mono font-bold ${stat.quantity_left > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.quantity_left.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.length === 0 && (
                <p className="text-center text-gray-500 py-4">No data found.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}