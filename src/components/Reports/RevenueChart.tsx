import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../UI/Card';

interface RevenueChartProps {
  data: any[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Agrupar dados por data para o gráfico
  const chartData = data.reduce((acc, procedure) => {
    const date = procedure.date;
    const existingEntry = acc.find((entry: any) => entry.date === date);
    
    if (existingEntry) {
      existingEntry.revenue += procedure.cost;
      existingEntry.procedures += 1;
    } else {
      acc.push({
        date,
        revenue: procedure.cost,
        procedures: 1,
        formattedDate: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      });
    }
    
    return acc;
  }, []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{`Data: ${label}`}</p>
          <p className="text-green-600 dark:text-green-400">
            {`Faturamento: R$ ${payload[0].value.toLocaleString()}`}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Procedimentos: ${payload[0].payload.procedures}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Evolução do Faturamento" subtitle="Faturamento diário no período selecionado">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}