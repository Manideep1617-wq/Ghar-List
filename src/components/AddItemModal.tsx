import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingBasket, User, Info, RefreshCw } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScope?: 'house' | 'personal';
}

const CATEGORIES = [
  'Groceries',
  'Utilities',
  'Household Supplies',
  'Snacks & Drinks',
  'Personal Care',
  'Entertainment',
  'Other'
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  initialScope = 'house'
}) => {
  const { addHouseItem, addPersonalItem, profile } = useApp();
  const [scope, setScope] = useState<'house' | 'personal'>(initialScope);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);

    const price = estimatedPrice ? Number(estimatedPrice) : 0;

    try {
      if (scope === 'house') {
        await addHouseItem(name, quantity, price, category);
      } else {
        await addPersonalItem(name, quantity, price, category);
      }
      // Reset form
      setName('');
      setQuantity('');
      setEstimatedPrice('');
      setCategory('Groceries');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-cream-dark shadow-xl overflow-hidden relative p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-charcoal-light/60 hover:text-charcoal hover:bg-cream-dark rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="font-serif text-2xl font-bold mb-6 text-charcoal">Add New Item</h2>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FORK SELECTOR (HOUSE VS PERSONAL TOGGLE) */}
          <div>
            <label className="block text-xs font-bold text-charcoal-light uppercase tracking-wider mb-2.5">
              Select List Scope
            </label>
            <div className="grid grid-cols-2 gap-3 bg-cream-dark p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setScope('house')}
                className={`flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all ${
                  scope === 'house'
                    ? 'bg-white text-terracotta shadow-sm border border-borderCream/40'
                    : 'text-charcoal-light/80 hover:text-charcoal'
                }`}
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>House List</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('personal')}
                className={`flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all ${
                  scope === 'personal'
                    ? 'bg-white text-terracotta shadow-sm border border-borderCream/40'
                    : 'text-charcoal-light/80 hover:text-charcoal'
                }`}
              >
                <User className="w-4 h-4" />
                <span>My Personal List</span>
              </button>
            </div>

            {/* Scope explanation helper banner */}
            <div className="mt-3 p-3 bg-cream-light border border-borderCream rounded-2xl flex gap-2.5 text-xs text-charcoal-light leading-relaxed">
              <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div>
                {scope === 'house' ? (
                  profile?.is_host ? (
                    <span>
                      <strong>House List:</strong> You are the Host. This item will be added directly as <strong>Approved</strong> and is visible to everyone.
                    </span>
                  ) : (
                    <span>
                      <strong>House List:</strong> Added as a <strong>request</strong>. It must be approved by the Host before it appears as live in the house pool.
                    </span>
                  )
                ) : (
                  <span>
                    <strong>Personal List:</strong> Completely private to you. It will never sync to the household, and doesn't require any approvals.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Milk, Rice, Skincare, Skimmed Milk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 litres, 3 packs"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
                  Est. Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 120"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal placeholder-charcoal-light/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-4 py-3 bg-cream-light border border-borderCream rounded-xl focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20 text-charcoal"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-4 bg-terracotta hover:bg-terracotta-hover text-white font-medium rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Add to List'}
          </button>
        </form>
      </div>
    </div>
  );
};
