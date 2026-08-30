import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Landmark, User, TrendingUp } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { expenses, user } = useApp();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Helper to generate the list of last 6 months in format YYYY-MM
  const getLast6Months = () => {
    const months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const name = temp.toLocaleString('en-US', { month: 'short' });
      months.push({ key: `${year}-${month}`, label: `${name} ${year}` });
    }
    return months;
  };

  const last6Months = getLast6Months();

  // =========================================================================
  // DATA CONVERTERS & AGGREGATORS
  // =========================================================================

  // Group House Expenses by Month
  const houseTrendData = last6Months.map(m => {
    const total = expenses
      .filter(e => e.scope === 'house' && e.spent_on.startsWith(m.key))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: m.label, Amount: total };
  });

  // Group Personal Expenses by Month
  const personalTrendData = last6Months.map(m => {
    const total = expenses
      .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(m.key))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: m.label, Amount: total };
  });

  // Group House Expenses by Category (Current Month)
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const houseCategoriesRaw: Record<string, number> = {};
  expenses
    .filter(e => e.scope === 'house' && e.spent_on.startsWith(currentMonthKey))
    .forEach(e => {
      const cat = e.category || 'Other';
      houseCategoriesRaw[cat] = (houseCategoriesRaw[cat] || 0) + Number(e.amount);
    });

  const houseCategoryData = Object.entries(houseCategoriesRaw).map(([name, value]) => ({
    name,
    value
  }));

  // Group Personal Expenses by Category (Current Month)
  const personalCategoriesRaw: Record<string, number> = {};
  expenses
    .filter(e => e.scope === 'personal' && e.user_id === user?.id && e.spent_on.startsWith(currentMonthKey))
    .forEach(e => {
      const cat = e.category || 'Other';
      personalCategoriesRaw[cat] = (personalCategoriesRaw[cat] || 0) + Number(e.amount);
    });

  const personalCategoryData = Object.entries(personalCategoriesRaw).map(([name, value]) => ({
    name,
    value
  }));

  // Style colors
  const COLORS = ['#A83E15', '#2E1A0F', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'];

  // Current month sums
  const houseTotal = houseTrendData[5]?.Amount || 0;
  const prevHouseTotal = houseTrendData[4]?.Amount || 0;
  const personalTotal = personalTrendData[5]?.Amount || 0;
  const prevPersonalTotal = personalTrendData[4]?.Amount || 0;

  const getMoMText = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100% vs last month' : 'No activity';
    const pct = ((current - previous) / previous) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% vs last month (${formatCurrency(previous)})`;
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-charcoal">Analytics Dashboard</h2>
        <p className="text-sm text-charcoal-light mt-1">
          Detailed trends and category breakdowns. House and personal data are strictly isolated.
        </p>
      </div>

      {/* =========================================================================
          HOUSE EXPENSES ANALYTICS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-cream-dark pb-3">
          <div className="p-2 bg-terracotta/10 rounded-xl text-terracotta">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal">Household Spending (Shared)</h3>
            <p className="text-xs text-charcoal-light">Combined metrics of all approved items across the household.</p>
          </div>
        </div>

        {/* Top MoM Metrics */}
        <div className="bg-white border border-cream-dark p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-sm">
          <div>
            <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
              Current Month Total Spend
            </span>
            <h4 className="font-serif text-2xl font-bold text-charcoal">
              {formatCurrency(houseTotal)}
            </h4>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
              Month-over-Month Change
            </span>
            <span className={`text-sm font-semibold flex items-center gap-1 ${
              houseTotal >= prevHouseTotal ? 'text-red-600' : 'text-green-600'
            }`}>
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{getMoMText(houseTotal, prevHouseTotal)}</span>
            </span>
          </div>
        </div>

        {/* Charts block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-white border border-cream-dark p-6 rounded-3xl shadow-sm">
            <h4 className="font-serif font-bold text-charcoal mb-6 flex items-center gap-2 text-base">
              <span>6-Month Trend Line</span>
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={houseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF8F5" />
                  <XAxis dataKey="name" stroke="#5C4C42" fontSize={11} />
                  <YAxis stroke="#5C4C42" fontSize={11} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Spend']}
                    contentStyle={{ backgroundColor: '#FAF6EE', border: '1px solid #EADFD5', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="Amount" stroke="#A83E15" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Chart */}
          <div className="bg-white border border-cream-dark p-6 rounded-3xl shadow-sm">
            <h4 className="font-serif font-bold text-charcoal mb-6 flex items-center gap-2 text-base">
              <span>Category Breakdown (This Month)</span>
            </h4>
            <div className="h-72 w-full flex flex-col justify-center">
              {houseCategoryData.length === 0 ? (
                <div className="text-center text-xs text-charcoal-light/60 py-12">
                  No purchases logged for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={houseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {houseCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PERSONAL EXPENSES ANALYTICS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-cream-dark pb-3">
          <div className="p-2 bg-terracotta/10 rounded-xl text-terracotta">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal">My Personal Spending (Private)</h3>
            <p className="text-xs text-charcoal-light">Your private metrics. Invisible to other members of the household.</p>
          </div>
        </div>

        {/* Top MoM Metrics */}
        <div className="bg-white border border-cream-dark p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-sm">
          <div>
            <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
              Current Month Total Private Spend
            </span>
            <h4 className="font-serif text-2xl font-bold text-charcoal">
              {formatCurrency(personalTotal)}
            </h4>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-charcoal-light/70 uppercase tracking-widest block mb-1">
              Month-over-Month Change
            </span>
            <span className={`text-sm font-semibold flex items-center gap-1 ${
              personalTotal >= prevPersonalTotal ? 'text-red-600' : 'text-green-600'
            }`}>
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{getMoMText(personalTotal, prevPersonalTotal)}</span>
            </span>
          </div>
        </div>

        {/* Charts block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-white border border-cream-dark p-6 rounded-3xl shadow-sm">
            <h4 className="font-serif font-bold text-charcoal mb-6 flex items-center gap-2 text-base">
              <span>6-Month Trend Line</span>
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={personalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF8F5" />
                  <XAxis dataKey="name" stroke="#5C4C42" fontSize={11} />
                  <YAxis stroke="#5C4C42" fontSize={11} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Spend']}
                    contentStyle={{ backgroundColor: '#FAF6EE', border: '1px solid #EADFD5', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="Amount" stroke="#2E1A0F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Chart */}
          <div className="bg-white border border-cream-dark p-6 rounded-3xl shadow-sm">
            <h4 className="font-serif font-bold text-charcoal mb-6 flex items-center gap-2 text-base">
              <span>Category Breakdown (This Month)</span>
            </h4>
            <div className="h-72 w-full flex flex-col justify-center">
              {personalCategoryData.length === 0 ? (
                <div className="text-center text-xs text-charcoal-light/60 py-12">
                  No private purchases logged for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={personalCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {personalCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
