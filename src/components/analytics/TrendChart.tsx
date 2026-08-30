import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatINR } from '../../lib/formatters';

interface TrendChartProps {
  data: { month: string; amount: number }[];
  color: string;
  gradientId: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, color, gradientId }) => {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
          <YAxis 
            stroke="#64748b" 
            fontSize={11}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip
            formatter={(value: any) => [formatINR(Number(value)), 'Spend']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
