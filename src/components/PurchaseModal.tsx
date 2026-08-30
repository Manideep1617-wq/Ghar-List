import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, RefreshCw } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; name: string; estimated_price: number; category: string } | null;
  scope: 'house' | 'personal';
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  item,
  scope
}) => {
  const { logExpense } = useApp();
  const [actualAmount, setActualAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (item) {
      setActualAmount(item.estimated_price > 0 ? String(item.estimated_price) : '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualAmount.trim() || Number(actualAmount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await logExpense(scope, item.id, Number(actualAmount), item.category);
      setActualAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log purchase');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-dark shadow-xl overflow-hidden relative p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-charcoal-light/60 hover:text-charcoal hover:bg-cream-dark rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal">Mark as Purchased</h2>
            <p className="text-xs text-charcoal-light">Log the actual spend amount</p>
          </div>
        </div>

        {/* Item Details */}
        <div className="p-4 bg-cream-light border border-borderCream rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-charcoal">{item.name}</span>
            <span className="text-xs px-2.5 py-1 bg-cream-dark rounded-full text-charcoal-light font-medium">
              {item.category}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-charcoal-light mt-2">
            <span>Estimated Price:</span>
            <span className="font-bold text-charcoal">
              {item.estimated_price > 0 ? formatCurrency(item.estimated_price) : 'Not set'}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">
              Actual Amount Paid (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              disabled={loading}
              placeholder="e.g. 150"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal text-lg font-bold placeholder-charcoal-light/40"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !actualAmount.trim()}
            className="w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Log Expense & Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};
