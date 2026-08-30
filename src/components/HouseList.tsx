import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { HouseItem } from '../context/AppContext';
import { 
  ShoppingBasket, 
  Check, 
  X, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  Edit3 
} from 'lucide-react';

interface HouseListProps {
  onOpenAddItem: () => void;
  onOpenPurchase: (item: HouseItem) => void;
}

export const HouseList: React.FC<HouseListProps> = ({
  onOpenAddItem,
  onOpenPurchase
}) => {
  const { 
    houseItems, 
    profile, 
    approveHouseItem, 
    rejectHouseItem, 
    deleteHouseItem, 
    householdMembers 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shopping' | 'pending' | 'purchased'>('shopping');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Filter items
  const approvedItems = houseItems.filter(item => item.status === 'approved');
  const pendingItems = houseItems.filter(item => item.status === 'pending');
  const purchasedItems = houseItems.filter(item => item.status === 'purchased');

  const isHost = profile?.is_host || false;

  const handleStartEdit = (item: HouseItem) => {
    setEditingItem(item.id);
    setEditQty(item.quantity || '');
    setEditPrice(String(item.estimated_price || 0));
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      await approveHouseItem(itemId, editQty, Number(editPrice));
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getMemberName = (uid: string) => {
    const mem = householdMembers.find(m => m.id === uid);
    return mem ? mem.full_name : 'Household Member';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">House Shopping List</h2>
          <p className="text-sm text-charcoal-light mt-1">
            Shared items needed for the household.
          </p>
        </div>
        <button
          onClick={onOpenAddItem}
          className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add House Item</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-cream-dark gap-6">
        <button
          onClick={() => setActiveTab('shopping')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === 'shopping' ? 'text-terracotta' : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <span>Active List ({approvedItems.length})</span>
          {activeTab === 'shopping' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all relative flex items-center gap-1.5 ${
            activeTab === 'pending' ? 'text-terracotta' : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <span>Requests ({pendingItems.length})</span>
          {pendingItems.length > 0 && (
            <span className="w-5 h-5 bg-terracotta/10 text-terracotta text-xs rounded-full flex items-center justify-center font-bold">
              {pendingItems.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('purchased')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all relative ${
            activeTab === 'purchased' ? 'text-terracotta' : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <span>Purchased ({purchasedItems.length})</span>
          {activeTab === 'purchased' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>
      </div>

      {/* ACTIVE SHOPPING LIST */}
      {activeTab === 'shopping' && (
        <div className="bg-white border border-cream-dark rounded-3xl overflow-hidden shadow-sm">
          {approvedItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-cream-dark rounded-full flex items-center justify-center text-charcoal-light/60 mx-auto mb-4">
                <ShoppingBasket className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">No active items</h3>
              <p className="text-sm text-charcoal-light mt-1 max-w-xs mx-auto">
                All house items have been purchased or no items have been added yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {approvedItems.map(item => (
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
                      <span>Added by: <strong className="text-charcoal">{getMemberName(item.added_by)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark Purchased Button */}
                    <button
                      onClick={() => onOpenPurchase(item)}
                      className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200/50 flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark Purchased</span>
                    </button>

                    {/* Host Edit / Delete */}
                    {isHost && (
                      <div className="flex items-center border border-borderCream rounded-full overflow-hidden bg-cream-light">
                        <button
                          onClick={() => handleStartEdit(item)}
                          title="Quick Edit"
                          className="p-2 hover:bg-cream-dark text-charcoal-light/70 hover:text-charcoal transition-all border-r border-borderCream"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteHouseItem(item.id)}
                          title="Delete Item"
                          className="p-2 hover:bg-red-50 text-charcoal-light/70 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REQUESTS LIST (AWAITING APPROVAL) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {!isHost && pendingItems.length > 0 && (
            <div className="p-4 bg-terracotta/5 border border-terracotta/10 rounded-2xl flex gap-3 text-sm text-charcoal-light">
              <Clock className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <span>
                These items have been requested by household members. Only the <strong>Host</strong> can approve or reject them. Once approved, they will shift to the active shopping list.
              </span>
            </div>
          )}

          <div className="bg-white border border-cream-dark rounded-3xl overflow-hidden shadow-sm">
            {pendingItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-cream-dark rounded-full flex items-center justify-center text-charcoal-light/60 mx-auto mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal">No pending requests</h3>
                <p className="text-sm text-charcoal-light mt-1 max-w-xs mx-auto">
                  There are no requests awaiting review from household members.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-cream-dark">
                {pendingItems.map(item => (
                  <div key={item.id} className="p-4 sm:p-5 hover:bg-cream-light/35 transition-colors">
                    {editingItem === item.id ? (
                      /* Quick Edit Block (Only for Host) */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-charcoal">Review Request: {item.name}</h4>
                          <span className="text-xs px-2.5 py-0.5 bg-cream-dark rounded-full text-charcoal-light">
                            {item.category}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-charcoal-light uppercase mb-1">
                              Quantity
                            </label>
                            <input
                              type="text"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-cream-light border border-borderCream rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-charcoal-light uppercase mb-1">
                              Estimated Price (₹)
                            </label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-cream-light border border-borderCream rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-cream-dark">
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-3.5 py-1.5 text-xs border border-borderCream bg-cream-dark text-charcoal rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-4 py-1.5 text-xs bg-terracotta hover:bg-terracotta-hover text-white rounded-lg font-medium"
                          >
                            Approve with Edits
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard View of Request */
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-charcoal truncate">{item.name}</h4>
                            <span className="shrink-0 text-xs px-2.5 py-0.5 bg-terracotta/5 border border-terracotta/10 text-terracotta rounded-full flex items-center gap-1 font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting approval</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-light mt-1.5">
                            {item.quantity && (
                              <span>Qty: <strong className="text-charcoal">{item.quantity}</strong></span>
                            )}
                            {item.estimated_price > 0 && (
                              <span>Est. Price: <strong className="text-charcoal">{formatCurrency(item.estimated_price)}</strong></span>
                            )}
                            <span>Requested by: <strong className="text-charcoal">{getMemberName(item.added_by)}</strong></span>
                          </div>
                        </div>

                        {/* Host Approval controls */}
                        {isHost ? (
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Approve */}
                            <button
                              onClick={() => approveHouseItem(item.id)}
                              className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full border border-green-200/50 shadow-sm transition-all"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            {/* Edit & Approve */}
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-2 bg-cream-dark hover:bg-cream-light text-charcoal rounded-full border border-borderCream shadow-sm transition-all"
                              title="Edit & Approve"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {/* Reject */}
                            <button
                              onClick={() => rejectHouseItem(item.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full border border-red-100 shadow-sm transition-all"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // Member delete if it was their own request
                          item.added_by === profile?.id && (
                            <button
                              onClick={() => deleteHouseItem(item.id)}
                              className="p-2 hover:bg-red-50 text-charcoal-light/60 hover:text-red-600 border border-transparent hover:border-red-100 rounded-full transition-all"
                              title="Cancel Request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PURCHASED ITEMS */}
      {activeTab === 'purchased' && (
        <div className="bg-white border border-cream-dark rounded-3xl overflow-hidden shadow-sm">
          {purchasedItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-cream-dark rounded-full flex items-center justify-center text-charcoal-light/60 mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">No purchased items</h3>
              <p className="text-sm text-charcoal-light mt-1 max-w-xs mx-auto">
                No items have been purchased yet this month.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {purchasedItems.map(item => (
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
                      <span>Added by: <strong>{getMemberName(item.added_by)}</strong></span>
                    </div>
                  </div>

                  {/* Restoring / Removing is Host-only for House List */}
                  {isHost && (
                    <button
                      onClick={() => deleteHouseItem(item.id)}
                      className="p-2 hover:bg-red-50 text-charcoal-light/60 hover:text-red-600 rounded-full transition-all"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
