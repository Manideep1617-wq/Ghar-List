import React from 'react';
import type { HouseListItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR, getCategoryBadgeStyle } from '../../lib/formatters';
import { 
  CheckCircle, 
  XCircle, 
  ShoppingBag, 
  Clock, 
  ShieldCheck
} from 'lucide-react';

interface HouseItemCardProps {
  item: HouseListItem;
}

export const HouseItemCard: React.FC<HouseItemCardProps> = ({ item }) => {
  const { profile, approveHouseItem, rejectHouseItem, setItemToPurchase, setIsPurchaseModalOpen } = useApp();

  const isPending = item.status === 'pending';
  const isApproved = item.status === 'approved';
  const isPurchased = item.status === 'purchased';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isPending
        ? 'bg-amber-950/20 border-amber-500/30'
        : isPurchased
        ? 'bg-slate-900/40 border-slate-800 opacity-75'
        : 'glass-card-house'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Item Information */}
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className={`font-semibold text-base ${isPurchased ? 'line-through text-slate-400' : 'text-slate-100'}`}>
              {item.name}
            </h3>
            
            {/* Category Tag */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeStyle(item.category)}`}>
              {item.category}
            </span>

            {/* Status Badges */}
            {isPending && (
              <span className="flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                <Clock className="w-3 h-3" />
                <span>Awaiting Host Approval</span>
              </span>
            )}

            {isApproved && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Approved</span>
              </span>
            )}

            {isPurchased && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle className="w-3 h-3" />
                <span>Purchased</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Qty: <strong className="text-slate-200">{item.quantity}</strong></span>
            <span>Est: <strong className="text-emerald-400">{formatINR(item.estimated_price)}</strong></span>
            <span className="text-slate-500">Requested by: {item.added_by_name || 'Member'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          
          {/* Host Review Controls for Pending requests */}
          {isPending && profile?.is_host && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => approveHouseItem(item.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => rejectHouseItem(item.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 font-medium text-xs transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {/* Mark as Purchased Action (Allowed only when Approved) */}
          {isApproved && (
            <button
              onClick={() => {
                setItemToPurchase({ item, scope: 'house' });
                setIsPurchaseModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mark Spent</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
