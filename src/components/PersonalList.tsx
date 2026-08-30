import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PersonalItem } from '../context/AppContext';
import { User, Plus, Check, Trash2, CheckCircle2, Lock } from 'lucide-react';

interface PersonalListProps {
  onOpenAddItem: () => void;
  onOpenPurchase: (item: PersonalItem) => void;
}

export const PersonalList: React.FC<PersonalListProps> = ({
  onOpenAddItem,
  onOpenPurchase
}) => {
  const { personalItems, deletePersonalItem } = useApp();
  const [activeTab, setActiveTab] = useState<'shopping' | 'purchased'>('shopping');

  // Filter items
  const activeList = personalItems.filter(item => item.status === 'active');
  const purchasedList = personalItems.filter(item => item.status === 'purchased');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-terracotta mb-1">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Private List</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">My Personal List</h2>
          <p className="text-sm text-charcoal-light mt-1">
            Your private shopping list. Nobody else in the house can see these items.
          </p>
        </div>
        <button
          onClick={onOpenAddItem}
          className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Personal Item</span>
        </button>
      </div>

      {/* Privacy reminder banner */}
      <div className="p-4 bg-cream-dark/50 border border-borderCream rounded-2xl flex gap-3 text-xs text-charcoal-light">
        <Lock className="w-5 h-5 text-terracotta/70 shrink-0 mt-0.5" />
        <span>
          <strong>Privacy Guard:</strong> Rice, cleaning supplies, and milk belong to the House. Skincare, protein powder, or snacks belong here. Items in this list and their logged expenses will never affect the shared household bill or be visible to the Host.
        </span>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-cream-dark gap-6">
        <button
          onClick={() => setActiveTab('shopping')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === 'shopping' ? 'text-terracotta' : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <span>Active List ({activeList.length})</span>
          {activeTab === 'shopping' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('purchased')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === 'purchased' ? 'text-terracotta' : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <span>Purchased ({purchasedList.length})</span>
          {activeTab === 'purchased' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>
      </div>

      {/* ACTIVE SHOPPING LIST */}
      {activeTab === 'shopping' && (
        <div className="bg-white border border-cream-dark rounded-3xl overflow-hidden shadow-sm">
          {activeList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-cream-dark rounded-full flex items-center justify-center text-charcoal-light/60 mx-auto mb-4">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">No personal items</h3>
              <p className="text-sm text-charcoal-light mt-1 max-w-xs mx-auto">
                Your personal shopping list is empty. Add items that only you need.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {activeList.map(item => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-cream-light/35 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-charcoal truncate">{item.name}</h4>
                      <span className="shrink-0 text-xs px-2.5 py-0.5 bg-cream-dark rounded-full text-charcoal-light font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-light mt-1.5">
                      {item.quantity && (
                        <span>Qty: <strong className="text-charcoal">{item.quantity}</strong></span>
                      )}
                      {item.estimated_price > 0 && (
                        <span>Est. Price: <strong className="text-charcoal">{formatCurrency(item.estimated_price)}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Mark Purchased */}
                    <button
                      onClick={() => onOpenPurchase(item)}
                      className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200/50 flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark Purchased</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deletePersonalItem(item.id)}
                      className="p-2 hover:bg-red-50 text-charcoal-light/60 hover:text-red-600 rounded-full transition-all"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PURCHASED LIST */}
      {activeTab === 'purchased' && (
        <div className="bg-white border border-cream-dark rounded-3xl overflow-hidden shadow-sm">
          {purchasedList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-cream-dark rounded-full flex items-center justify-center text-charcoal-light/60 mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">No purchased items</h3>
              <p className="text-sm text-charcoal-light mt-1 max-w-xs mx-auto">
                No personal items have been marked as purchased yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {purchasedList.map(item => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-green-50/10">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-charcoal line-through truncate opacity-60">{item.name}</h4>
                      <span className="shrink-0 text-xs px-2.5 py-0.5 bg-green-100/50 text-green-700 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Purchased</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-light mt-1.5">
                      {item.quantity && (
                        <span>Qty: <strong>{item.quantity}</strong></span>
                      )}
                      {item.estimated_price > 0 && (
                        <span>Est. Price: <strong>{formatCurrency(item.estimated_price)}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deletePersonalItem(item.id)}
                    className="p-2 hover:bg-red-50 text-charcoal-light/60 hover:text-red-600 rounded-full transition-all"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
