import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../UI/Card';

interface PatientAnalysisChartProps {
  ageData: Record<string, number>;
}

export default function PatientAnalysisChart({ ageData }: PatientAnalysisChartProps) {
  const chartData = Object.entries(ageData).map(([ageGroup, count]) => ({
    ageGroup,
    count,
    percentage: (count / Object.values(ageData).reduce((sum, c) => sum + c, 0)) * 100
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label} anos</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Pacientes: ${data.count}`}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            {`Percentual: ${data.percentage.toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Distribuição por Faixa Etária" subtitle="Análise demográfica dos pacientes atendidos">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="ageGroup" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-300"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {chartData.map((item) => (
          <div key={item.ageGroup} className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <p className="text-xs text-purple-800 dark:text-purple-200 font-medium">{item.ageGroup}</p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{item.count}</p>
            <p className="text-xs text-purple-500 dark:text-purple-300">{item.percentage.toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </Card>
  );
}