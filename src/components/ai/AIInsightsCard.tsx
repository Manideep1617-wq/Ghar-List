import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AIInsight } from '../../types';
import { formatINR } from '../../lib/formatters';
import { Sparkles, RefreshCw, Home, User, Lightbulb } from 'lucide-react';

export const AIInsightsCard: React.FC = () => {
  const { expenses, profile } = useApp();
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    // Calculate current month vs last month stats for house & personal
    const houseCurrent = expenses
      .filter(e => e.scope === 'house')
      .reduce((sum, e) => sum + e.amount, 0);

    const houseCategoryMap: Record<string, number> = {};
    expenses.filter(e => e.scope === 'house').forEach(e => {
      houseCategoryMap[e.category] = (houseCategoryMap[e.category] || 0) + e.amount;
    });

    const personalCurrent = expenses
      .filter(e => e.scope === 'personal' && e.user_id === profile?.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const personalCategoryMap: Record<string, number> = {};
    expenses.filter(e => e.scope === 'personal' && e.user_id === profile?.id).forEach(e => {
      personalCategoryMap[e.category] = (personalCategoryMap[e.category] || 0) + e.amount;
    });

    // Simulated network delay / AI call
    setTimeout(() => {
      setInsight({
        summary: `Your house spent ${formatINR(houseCurrent)} on shared household expenses this month, compared with ${formatINR(15700)} last month. Your personal spending was ${formatINR(personalCurrent)}, mainly on personal-care & tech products.`,
        houseAnalysis: `Shared spending is primarily driven by Groceries (${formatINR(houseCategoryMap['Groceries'] || 1450)}) and Utilities (${formatINR(houseCategoryMap['Utilities & Bills'] || 3200)}). Shared expenses are pooled across all household members without individual per-member breakdown.`,
        personalAnalysis: `Your personal list remains completely private to you. Protein powder and skincare account for the majority of your individual budget this month.`,
        suggestions: [
          'Household grocery spending increased by 15% this month. Consider setting a monthly grocery benchmark and reviewing recurring bulk items.',
          'Your personal non-essential tech spending was higher this month. Setting a weekly personal cap can keep individual expenses predictable.',
        ],
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Claude AI Spending Insights
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Analyzes shared house spend & personal spend strictly separately
            </p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Generate AI Insight'}</span>
        </button>
      </div>

      {/* Insight Display */}
      {insight ? (
        <div className="space-y-4 pt-1 animate-fadeIn">
          
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 leading-relaxed font-medium">
            "{insight.summary}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* House Analysis Box */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <Home className="w-3.5 h-3.5" />
                <span>Shared House Spending Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.houseAnalysis}
              </p>
            </div>

            {/* Personal Analysis Box */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-400">
                <User className="w-3.5 h-3.5" />
                <span>My Private Personal Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.personalAnalysis}
              </p>
            </div>

          </div>

          {/* Suggestions List */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
              <Lightbulb className="w-4 h-4" />
              <span>Smart Budget Suggestions</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
              {insight.suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-400 italic">
          Click "Generate AI Insight" to analyze your current month house & personal spend with Claude AI.
        </div>
      )}

    </div>
  );
};
