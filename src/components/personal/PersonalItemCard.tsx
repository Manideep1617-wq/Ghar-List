import React from 'react';
import type { PersonalItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR, getCategoryBadgeStyle } from '../../lib/formatters';
import { 
  Lock, 
  ShoppingBag, 
  Trash2, 
  CheckCircle 
} from 'lucide-react';

interface PersonalItemCardProps {
  item: PersonalItem;
}

export const PersonalItemCard: React.FC<PersonalItemCardProps> = ({ item }) => {
  const { setItemToPurchase, setIsPurchaseModalOpen, deletePersonalItem } = useApp();

  const isPurchased = item.status === 'purchased';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isPurchased 
        ? 'bg-slate-900/40 border-slate-800 opacity-75' 
        : 'glass-card-personal'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Item Info */}
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className={`font-semibold text-base ${isPurchased ? 'line-through text-slate-400' : 'text-slate-100'}`}>
              {item.name}
            </h3>

            {/* Category Tag */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeStyle(item.category)}`}>
              {item.category}
            </span>

            <span className="flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="w-2.5 h-2.5" />
              <span>Private</span>
            </span>

            {isPurchased && (
              <span className="flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle className="w-3 h-3" />
                <span>Purchased</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Qty: <strong className="text-slate-200">{item.quantity}</strong></span>
            <span>Est: <strong className="text-purple-400">{formatINR(item.estimated_price)}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          
          {!isPurchased && (
            <button
              onClick={() => {
                setItemToPurchase({ item: item as any, scope: 'personal' });
                setIsPurchaseModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mark Spent</span>
            </button>
          )}

          <button
            onClick={() => deletePersonalItem(item.id)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700/50 transition-all"
            title="Delete personal item"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
