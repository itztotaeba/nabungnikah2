'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';

// Palet warna kustom
const COLORS = ['#87A878', '#B76E79', '#89CFF0', '#FDFD96', '#E6E6FA', '#FFB6C1', '#98D8C8'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function BudgetPieChart() {
  const { budgetItems, settings } = useWeddingStore();

  // Kelompokkan berdasarkan category dan jumlahkan estimatedCost
  const categoryData = budgetItems.reduce((acc, item) => {
    const existing = acc.find((d) => d.name === item.category);
    if (existing) {
      existing.value += item.estimatedCost;
    } else {
      acc.push({ name: item.category, value: item.estimatedCost });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">
          Proporsi Anggaran
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">Belum ada data anggaran</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-heading text-lg font-semibold text-gray-800 mb-4">
        Proporsi Anggaran
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
