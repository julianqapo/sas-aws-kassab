"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { BarChart3, Loader2 } from "lucide-react";
import { getProfileStats } from "./db_service";

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
      setStats(data.sort((a: ProfileStat, b: ProfileStat) => b.quantity_left - a.quantity_left));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 px-5 rounded-xl font-bold text-xs uppercase shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 gap-2 transition-all duration-300 active:scale-[0.97]"
      >
        <BarChart3 className="w-4 h-4" />
        View Profile Inventory
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Inventory by Profile
            </DialogTitle>
            <DialogDescription>Current stock levels per profile type.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-orange-100 dark:border-orange-900/30" />
                  <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-orange-500 animate-spin absolute inset-0" />
                </div>
                <span className="text-sm text-gray-400 font-medium animate-pulse">Calculating inventory...</span>
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium">No data found.</div>
            ) : (
              stats.map((stat, i) => (
                <motion.div
                  key={stat.profile_name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  whileHover={{ x: 4 }}
                  className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-200 group"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile</p>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors duration-200">
                      {stat.profile_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Qty Left</p>
                    <p className={`text-xl font-mono font-black ${stat.quantity_left > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {stat.quantity_left.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold h-11 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 active:scale-[0.98]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}