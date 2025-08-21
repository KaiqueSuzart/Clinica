import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../UI/Card';

interface ProductivityChartProps {
  data: any[];
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    efficiency: (item.revenue / item.totalDuration) * 60, // Revenue per hour
    avgTicket: item.revenue / item.procedures
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Procedimentos: ${data.procedures}`}
          </p>
          <p className="text-green-600 dark:text-green-400">
            {`Faturamento: R$ ${data.revenue.toLocaleString()}`}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            {`Eficiência: R$ ${data.efficiency.toFixed(0)}/hora`}
          </p>
          <p className="text-orange-600 dark:text-orange-400">
            {`Ticket Médio: R$ ${data.avgTicket.toFixed(0)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Produtividade por Profissional" subtitle="Faturamento e eficiência por profissional">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}