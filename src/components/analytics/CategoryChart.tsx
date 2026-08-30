import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatINR, getCategoryColor } from '../../lib/formatters';
import type { Category } from '../../types';

interface CategoryChartProps {
  data: { name: Category; amount: number }[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const chartData = data.filter(d => d.amount > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
        No expense data logged in this category yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="amount"
          >
            {chartData.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={getCategoryColor(entry.name)} 
                stroke="rgba(15, 23, 42, 0.8)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300 text-xs font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
