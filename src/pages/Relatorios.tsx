import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Download, Calendar, Search, Filter, Users, DollarSign, 
  Clock, FileText, PieChart, Activity, Target, AlertTriangle, CheckCircle,
  ArrowUp, ArrowDown, Minus, Star, MessageSquare, Eye, Settings
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import RevenueChart from '../components/Reports/RevenueChart';
import ProcedureChart from '../components/Reports/ProcedureChart';
import ProductivityChart from '../components/Reports/ProductivityChart';
import PatientAnalysisChart from '../components/Reports/PatientAnalysisChart';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados simulados expandidos para relatórios
const mockProcedures = [
  { id: '1', name: 'Limpeza', date: '2024-01-15', professional: 'Dr. Ana Silva', patient: 'João Santos', cost: 150, duration: 60, patientAge: 35, satisfaction: 5 },
  { id: '2', name: 'Restauração', date: '2024-01-16', professional: 'Dr. Pedro Costa', patient: 'Maria Oliveira', cost: 200, duration: 90, patientAge: 28, satisfaction: 4 },
  { id: '3', name: 'Limpeza', date: '2024-01-17', professional: 'Dr. Ana Silva', patient: 'Carlos Pereira', cost: 150, duration: 60, patientAge: 45, satisfaction: 5 },
  { id: '4', name: 'Tratamento de Canal', date: '2024-01-18', professional: 'Dra. Maria Santos', patient: 'Ana Costa', cost: 800, duration: 120, patientAge: 52, satisfaction: 4 },
  { id: '5', name: 'Clareamento', date: '2024-01-19', professional: 'Dr. Ana Silva', patient: 'Roberto Silva', cost: 400, duration: 90, patientAge: 30, satisfaction: 5 },
  { id: '6', name: 'Restauração', date: '2024-01-20', professional: 'Dr. Pedro Costa', patient: 'Fernanda Lima', cost: 250, duration: 90, patientAge: 33, satisfaction: 4 },
  { id: '7', name: 'Limpeza', date: '2024-01-21', professional: 'Dr. Ana Silva', patient: 'Paulo Santos', cost: 150, duration: 60, patientAge: 40, satisfaction: 5 },
  { id: '8', name: 'Implante', date: '2024-01-22', professional: 'Dra. Maria Santos', patient: 'Lucia Ferreira', cost: 2500, duration: 180, patientAge: 55, satisfaction: 5 },
  { id: '9', name: 'Extração', date: '2024-01-23', professional: 'Dr. Pedro Costa', patient: 'Marcos Silva', cost: 300, duration: 45, patientAge: 25, satisfaction: 3 },
  { id: '10', name: 'Ortodontia', date: '2024-01-24', professional: 'Dr. Ana Silva', patient: 'Julia Costa', cost: 500, duration: 60, patientAge: 22, satisfaction: 5 },
  { id: '11', name: 'Limpeza', date: '2024-01-25', professional: 'Dra. Maria Santos', patient: 'Diego Alves', cost: 150, duration: 60, patientAge: 38, satisfaction: 4 },
  { id: '12', name: 'Prótese', date: '2024-01-26', professional: 'Dr. Pedro Costa', patient: 'Sandra Oliveira', cost: 1200, duration: 120, patientAge: 60, satisfaction: 5 },
  { id: '13', name: 'Tratamento de Canal', date: '2024-01-27', professional: 'Dr. Ana Silva', patient: 'Ricardo Lima', cost: 750, duration: 120, patientAge: 42, satisfaction: 4 },
  { id: '14', name: 'Restauração', date: '2024-01-28', professional: 'Dra. Maria Santos', patient: 'Camila Santos', cost: 220, duration: 90, patientAge: 29, satisfaction: 5 },
  { id: '15', name: 'Limpeza', date: '2024-01-29', professional: 'Dr. Pedro Costa', patient: 'Bruno Costa', cost: 150, duration: 60, patientAge: 31, satisfaction: 4 },
  // Dados do mês anterior para comparação
  { id: '16', name: 'Limpeza', date: '2023-12-15', professional: 'Dr. Ana Silva', patient: 'João Santos', cost: 150, duration: 60, patientAge: 35, satisfaction: 4 },
  { id: '17', name: 'Restauração', date: '2023-12-16', professional: 'Dr. Pedro Costa', patient: 'Maria Oliveira', cost: 200, duration: 90, patientAge: 28, satisfaction: 5 },
  { id: '18', name: 'Clareamento', date: '2023-12-20', professional: 'Dr. Ana Silva', patient: 'Carlos Pereira', cost: 400, duration: 90, patientAge: 45, satisfaction: 4 },
  { id: '19', name: 'Implante', date: '2023-12-22', professional: 'Dra. Maria Santos', patient: 'Ana Costa', cost: 2500, duration: 180, patientAge: 52, satisfaction: 5 },
  { id: '20', name: 'Limpeza', date: '2023-12-28', professional: 'Dr. Pedro Costa', patient: 'Roberto Silva', cost: 150, duration: 60, patientAge: 30, satisfaction: 4 }
];

