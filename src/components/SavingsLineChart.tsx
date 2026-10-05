'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function SavingsLineChart() {
  const { savings, settings } = useWeddingStore();

  // Kelompokkan berdasarkan bulan dan hitung running total
  const monthlyData = savings
    .map((s) => ({
      date: parseISO(s.date),
      amount: s.amount,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Kelompokkan per bulan
  const monthlyTotals = monthlyData.reduce((acc, item) => {
    const monthKey = format(item.date, 'MMM yyyy', { locale: id });
    const existing = acc.find((d) => d.month === monthKey);
    if (existing) {
      existing.amount += item.amount;
    } else {
      acc.push({ month: monthKey, amount: item.amount });
    }
    return acc;
  }, [] as { month: string; amount: number }[]);

  // Hitung running total (akumulasi kumulatif)
  let runningTotal = 0;
  const chartData = monthlyTotals.map((item) => {
    runningTotal += item.amount;
    return {
      month: item.month,
      total: runningTotal,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">
          Progress Tabungan
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">Mulai catat tabungan untuk melihat progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">
        Progress Tabungan
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#87A878" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#87A878" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
          <XAxis 
            dataKey="month" 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => formatCurrency(value).replace('Rp', '')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#87A878"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
