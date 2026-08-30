import React, { useState, useEffect } from 'react';
import { useApp, getFirstDayOfMonth } from '../context/AppContext';
import { Sparkles, ShoppingBag, User, Landmark, Brain, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: 'houselist' | 'personallist' | 'analytics') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { expenses, user, fetchAIInsights, houseItems, personalItems } = useApp();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const currentMonthStr = getFirstDayOfMonth();
  const currentMonthPrefix = currentMonthStr.substring(0, 7); // YYYY-MM

  // Get previous month prefix
  const getPrevMonthPrefix = () => {
    const d = new Date(currentMonthStr);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 7);
  };
  const prevMonthPrefix = getPrevMonthPrefix();

  // Computations for current month
  const currentHouseExpenses = expenses
    .filter(e => e.scope === 'house' && e.spent_on.startsWith(currentMonthPrefix))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const currentPersonalExpenses = expenses
    .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(currentMonthPrefix))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalHouseholdActivity = currentHouseExpenses + currentPersonalExpenses;

  // Computations for previous month
  const prevHouseExpenses = expenses
    .filter(e => e.scope === 'house' && e.spent_on.startsWith(prevMonthPrefix))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const prevPersonalExpenses = expenses
    .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(prevMonthPrefix))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Percent changes helper
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const houseChange = getPercentChange(currentHouseExpenses, prevHouseExpenses);
  const personalChange = getPercentChange(currentPersonalExpenses, prevPersonalExpenses);

  // Auto-fetch or read stored AI insight on mount
  useEffect(() => {
    const cachedInsight = localStorage.getItem(`gharlist_ai_insight_${currentMonthPrefix}`);
    if (cachedInsight) {
      setAiInsight(cachedInsight);
    } else {
      triggerAIInsight();
    }
  }, [currentMonthPrefix, expenses.length]);

  const triggerAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const insight = await fetchAIInsights(currentMonthStr, `${prevMonthPrefix}-01`);
      setAiInsight(insight);
      localStorage.setItem(`gharlist_ai_insight_${currentMonthPrefix}`, insight);
    } catch (e) {
      console.error(e);
      setAiInsight('Failed to fetch AI insights. Please check your network connection or configure Supabase Edge Functions.');
    } finally {
      setLoadingInsight(false);
    }
  };

  // Recent activity logs
  const activeHouseCount = houseItems.filter(i => i.status === 'approved').length;
  const pendingHouseCount = houseItems.filter(i => i.status === 'pending').length;
  const activePersonalCount = personalItems.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-charcoal">Dashboard</h2>
        <p className="text-sm text-charcoal-light mt-1">
          Here is a breakdown of your household spending for this month.
        </p>
      </div>

      {/* TOP-LINE STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* House Expenses Card */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-white border border-cream-dark p-6 rounded-3xl cursor-pointer hover:border-terracotta/40 hover:-translate-y-0.5 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-terracotta/10 rounded-2xl text-terracotta">
              <Landmark className="w-6 h-6" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              houseChange > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {houseChange > 0 ? '+' : ''}{houseChange.toFixed(0)}% MoM
            </span>
          </div>
          <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
            House Expenses (Shared)
          </span>
          <h3 className="font-serif text-3xl font-bold text-charcoal mb-2">
            {formatCurrency(currentHouseExpenses)}
          </h3>
          <p className="text-xs text-charcoal-light">
            Total pooled spending for everyone combined this month.
          </p>
        </div>

        {/* My Personal Expenses Card */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-white border border-cream-dark p-6 rounded-3xl cursor-pointer hover:border-terracotta/40 hover:-translate-y-0.5 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-terracotta/10 rounded-2xl text-terracotta">
              <User className="w-6 h-6" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              personalChange > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {personalChange > 0 ? '+' : ''}{personalChange.toFixed(0)}% MoM
            </span>
          </div>
          <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
            My Personal Expenses
          </span>
          <h3 className="font-serif text-3xl font-bold text-charcoal mb-2">
            {formatCurrency(currentPersonalExpenses)}
          </h3>
          <p className="text-xs text-charcoal-light">
            Your private spending, excluded from the house pool.
          </p>
        </div>

        {/* Combined Activity Card */}
        <div className="bg-cream-dark border border-borderCream p-6 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute right-[-10px] bottom-[-10px] text-terracotta/5 opacity-40">
            <ShoppingBag className="w-40 h-40" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-terracotta/20 rounded-2xl text-terracotta">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
            Total Household Activity
          </span>
          <h3 className="font-serif text-3xl font-bold text-charcoal mb-2">
            {formatCurrency(totalHouseholdActivity)}
          </h3>
          <p className="text-xs text-charcoal-light">
            Sum of shared House + your Personal spend. Shown for context.
          </p>
        </div>
      </div>

      {/* AI SPENDING INSIGHTS */}
      <div className="bg-white border border-cream-dark rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-2xl">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-charcoal">AI Spending Insights</h4>
              <p className="text-xs text-charcoal-light">Powered by Claude API — analysis of your House and Personal lists</p>
            </div>
          </div>
          <button
            onClick={triggerAIInsight}
            disabled={loadingInsight}
            className="flex items-center gap-2 px-4 py-2 bg-cream-dark hover:bg-cream-light text-charcoal border border-borderCream text-xs font-semibold rounded-full shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-terracotta ${loadingInsight ? 'animate-spin' : ''}`} />
            <span>{loadingInsight ? 'Generating...' : 'Get AI Insight'}</span>
          </button>
        </div>

        {loadingInsight ? (
          <div className="space-y-3 py-6">
            <div className="h-4 bg-cream-dark rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-cream-dark rounded-full w-5/6 animate-pulse" />
            <div className="h-4 bg-cream-dark rounded-full w-2/3 animate-pulse" />
          </div>
        ) : aiInsight ? (
          <div className="prose prose-sm font-sans text-charcoal leading-relaxed max-w-none whitespace-pre-line bg-cream-light border border-borderCream/40 p-5 rounded-2xl">
            {aiInsight}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-charcoal-light/60">
            Click "Get AI Insight" to query Claude API and receive custom budget optimizations.
          </div>
        )}
      </div>

      {/* QUICK STATUS LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* House Status Card */}
        <div 
          onClick={() => onNavigate('houselist')}
          className="bg-white border border-cream-dark p-6 rounded-3xl cursor-pointer hover:border-terracotta/40 hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-charcoal text-lg">House Grocery List</h4>
            <div className="flex gap-4 text-xs text-charcoal-light">
              <span>Approved items: <strong className="text-charcoal">{activeHouseCount}</strong></span>
              <span>Pending approvals: <strong className="text-terracotta">{pendingHouseCount}</strong></span>
            </div>
          </div>
          <div className="p-2 bg-cream-light text-charcoal-light rounded-xl hover:text-terracotta transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Personal Status Card */}
        <div 
          onClick={() => onNavigate('personallist')}
          className="bg-white border border-cream-dark p-6 rounded-3xl cursor-pointer hover:border-terracotta/40 hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-charcoal text-lg">My Personal List</h4>
            <div className="text-xs text-charcoal-light">
              <span>Active private items: <strong className="text-charcoal">{activePersonalCount}</strong></span>
            </div>
          </div>
          <div className="p-2 bg-cream-light text-charcoal-light rounded-xl hover:text-terracotta transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
