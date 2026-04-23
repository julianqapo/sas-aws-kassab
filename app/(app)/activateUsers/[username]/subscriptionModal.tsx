"use client";

import { useState, useEffect } from "react";
import { getOldestAvailableSeries, getFirstAvailablePin, activateSubscription } from "./db_service";
import { Button } from "@/app/components/ui/button";
import { 
  User, 
  CreditCard, 
  ChevronDown, 
  Loader2, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface AssignSeriesModalProps {
  username: string;
  currentSubscription: string;
  onClose: () => void;
}

export default function AssignSeriesModal({ 
  username, 
  currentSubscription, 
  onClose 
}: AssignSeriesModalProps) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [loadingPin, setLoadingPin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // --- NEW STATE: To track the final result ---
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleAssign = async (username: string) => {
    setLoadingPin(true);
    setStatus(null); // Reset status before new attempt
    
    try {
      // 1. Get the first available PIN
      const pin = await getFirstAvailablePin(selectedSeries);
      
      if (!pin) {
        setLoadingPin(false);
        setStatus({ type: 'error', message: "No available PINs for the selected series." });
        return;
      }
      
      console.log(`Assigning PIN ${pin} from series ${selectedSeries} to user ${username}`);

      // 2. Activate the subscription
      const result = await activateSubscription(username, pin, passwordInput);

      setLoadingPin(false);

      if (result.success) {
        setStatus({ type: 'success', message: "Subscription activated successfully!" });
        // Optionally: Auto-close after 2 seconds if you prefer
        // setTimeout(onClose, 2000); 
      } else {
        setStatus({ type: 'error', message: result.error || "Activation failed." });
      }
    } catch (err) {
      setLoadingPin(false);
      setStatus({ type: 'error', message: "An unexpected error occurred." });
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getOldestAvailableSeries();
      setOptions(data);
      if (data.length > 0) setSelectedSeries(data[0].series);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assign New Series</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
              <User className="w-4 h-4 text-orange-600" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-orange-500">Target User</p>
                <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">{username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-blue-500">Current Plan</p>
                <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">{currentSubscription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm text-gray-500 italic">Finding oldest available stock...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* --- NEW UI: Result Message --- */}
              {status && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                  status.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              {/* Form elements (Disabled if success to prevent double sub) */}
              {!status || status.type === 'error' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Select Priority Card</label>
                    <div className="relative">
                      <select
                        value={selectedSeries}
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                      >
                        {options.map((opt) => (
                          <option key={opt.series} value={opt.series}>
                            #{opt.profile_details.name} : {opt.value} — {opt.series} 
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest">أدخل كلمة مرور التفعيل للمتابعة</label>
                    <input
                      type="password"
                      placeholder="كلمة مرور التفعيل..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          {status?.type === 'success' ? (
             <Button onClick={onClose} className="flex-1 rounded-xl h-12 bg-gray-900 text-white font-bold">
               Close & Finish
             </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">Cancel</Button>
              <Button 
                onClick={() => handleAssign(username)}
                disabled={loadingPin || options.length === 0 || !passwordInput}
                className="flex-1 rounded-xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {loadingPin ? <Loader2 className="w-5 h-5 animate-spin" /> : "Assign Series"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}