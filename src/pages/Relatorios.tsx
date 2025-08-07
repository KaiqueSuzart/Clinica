import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Search, Filter, Users, DollarSign, Clock, FileText } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

// Dados simulados para relatórios
const mockProcedures = [
  { id: '1', name: 'Limpeza', date: '2024-01-15', professional: 'Dr. Ana Silva', patient: 'João Santos', cost: 150, duration: 60 },
  { id: '2', name: 'Restauração', date: '2024-01-16', professional: 'Dr. Pedro Costa', patient: 'Maria Oliveira', cost: 200, duration: 90 },
  { id: '3', name: 'Limpeza', date: '2024-01-17', professional: 'Dr. Ana Silva', patient: 'Carlos Pereira', cost: 150, duration: 60 },
  { id: '4', name: 'Tratamento de Canal', date: '2024-01-18', professional: 'Dra. Maria Santos', patient: 'Ana Costa', cost: 800, duration: 120 },
  { id: '5', name: 'Clareamento', date: '2024-01-19', professional: 'Dr. Ana Silva', patient: 'Roberto Silva', cost: 400, duration: 90 },
  { id: '6', name: 'Restauração', date: '2024-01-20', professional: 'Dr. Pedro Costa', patient: 'Fernanda Lima', cost: 250, duration: 90 },
  { id: '7', name: 'Limpeza', date: '2024-01-21', professional: 'Dr. Ana Silva', patient: 'Paulo Santos', cost: 150, duration: 60 },
  { id: '8', name: 'Implante', date: '2024-01-22', professional: 'Dra. Maria Santos', patient: 'Lucia Ferreira', cost: 2500, duration: 180 },
  { id: '9', name: 'Extração', date: '2024-01-23', professional: 'Dr. Pedro Costa', patient: 'Marcos Silva', cost: 300, duration: 45 },
  { id: '10', name: 'Ortodontia', date: '2024-01-24', professional: 'Dr. Ana Silva', patient: 'Julia Costa', cost: 500, duration: 60 },
  { id: '11', name: 'Limpeza', date: '2024-01-25', professional: 'Dra. Maria Santos', patient: 'Diego Alves', cost: 150, duration: 60 },
  { id: '12', name: 'Prótese', date: '2024-01-26', professional: 'Dr. Pedro Costa', patient: 'Sandra Oliveira', cost: 1200, duration: 120 },
  { id: '13', name: 'Tratamento de Canal', date: '2024-01-27', professional: 'Dr. Ana Silva', patient: 'Ricardo Lima', cost: 750, duration: 120 },
  { id: '14', name: 'Restauração', date: '2024-01-28', professional: 'Dra. Maria Santos', patient: 'Camila Santos', cost: 220, duration: 90 },
  { id: '15', name: 'Limpeza', date: '2024-01-29', professional: 'Dr. Pedro Costa', patient: 'Bruno Costa', cost: 150, duration: 60 }
];

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('all');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue' | 'name'>('quantity');
  const [showFilters, setShowFilters] = useState(false);

  // Obter listas únicas
  const uniqueProcedures = [...new Set(mockProcedures.map(p => p.name))];
  const uniqueProfessionals = [...new Set(mockProcedures.map(p => p.professional))];

  // Filtrar dados baseado nos filtros aplicados
  const filteredData = useMemo(() => {
    return mockProcedures.filter(procedure => {
      const procedureDate = new Date(procedure.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const dateMatch = procedureDate >= start && procedureDate <= end;
      const searchMatch = searchTerm === '' || 
        procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.professional.toLowerCase().includes(searchTerm.toLowerCase());
      const procedureMatch = selectedProcedure === 'all' || procedure.name === selectedProcedure;
      const professionalMatch = selectedProfessional === 'all' || procedure.professional === selectedProfessional;
      
      return dateMatch && searchMatch && procedureMatch && professionalMatch;
    });
  }, [mockProcedures, startDate, endDate, searchTerm, selectedProcedure, selectedProfessional]);

  // Calcular estatísticas dos procedimentos
  const procedureStats = useMemo(() => {
    const stats = filteredData.reduce((acc, procedure) => {
      if (!acc[procedure.name]) {
        acc[procedure.name] = {
          name: procedure.name,
          quantity: 0,
          revenue: 0,
          avgDuration: 0,
          totalDuration: 0
        };
      }
      acc[procedure.name].quantity += 1;
      acc[procedure.name].revenue += procedure.cost;
      acc[procedure.name].totalDuration += procedure.duration;
      acc[procedure.name].avgDuration = acc[procedure.name].totalDuration / acc[procedure.name].quantity;
      return acc;
    }, {} as Record<string, any>);

    const sortedStats = Object.values(stats).sort((a: any, b: any) => {
      switch (sortBy) {
        case 'quantity':
          return b.quantity - a.quantity;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.quantity - a.quantity;
      }
    });

    return sortedStats;
  }, [filteredData, sortBy]);

  // Calcular estatísticas por profissional
  const professionalStats = useMemo(() => {
    const stats = filteredData.reduce((acc, procedure) => {
      if (!acc[procedure.professional]) {
        acc[procedure.professional] = {
          name: procedure.professional,
          procedures: 0,
          revenue: 0
        };
      }
      acc[procedure.professional].procedures += 1;
      acc[procedure.professional].revenue += procedure.cost;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [filteredData]);

  // Calcular totais
  const totalRevenue = filteredData.reduce((sum, p) => sum + p.cost, 0);
  const totalProcedures = filteredData.length;
  const avgTicket = totalProcedures > 0 ? totalRevenue / totalProcedures : 0;
  const totalDuration = filteredData.reduce((sum, p) => sum + p.duration, 0);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as any);
    const today = new Date();
    
    switch (period) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setStartDate(weekStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(monthStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProcedure('all');
    setSelectedProfessional('all');
    setSelectedPeriod('month');
    handlePeriodChange('month');
  };

  const exportData = () => {
    const csvContent = [
      ['Procedimento', 'Quantidade', 'Faturamento', 'Duração Média'],
      ...procedureStats.map((stat: any) => [
        stat.name,
        stat.quantity,
        `R$ ${stat.revenue.toFixed(2)}`,
        `${Math.round(stat.avgDuration)} min`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-procedimentos-${startDate}-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios Avançados</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise detalhada dos procedimentos e performance da clínica</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button icon={Download} onClick={exportData}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <Card title="Filtros Avançados" className="animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Este Mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Data Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Data Final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Procedimento, paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Filtro por Procedimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Procedimento
              </label>
              <select
                value={selectedProcedure}
                onChange={(e) => setSelectedProcedure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos os Procedimentos</option>
                {uniqueProcedures.map(procedure => (
                  <option key={procedure} value={procedure}>{procedure}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profissional
              </label>
              <select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos os Profissionais</option>
                {uniqueProfessionals.map(professional => (
                  <option key={professional} value={professional}>{professional}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="quantity">Quantidade</option>
                <option value="revenue">Faturamento</option>
                <option value="name">Nome</option>
              </select>
            </div>

            {/* Botão Limpar */}
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Resumo dos Filtros */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Filtros aplicados:</strong> {filteredData.length} procedimentos encontrados
              {searchTerm && ` • Busca: "${searchTerm}"`}
              {selectedProcedure !== 'all' && ` • Procedimento: ${selectedProcedure}`}
              {selectedProfessional !== 'all' && ` • Profissional: ${selectedProfessional}`}
            </p>
          </div>
        </Card>
      )}

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Procedimentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProcedures}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">no período</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ {totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">total</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ {avgTicket.toFixed(0)}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">por procedimento</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tempo Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(totalDuration / 60)}h</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">de atendimento</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedimentos Mais Realizados */}
        <Card title="Procedimentos Mais Realizados" subtitle={`${procedureStats.length} tipos de procedimentos`}>
          <div className="space-y-4">
            {procedureStats.slice(0, 10).map((stat: any, index) => {
              const maxValue = Math.max(...procedureStats.map((s: any) => sortBy === 'revenue' ? s.revenue : s.quantity));
              const percentage = sortBy === 'revenue' 
                ? (stat.revenue / maxValue) * 100 
                : (stat.quantity / maxValue) * 100;
              
              return (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{stat.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {sortBy === 'revenue' ? `R$ ${stat.revenue.toLocaleString()}` : `${stat.quantity}x`}
                          </span>
                          {sortBy !== 'revenue' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              R$ {stat.revenue.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{stat.quantity} procedimentos</span>
                        <span>{Math.round(stat.avgDuration)} min médio</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Performance por Profissional */}
        <Card title="Performance por Profissional" subtitle={`${professionalStats.length} profissionais`}>
          <div className="space-y-4">
            {professionalStats.map((stat: any, index) => {
              const maxRevenue = Math.max(...professionalStats.map((s: any) => s.revenue));
              const percentage = (stat.revenue / maxRevenue) * 100;
              
              return (
                <div key={stat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{stat.name}</h4>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">R$ {stat.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{stat.procedures} procedimentos</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Ticket médio: R$ {Math.round(stat.revenue / stat.procedures)}</span>
                    <span>{percentage.toFixed(1)}% do total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card title="Detalhamento dos Procedimentos" subtitle={`${filteredData.length} registros encontrados`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.slice(0, 20).map((procedure) => (
                <tr key={procedure.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(procedure.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {procedure.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {procedure.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {procedure.professional}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {procedure.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    R$ {procedure.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length > 20 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mostrando 20 de {filteredData.length} registros
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}