import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HouseItemCard } from './HouseItemCard';
import { formatINR } from '../../lib/formatters';
import { 
  Home, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  Search, 
  Crown
} from 'lucide-react';
import type { HouseListItem } from '../../types';

export const HouseListView: React.FC = () => {
  const { houseItems, profile, setIsAddItemModalOpen, expenses } = useApp();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'purchased'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate top-line metrics
  const pendingCount = houseItems.filter(i => i.status === 'pending').length;
  const approvedCount = houseItems.filter(i => i.status === 'approved').length;
  
  // House expenses current month total
  const houseExpensesTotal = expenses
    .filter(e => e.scope === 'house')
    .reduce((sum, e) => sum + e.amount, 0);

  // Filtered items
  const filteredItems = houseItems.filter(item => {
    if (item.status === 'removed') return false;
    if (filter === 'approved' && item.status !== 'approved') return false;
    if (filter === 'pending' && item.status !== 'pending') return false;
    if (filter === 'purchased' && item.status !== 'purchased') return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total House Spend Card */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>House Shared Expenses</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100">
            {formatINR(houseExpensesTotal)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Total shared spend for current month</p>
        </div>

        {/* Active Approved Items */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Live Approved List</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100">
            {approvedCount} <span className="text-sm font-normal text-slate-400">items</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Confirmed household items ready for purchase</p>
        </div>

        {/* Pending Requests */}
        <div className={`glass-panel p-5 rounded-2xl border transition-all ${
          pendingCount > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100">
            {pendingCount} <span className="text-sm font-normal text-amber-300">awaiting Host</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {profile?.is_host 
              ? 'Click Approve or Reject to update house list' 
              : 'Requests waiting for Host verification'}
          </p>
        </div>

      </div>

      {/* Host Review Banner Callout */}
      {profile?.is_host && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                You have {pendingCount} house item request{pendingCount > 1 ? 's' : ''} awaiting approval
              </h4>
              <p className="text-xs text-slate-300">
                Members added items to the shared house list. Review them below or in notifications.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilter('pending')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filter Tabs, Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search house items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'approved' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap relative ${
              filter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Awaiting Host ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('purchased')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'purchased' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Purchased
          </button>
        </div>

      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <Home className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No House Items Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {filter === 'pending' 
                ? 'No items currently awaiting host approval.' 
                : 'Shared items added to the household will show up here.'}
            </p>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add House Item</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <HouseItemCard key={item.id} item={item as unknown as HouseListItem} />
          ))
        )}
      </div>

    </div>
  );
};
