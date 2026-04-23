import React, { useState } from 'react';
import { extendSubscription } from './db_service'; // Adjust path as needed

interface ExtendModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const ExtendSubscriptionModal: React.FC<ExtendModalProps> = ({ username, isOpen, onClose, onSuccess }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExtend = async () => {
    if (!passwordInput) return;

    setIsLoading(true);
    setError(null);

    const result = await extendSubscription(username, passwordInput);
    console.log(result)

    if (result.success) {
      setPasswordInput('');
      onSuccess(result.data);
      onClose();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };
  
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/20 backdrop-blur-md">
    {/* Use bg-gray-500/20 for a very light tint or bg-transparent if you want no tint at all */}
    <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
        Extend Subscription
      </h2>
      
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        You are about to extend the subscription for <span className="text-orange-600 font-bold">@{username}</span>. 
        This will apply the default profile settings to the account.
      </p>

      <div className="mt-6 space-y-3">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          أدخل كلمة مرور التفعيل
        </label>
        <input
          type="password"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          placeholder='كلمة مرور التفعيل...'
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-100 rounded-xl transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <button
          onClick={handleExtend}
          disabled={!passwordInput || isLoading}
          className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg ${
            passwordInput && !isLoading
              ? 'bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {isLoading ? 'Processing...' : 'Confirm Extension'}
        </button>
      </div>
    </div>
  </div>
);
};

export default ExtendSubscriptionModal;