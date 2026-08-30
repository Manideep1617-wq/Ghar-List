import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../lib/formatters';
import { X, ShoppingBag, CheckCircle } from 'lucide-react';

export const PurchaseModal: React.FC = () => {
  const { 
    isPurchaseModalOpen, 
    setIsPurchaseModalOpen, 
    itemToPurchase, 
    setItemToPurchase,
    markItemAsPurchased 
  } = useApp();

  const [actualAmount, setActualAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToPurchase) {
      setActualAmount(String(itemToPurchase.item.estimated_price || ''));
    }
  }, [itemToPurchase]);

  if (!isPurchaseModalOpen || !itemToPurchase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(actualAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);

    await markItemAsPurchased(
      itemToPurchase.item.id,
      itemToPurchase.scope,
      amount
    );

    setIsSubmitting(false);
    setIsPurchaseModalOpen(false);
    setItemToPurchase(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Mark Item Purchased
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Log final actual expense amount for {itemToPurchase.item.name}
            </p>
          </div>
          <button
            onClick={() => {
              setIsPurchaseModalOpen(false);
              setItemToPurchase(null);
            }}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Selected Item</div>
            <div className="font-bold text-base text-slate-100">{itemToPurchase.item.name}</div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
              <span>Scope: <strong className="capitalize text-slate-200">{itemToPurchase.scope}</strong></span>
              <span>Estimated: <strong className="text-emerald-400">{formatINR(itemToPurchase.item.estimated_price)}</strong></span>
            </div>
          </div>

          {/* Actual Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Actual Amount Paid (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400 text-base">₹</span>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Enter final price paid"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This amount will be recorded in {itemToPurchase.scope === 'house' ? 'Shared House Expenses' : 'Your Personal Expenses'}.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsPurchaseModalOpen(false);
                setItemToPurchase(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Confirm & Log Spend'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
