import React from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryChart } from './CategoryChart';
import { TrendChart } from './TrendChart';
import { AIInsightsCard } from '../ai/AIInsightsCard';
import { formatINR, CATEGORIES } from '../../lib/formatters';
import { 
  Home, 
  User, 
  Layers, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { expenses, profile } = useApp();

  // 1. Calculate top-line metrics
  const houseExpensesTotal = expenses
    .filter(e => e.scope === 'house')
    .reduce((sum, e) => sum + e.amount, 0);

  const myPersonalExpensesTotal = expenses
    .filter(e => e.scope === 'personal' && e.user_id === profile?.id)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalHouseholdActivity = houseExpensesTotal + myPersonalExpensesTotal;

  // 2. Category breakdowns
  const houseCategoryData = CATEGORIES.map(cat => {
    const amount = expenses
      .filter(e => e.scope === 'house' && e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, amount };
  });

  const personalCategoryData = CATEGORIES.map(cat => {
    const amount = expenses
      .filter(e => e.scope === 'personal' && e.user_id === profile?.id && e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, amount };
  });

  // 3. Mock 6-month historical trend data
  const houseTrendData = [
    { month: 'Mar', amount: 14200 },
    { month: 'Apr', amount: 16500 },
    { month: 'May', amount: 13800 },
    { month: 'Jun', amount: 15700 },
    { month: 'Jul', amount: 17100 },
    { month: 'Aug', amount: houseExpensesTotal || 18400 },
  ];

  const personalTrendData = [
    { month: 'Mar', amount: 2100 },
    { month: 'Apr', amount: 3400 },
    { month: 'May', amount: 1900 },
    { month: 'Jun', amount: 2800 },
    { month: 'Jul', amount: 4100 },
    { month: 'Aug', amount: myPersonalExpensesTotal || 3200 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Line Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* House Expenses Card */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>House Expenses</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-100">
            {formatINR(houseExpensesTotal)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total shared spend (all members combined)
          </p>
        </div>

        {/* My Personal Expenses Card */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider">
            <span>My Personal Expenses</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-100">
            {formatINR(myPersonalExpensesTotal)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Only your private personal spend
          </p>
        </div>

        {/* Total Household Activity Card */}
        <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase tracking-wider">
            <span>Total Household Activity</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-100">
            {formatINR(totalHouseholdActivity)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            House + Your Personal (contextual total)
          </p>
        </div>

      </div>

      {/* AI Spending Insights */}
      <AIInsightsCard />

      {/* SECTION 1: House Expenses Analytics */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Shared House Expenses Analytics</h3>
            <p className="text-xs text-slate-400">
              Single pooled household spend. Not attributed to individual members.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Breakdown */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Category Breakdown (Shared House)
            </h4>
            <CategoryChart data={houseCategoryData} />
          </div>

          {/* 6-Month Trend */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              6-Month Shared Spend Trend Line
            </h4>
            <TrendChart data={houseTrendData} color="#22c55e" gradientId="houseTrend" />
          </div>

        </div>
      </div>

      {/* SECTION 2: My Personal Expenses Analytics */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">My Personal Expenses Analytics</h3>
            <p className="text-xs text-slate-400">
              Private spending charts visible strictly to your account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Breakdown */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              Category Breakdown (Personal)
            </h4>
            <CategoryChart data={personalCategoryData} />
          </div>

          {/* 6-Month Trend */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              6-Month Personal Spend Trend Line
            </h4>
            <TrendChart data={personalTrendData} color="#a855f7" gradientId="personalTrend" />
          </div>

        </div>
      </div>

    </div>
  );
};
