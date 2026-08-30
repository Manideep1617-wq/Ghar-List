import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalItemCard } from './PersonalItemCard';
import { formatINR } from '../../lib/formatters';
import { 
  User, 
  Lock, 
  PlusCircle, 
  Search, 
  Shield 
} from 'lucide-react';

export const PersonalListView: React.FC = () => {
  const { personalItems, profile, setIsAddItemModalOpen, expenses } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'purchased'>('all');

  // Calculate my personal spend
  const myPersonalExpensesTotal = expenses
    .filter(e => e.scope === 'personal' && e.user_id === profile?.id)
    .reduce((sum, e) => sum + e.amount, 0);

  const activeCount = personalItems.filter(i => i.status === 'active').length;

  const filteredItems = personalItems.filter(item => {
    if (filter === 'active' && item.status !== 'active') return false;
    if (filter === 'purchased' && item.status !== 'purchased') return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Total Personal Spend Card */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <span>My Personal Expenses</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100">
            {formatINR(myPersonalExpensesTotal)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Logged spend for your private items this month</p>
        </div>

        {/* Active Items */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Active Personal Wishlist</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100">
            {activeCount} <span className="text-sm font-normal text-slate-400">private items</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Visible only to {profile?.full_name || 'you'}</p>
        </div>

      </div>

      {/* Strict Isolation Callout */}
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-purple-200">
            Strict Household Rule: Personal & House lists never mix
          </h4>
          <p className="text-xs text-slate-300">
            Items added here belong strictly to you (e.g. protein powder, skincare, headphones). No host approval is needed and nobody else in the household can view this.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search personal items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'active' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
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

      {/* Items Listing */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Your Personal List is Empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Keep track of individual purchases here without affecting shared house expenses.
            </p>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Personal Item</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <PersonalItemCard key={item.id} item={item as any} />
          ))
        )}
      </div>

    </div>
  );
};