const mockBudgets = [
  { id: '1', patientName: 'João Santos', total: 1200, status: 'aprovado', createdAt: '2024-01-15', approvedAt: '2024-01-16' },
  { id: '2', patientName: 'Maria Oliveira', total: 800, status: 'pendente', createdAt: '2024-01-20' },
  { id: '3', patientName: 'Carlos Pereira', total: 2500, status: 'recusado', createdAt: '2024-01-18', rejectedAt: '2024-01-22' },
  { id: '4', patientName: 'Ana Costa', total: 600, status: 'aprovado', createdAt: '2024-01-22', approvedAt: '2024-01-23' },
  { id: '5', patientName: 'Roberto Silva', total: 1500, status: 'pendente', createdAt: '2024-01-25' }
];

const mockAppointments = [
  { id: '1', date: '2024-01-25', time: '08:00', status: 'confirmado', professional: 'Dr. Ana Silva' },
  { id: '2', date: '2024-01-25', time: '09:30', status: 'cancelado', professional: 'Dr. Pedro Costa' },
  { id: '3', date: '2024-01-26', time: '14:00', status: 'confirmado', professional: 'Dra. Maria Santos' },
  { id: '4', date: '2024-01-26', time: '15:30', status: 'realizado', professional: 'Dr. Ana Silva' },
  { id: '5', date: '2024-01-27', time: '10:00', status: 'confirmado', professional: 'Dr. Pedro Costa' }
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
  const [activeTab, setActiveTab] = useState<'overview' | 'procedures' | 'financial' | 'productivity' | 'patients'>('overview');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // Dados do período anterior para comparação
  const previousPeriodData = useMemo(() => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - periodDays);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);

    return mockProcedures.filter(procedure => {
      const procedureDate = new Date(procedure.date);
      return procedureDate >= previousStart && procedureDate <= previousEnd;
    });
  }, [startDate, endDate]);

  // Calcular estatísticas dos procedimentos
  const procedureStats = useMemo(() => {
    const stats = filteredData.reduce((acc, procedure) => {
      if (!acc[procedure.name]) {
        acc[procedure.name] = {
          name: procedure.name,
          quantity: 0,
          revenue: 0,
          avgDuration: 0,
          totalDuration: 0,
          avgSatisfaction: 0,
          totalSatisfaction: 0
        };
      }
      acc[procedure.name].quantity += 1;
      acc[procedure.name].revenue += procedure.cost;
      acc[procedure.name].totalDuration += procedure.duration;
      acc[procedure.name].totalSatisfaction += procedure.satisfaction;
      acc[procedure.name].avgDuration = acc[procedure.name].totalDuration / acc[procedure.name].quantity;
      acc[procedure.name].avgSatisfaction = acc[procedure.name].totalSatisfaction / acc[procedure.name].quantity;
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
          revenue: 0,
          avgSatisfaction: 0,
          totalSatisfaction: 0,
          totalDuration: 0
        };
      }
      acc[procedure.professional].procedures += 1;
      acc[procedure.professional].revenue += procedure.cost;
      acc[procedure.professional].totalSatisfaction += procedure.satisfaction;
      acc[procedure.professional].totalDuration += procedure.duration;
      acc[procedure.professional].avgSatisfaction = acc[procedure.professional].totalSatisfaction / acc[procedure.professional].procedures;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [filteredData]);

  // Análise de orçamentos
  const budgetAnalysis = useMemo(() => {
    const total = mockBudgets.length;
    const approved = mockBudgets.filter(b => b.status === 'aprovado').length;
    const pending = mockBudgets.filter(b => b.status === 'pendente').length;
    const rejected = mockBudgets.filter(b => b.status === 'recusado').length;
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;
    const totalValue = mockBudgets.reduce((sum, b) => sum + b.total, 0);
    const approvedValue = mockBudgets.filter(b => b.status === 'aprovado').reduce((sum, b) => sum + b.total, 0);

    return {
      total,
      approved,
      pending,
      rejected,
      approvalRate,
      totalValue,
      approvedValue,
      avgBudgetValue: total > 0 ? totalValue / total : 0
    };
  }, []);

  // Análise de agenda
  const scheduleAnalysis = useMemo(() => {
    const totalSlots = mockAppointments.length;
    const confirmed = mockAppointments.filter(a => a.status === 'confirmado').length;
    const completed = mockAppointments.filter(a => a.status === 'realizado').length;
    const cancelled = mockAppointments.filter(a => a.status === 'cancelado').length;
    const occupationRate = totalSlots > 0 ? ((confirmed + completed) / totalSlots) * 100 : 0;
    const cancellationRate = totalSlots > 0 ? (cancelled / totalSlots) * 100 : 0;

    return {
      totalSlots,
      confirmed,
      completed,
      cancelled,
      occupationRate,
      cancellationRate
    };
  }, []);

  // Calcular totais e comparações
  const currentPeriodStats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, p) => sum + p.cost, 0);
    const totalProcedures = filteredData.length;
    const avgTicket = totalProcedures > 0 ? totalRevenue / totalProcedures : 0;
    const totalDuration = filteredData.reduce((sum, p) => sum + p.duration, 0);
    const avgSatisfaction = filteredData.length > 0 ? filteredData.reduce((sum, p) => sum + p.satisfaction, 0) / filteredData.length : 0;

    // Comparação com período anterior
    const previousRevenue = previousPeriodData.reduce((sum, p) => sum + p.cost, 0);
    const previousProcedures = previousPeriodData.length;
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const proceduresGrowth = previousProcedures > 0 ? ((totalProcedures - previousProcedures) / previousProcedures) * 100 : 0;

    return {
      totalRevenue,
      totalProcedures,
      avgTicket,
      totalDuration,
      avgSatisfaction,
      revenueGrowth,
      proceduresGrowth
    };
  }, [filteredData, previousPeriodData]);

  // Análise por faixa etária
  const ageAnalysis = useMemo(() => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    };

    filteredData.forEach(procedure => {
      const age = procedure.patientAge;
      if (age <= 25) ageGroups['18-25']++;
      else if (age <= 35) ageGroups['26-35']++;
      else if (age <= 45) ageGroups['36-45']++;
      else if (age <= 55) ageGroups['46-55']++;
      else ageGroups['56+']++;
    });

    return ageGroups;
  }, [filteredData]);

  // Análise de horários de pico
  const peakHoursAnalysis = useMemo(() => {
    const hours = {
      'Manhã (8h-12h)': 0,
      'Tarde (14h-18h)': 0
    };

    mockAppointments.forEach(appointment => {
      const hour = parseInt(appointment.time.split(':')[0]);
      if (hour >= 8 && hour < 12) {
        hours['Manhã (8h-12h)']++;
      } else if (hour >= 14 && hour < 18) {
        hours['Tarde (14h-18h)']++;
      }
    });

    return hours;
  }, []);

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

  const exportData = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const csvContent = [
        ['Procedimento', 'Quantidade', 'Faturamento', 'Duração Média', 'Satisfação Média'],
        ...procedureStats.map((stat: any) => [
          stat.name,
          stat.quantity,
          `R$ ${stat.revenue.toFixed(2)}`,
          `${Math.round(stat.avgDuration)} min`,
          stat.avgSatisfaction.toFixed(1)
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
      alert('Relatório PDF será gerado com gráficos e análises completas');
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios Avançados</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise completa da performance da clínica</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ocultar Filtros' : 'Filtros'}
          </Button>
          <Button variant="outline" icon={Download} onClick={() => exportData('csv')}>
            CSV
          </Button>
          <Button icon={FileText} onClick={() => exportData('pdf')}>
            PDF Completo
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
              { id: 'productivity', label: 'Produtividade', icon: Activity },
              { id: 'patients', label: 'Pacientes', icon: Users }
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

      {/* Filtros Avançados */}
      {showFilters && (
        <Card title="Filtros Avançados" className="animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>

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

      {/* Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Indicadores Principais com Comparação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Procedimentos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentPeriodStats.totalProcedures}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(currentPeriodStats.proceduresGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(currentPeriodStats.proceduresGrowth)}`}>
                    {Math.abs(currentPeriodStats.proceduresGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Faturamento</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ {currentPeriodStats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(currentPeriodStats.revenueGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(currentPeriodStats.revenueGrowth)}`}>
                    {Math.abs(currentPeriodStats.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R$ {currentPeriodStats.avgTicket.toFixed(0)}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">por procedimento</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Star className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Satisfação</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentPeriodStats.avgSatisfaction.toFixed(1)}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">de 5.0</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficos de Visão Geral */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={filteredData} />
            <ProcedureChart data={procedureStats} />
          </div>

          {/* Análises Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Análise de Orçamentos" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Taxa de Aprovação</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{budgetAnalysis.approvalRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${budgetAnalysis.approvalRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">{budgetAnalysis.approved}</p>
                    <p className="text-gray-500 dark:text-gray-400">Aprovados</p>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">{budgetAnalysis.pending}</p>
                    <p className="text-gray-500 dark:text-gray-400">Pendentes</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">{budgetAnalysis.rejected}</p>
                    <p className="text-gray-500 dark:text-gray-400">Recusados</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Ocupação da Agenda" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Taxa de Ocupação</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{scheduleAnalysis.occupationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${scheduleAnalysis.occupationRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">{scheduleAnalysis.confirmed + scheduleAnalysis.completed}</p>
                    <p className="text-gray-500 dark:text-gray-400">Ocupados</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">{scheduleAnalysis.cancelled}</p>
                    <p className="text-gray-500 dark:text-gray-400">Cancelados</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Horários de Pico" className="p-6">
              <div className="space-y-4">
                {Object.entries(peakHoursAnalysis).map(([period, count]) => (
                  <div key={period} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">{period}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(peakHoursAnalysis))) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Aba Procedimentos */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise de Procedimentos</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Tabela
              </button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {procedureStats.map((stat: any, index) => {
                const maxValue = Math.max(...procedureStats.map((s: any) => sortBy === 'revenue' ? s.revenue : s.quantity));
                const percentage = sortBy === 'revenue' 
                  ? (stat.revenue / maxValue) * 100 
                  : (stat.quantity / maxValue) * 100;
                
                return (
                  <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.round(stat.avgSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
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
                        <span className="font-semibold text-green-600 dark:text-green-400">R$ {stat.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Duração Média</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(stat.avgDuration)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Satisfação</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stat.avgSatisfaction.toFixed(1)}/5</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Satisfação
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < procedure.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="ml-1 text-xs">({procedure.satisfaction})</span>
                          </div>
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
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">R$ {currentPeriodStats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getGrowthIcon(currentPeriodStats.revenueGrowth)}
                    <span className={`text-xs ${getGrowthColor(currentPeriodStats.revenueGrowth)}`}>
                      {Math.abs(currentPeriodStats.revenueGrowth).toFixed(1)}% vs período anterior
                    </span>
                  </div>
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
                      style={{ width: `${Math.min((currentPeriodStats.totalRevenue / 15000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {((currentPeriodStats.totalRevenue / 15000) * 100).toFixed(1)}% da meta
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Orçamentos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">R$ {budgetAnalysis.approvedValue.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {budgetAnalysis.approved} aprovados de {budgetAnalysis.total}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">R$ {currentPeriodStats.avgTicket.toFixed(0)}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">por atendimento</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Faturamento por Procedimento">
              <div className="space-y-4">
                {procedureStats.slice(0, 8).map((stat: any, index) => {
                  const maxRevenue = Math.max(...procedureStats.map((s: any) => s.revenue));
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
                              R$ {stat.revenue.toLocaleString()}
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
                            <span>Margem: {((stat.revenue / currentPeriodStats.totalRevenue) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Análise de Margem por Procedimento">
              <div className="space-y-4">
                {procedureStats.slice(0, 6).map((stat: any) => {
                  const avgCost = stat.revenue / stat.quantity;
                  const estimatedProfit = avgCost * 0.6; // Assumindo 60% de margem
                  const profitMargin = (estimatedProfit / avgCost) * 100;
                  
                  return (
                    <div key={stat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{stat.name}</h4>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {profitMargin.toFixed(1)}% margem
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Valor Médio</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">R$ {avgCost.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Lucro Est.</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">R$ {estimatedProfit.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Total</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">R$ {stat.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Aba Produtividade */}
      {activeTab === 'productivity' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise de Produtividade</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductivityChart data={professionalStats} />
            
            <Card title="Eficiência por Profissional">
              <div className="space-y-4">
                {professionalStats.map((stat: any, index) => {
                  const efficiency = (stat.revenue / stat.totalDuration) * 60; // Revenue per hour
                  const maxEfficiency = Math.max(...professionalStats.map((s: any) => (s.revenue / s.totalDuration) * 60));
                  const efficiencyPercentage = (efficiency / maxEfficiency) * 100;
                  
                  return (
                    <div key={stat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{stat.name}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.round(stat.avgSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Procedimentos</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{stat.procedures}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Faturamento/Hora</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">R$ {efficiency.toFixed(0)}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${efficiencyPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>Total: {Math.round(stat.totalDuration / 60)}h</span>
                        <span>Satisfação: {stat.avgSatisfaction.toFixed(1)}/5</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Ocupação da Agenda" className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {scheduleAnalysis.occupationRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Ocupação</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Confirmados</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{scheduleAnalysis.confirmed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Realizados</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{scheduleAnalysis.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Cancelados</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{scheduleAnalysis.cancelled}</span>
                </div>
              </div>
            </Card>

            <Card title="Horários de Pico" className="p-6">
              <div className="space-y-4">
                {Object.entries(peakHoursAnalysis).map(([period, count]) => (
                  <div key={period}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{period}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{count} consultas</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(peakHoursAnalysis))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Taxa de Cancelamento" className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {scheduleAnalysis.cancellationRate.toFixed(1)}%
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
                  <span className={scheduleAnalysis.cancellationRate > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {scheduleAnalysis.cancellationRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Aba Pacientes */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análise de Pacientes</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientAnalysisChart ageData={ageAnalysis} />
            
            <Card title="Satisfação por Profissional">
              <div className="space-y-4">
                {professionalStats.map((stat: any) => (
                  <div key={stat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{stat.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">
                          {stat.avgSatisfaction.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(stat.avgSatisfaction / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>{stat.procedures} avaliações</span>
                      <span>{((stat.avgSatisfaction / 5) * 100).toFixed(1)}% de satisfação</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Distribuição por Faixa Etária">
              <div className="space-y-3">
                {Object.entries(ageAnalysis).map(([ageGroup, count]) => {
                  const total = Object.values(ageAnalysis).reduce((sum, c) => sum + c, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={ageGroup} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{ageGroup} anos</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-12">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Pacientes Mais Ativos">
              <div className="space-y-3">
                {[
                  { name: 'João Santos', visits: 5, lastVisit: '2024-01-25', revenue: 750 },
                  { name: 'Maria Oliveira', visits: 4, lastVisit: '2024-01-23', revenue: 600 },
                  { name: 'Carlos Pereira', visits: 3, lastVisit: '2024-01-20', revenue: 450 },
                  { name: 'Ana Costa', visits: 3, lastVisit: '2024-01-18', revenue: 900 },
                  { name: 'Roberto Silva', visits: 2, lastVisit: '2024-01-15', revenue: 550 }
                ].map((patient, index) => (
                  <div key={patient.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Última visita: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{patient.visits} visitas</p>
                      <p className="text-sm text-green-600 dark:text-green-400">R$ {patient.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Metas e Alertas */}
      <Card title="Metas e Alertas" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentPeriodStats.totalRevenue >= 15000 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <Target className={`w-6 h-6 ${
                currentPeriodStats.totalRevenue >= 15000 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Meta de Faturamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentPeriodStats.totalRevenue >= 15000 ? '✅ Meta atingida!' : '⚠️ Faltam R$ ' + (15000 - currentPeriodStats.totalRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentPeriodStats.avgSatisfaction >= 4.5 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <Star className={`w-6 h-6 ${
                currentPeriodStats.avgSatisfaction >= 4.5 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Meta de Satisfação</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentPeriodStats.avgSatisfaction >= 4.5 ? '✅ Excelente!' : '⚠️ Melhorar atendimento'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              scheduleAnalysis.cancellationRate <= 10 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                scheduleAnalysis.cancellationRate <= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Taxa de Cancelamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {scheduleAnalysis.cancellationRate <= 10 ? '✅ Dentro da meta!' : '🚨 Acima do ideal (10%)'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}