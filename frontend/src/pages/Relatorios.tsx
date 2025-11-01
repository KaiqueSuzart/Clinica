import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Calendar, Search, Filter, Users, DollarSign, 
  Clock, FileText, Activity, Target, AlertTriangle,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { apiService } from '../services/api';

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'procedures' | 'financial' | 'productivity'>('overview');
  
  // Dados dos relatórios
  const [proceduresData, setProceduresData] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any>({});
  const [productivityData, setProductivityData] = useState<any>({});
  const [patientsData, setPatientsData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [procedures, financial, productivity, patients] = await Promise.all([
        apiService.request(`/reports/procedures?startDate=${startDate}&endDate=${endDate}`),
        apiService.request(`/reports/financial?startDate=${startDate}&endDate=${endDate}`),
        apiService.request(`/reports/productivity?startDate=${startDate}&endDate=${endDate}`),
        apiService.request(`/reports/patients`)
      ]);

      setProceduresData(procedures.data || []);
      setFinancialData(financial.data || {});
      setProductivityData(productivity.data || {});
      setPatientsData(patients.data || {});
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const exportData = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const csvContent = [
        ['Procedimento', 'Quantidade', 'Faturamento', 'Duração Média'],
        ...proceduresData.map((stat: any) => [
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
    } else {
      alert('Relatório PDF será gerado em breve');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise de performance da clínica</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ocultar Filtros' : 'Filtros'}
          </Button>
          <Button variant="outline" icon={Download} onClick={() => exportData('csv')}>
            CSV
          </Button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'procedures', label: 'Procedimentos', icon: FileText },
              { id: 'financial', label: 'Financeiro', icon: DollarSign },
              { id: 'productivity', label: 'Produtividade', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card title="Filtros de Período" className="animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </Card>
      )}

      {/* Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Procedimentos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {financialData.totalProcedures || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Faturamento</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.avgTicket || 0)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Users className="w-10 h-10 text-orange-600 dark:text-orange-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {patientsData.totalPatients || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Análises Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Análise de Orçamentos" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Taxa de Aprovação</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {(financialData.budgets?.approvalRate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${financialData.budgets?.approvalRate || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {financialData.budgets?.approved || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Aprovados</p>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {financialData.budgets?.pending || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Pendentes</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {financialData.budgets?.rejected || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Recusados</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Ocupação da Agenda" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Taxa de Ocupação</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {(productivityData.schedule?.occupationRate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${productivityData.schedule?.occupationRate || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {productivityData.schedule?.completed || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Realizados</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {productivityData.schedule?.cancelled || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Cancelados</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Pacientes" className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {patientsData.totalPatients || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Ativos</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {patientsData.activePatients || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Novos este mês</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {patientsData.newPatientsThisMonth || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Aba Procedimentos */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise de Procedimentos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proceduresData.map((stat: any, index) => (
              <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{stat.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Quantidade</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stat.quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Faturamento</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Duração Média</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(stat.avgDuration)} min</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {proceduresData.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum procedimento encontrado no período selecionado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Aba Financeiro */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise Financeira</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Faturamento Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Meta Mensal</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">R$ 15.000</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-2">
                    <div 
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${Math.min(((financialData.totalRevenue || 0) / 15000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Orçamentos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.budgets?.approvedValue || 0)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {financialData.budgets?.approved || 0} aprovados
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.avgTicket || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Faturamento por Procedimento">
            <div className="space-y-4">
              {proceduresData.slice(0, 10).map((stat: any, index) => {
                const maxRevenue = Math.max(...proceduresData.map((s: any) => s.revenue), 1);
                const percentage = (stat.revenue / maxRevenue) * 100;
                
                return (
                  <div key={stat.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{stat.name}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{stat.quantity} procedimentos</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Aba Produtividade */}
      {activeTab === 'productivity' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise de Produtividade</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Eficiência por Profissional">
              <div className="space-y-4">
                {(productivityData.professionals || []).map((stat: any, index: number) => {
                  const efficiency = stat.totalDuration > 0 ? (stat.revenue / stat.totalDuration) * 60 : 0; // Revenue per hour
                  const maxEfficiency = Math.max(...(productivityData.professionals || []).map((s: any) => 
                    s.totalDuration > 0 ? (s.revenue / s.totalDuration) * 60 : 0
                  ), 1);
                  const efficiencyPercentage = (efficiency / maxEfficiency) * 100;
                  
                  return (
                    <div key={stat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{stat.name}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Procedimentos</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{stat.procedures}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Faturamento/Hora</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(efficiency)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${efficiencyPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>Total: {Math.round((stat.totalDuration || 0) / 60)}h</span>
                        <span>Receita: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.revenue)}</span>
                      </div>
                    </div>
                  );
                })}

                {(!productivityData.professionals || productivityData.professionals.length === 0) && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Taxa de Cancelamento" className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {(productivityData.schedule?.cancellationRate || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Cancelamento</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Meta ideal</span>
                  <span className="text-green-600 dark:text-green-400">{'<'} 10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Atual</span>
                  <span className={(productivityData.schedule?.cancellationRate || 0) > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {(productivityData.schedule?.cancellationRate || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {(productivityData.schedule?.cancellationRate || 0) > 10 
                    ? '🚨 Taxa acima do ideal - considere implementar confirmações automáticas'
                    : '✅ Taxa dentro da meta - ótimo trabalho!'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Metas */}
      <Card title="Metas e Indicadores" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (financialData.totalRevenue || 0) >= 15000 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <Target className={`w-6 h-6 ${
                (financialData.totalRevenue || 0) >= 15000 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Meta de Faturamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {(financialData.totalRevenue || 0) >= 15000 
                  ? '✅ Meta atingida!' 
                  : `⚠️ Faltam ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(15000 - (financialData.totalRevenue || 0))}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (financialData.budgets?.approvalRate || 0) >= 60 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <FileText className={`w-6 h-6 ${
                (financialData.budgets?.approvalRate || 0) >= 60 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Aprovação de Orçamentos</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {(financialData.budgets?.approvalRate || 0) >= 60 
                  ? '✅ Acima de 60%!' 
                  : '⚠️ Melhorar conversão'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (productivityData.schedule?.cancellationRate || 0) <= 10 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                (productivityData.schedule?.cancellationRate || 0) <= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Cancelamentos</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {(productivityData.schedule?.cancellationRate || 0) <= 10 
                  ? '✅ Dentro da meta!' 
                  : '🚨 Acima do ideal'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
