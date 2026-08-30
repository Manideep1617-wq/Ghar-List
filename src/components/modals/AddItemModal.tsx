import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../lib/formatters';
import type { Category, Scope } from '../../types';
import { 
  X, 
  Home, 
  Lock, 
  Clock, 
  ShieldCheck, 
  Plus 
} from 'lucide-react';

export const AddItemModal: React.FC = () => {
  const { 
    isAddItemModalOpen, 
    setIsAddItemModalOpen, 
    profile, 
    addItem 
  } = useApp();

  const [scope, setScope] = useState<Scope>('house');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState<Category>('Groceries');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddItemModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    await addItem(scope, {
      name: name.trim(),
      quantity: quantity.trim() || '1',
      estimatedPrice: Number(estimatedPrice) || 0,
      category,
    });

    setIsSubmitting(false);
    setIsAddItemModalOpen(false);

    // Reset form
    setName('');
    setQuantity('');
    setEstimatedPrice('');
    setCategory('Groceries');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Add New Item
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose list scope to categorize item correctly
            </p>
          </div>
          <button
            onClick={() => setIsAddItemModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Scope Toggle Fork */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select List Scope *
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* House Pick */}
              <button
                type="button"
                onClick={() => setScope('house')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  scope === 'house'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm">House List</span>
                  <Home className={`w-4 h-4 ${scope === 'house' ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <span className="text-[11px] opacity-80 mt-1">
                  Shared household expense
                </span>
              </button>

              {/* Personal Pick */}
              <button
                type="button"
                onClick={() => setScope('personal')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  scope === 'personal'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm">My Personal List</span>
                  <Lock className={`w-4 h-4 ${scope === 'personal' ? 'text-purple-400' : 'text-slate-500'}`} />
                </div>
                <span className="text-[11px] opacity-80 mt-1">
                  Private to you only
                </span>
              </button>

            </div>
          </div>

          {/* Contextual Dynamic Guidance Banner */}
          {scope === 'house' ? (
            profile?.is_host ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Host Addition:</strong> Item will be added directly as <strong>Approved</strong> to the shared list.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>
                  <strong>Member Request:</strong> Will be submitted as <strong>Pending Host Approval</strong> before counting toward house spend.
                </span>
              </div>
            )
          ) : (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center space-x-2 text-xs text-purple-300">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Private Item:</strong> Visible only to you. Never syncs to house list or counts toward shared expenses.
              </span>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder={scope === 'house' ? 'e.g. Sona Masoori Rice 25kg, Cooking Oil' : 'e.g. Whey Protein Powder, Headphones'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Quantity & Estimated Price Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity / Size
              </label>
              <input
                type="text"
                placeholder="e.g. 25kg, 2 packets"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 1450"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all active:scale-95 ${
                scope === 'house'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
              }`}
            >
              {isSubmitting ? 'Adding...' : scope === 'house' && !profile?.is_host ? 'Submit Request' : 'Add Item'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
