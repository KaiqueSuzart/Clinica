import React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import StatusBadge from '../components/UI/StatusBadge';
import EvaluationModal from '../components/Evaluations/EvaluationModal';
import { apiService, Appointment, DashboardStats, ReturnVisit } from '../services/api';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [confirmedReturns, setConfirmedReturns] = useState<ReturnVisit[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConfirmations: 0,
    unreadMessages: 0
  });
  const [monthlyStats, setMonthlyStats] = useState({
    atendimentosRealizados: 0,
    taxaComparecimento: 0,
    faturamento: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtrar retornos de hoje
  const todayReturns = confirmedReturns.filter(returnVisit => {
    const today = new Date().toISOString().split('T')[0];
    return returnVisit.data_retorno === today;
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsData, returnsData, statsData, monthlyData] = await Promise.all([
        apiService.getTodayAppointments(),
        apiService.getConfirmedReturns(),
        apiService.getDashboardStats(),
        apiService.getMonthlyStats()
      ]);
      
      setTodayAppointments(appointmentsData);
      setConfirmedReturns(returnsData);
      setDashboardStats(statsData);
      setMonthlyStats(monthlyData);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'custom': return 'Período Personalizado';
      default: return 'Este Mês';
    }
  };

  const stats = [
    {
      title: 'Atendimentos Hoje',
      value: dashboardStats.todayAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Total de Pacientes',
      value: dashboardStats.totalPatients,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Confirmações Pendentes',
      value: dashboardStats.pendingConfirmations,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      title: 'Mensagens Não Lidas',
      value: dashboardStats.unreadMessages,
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da clínica</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Período:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos de Hoje */}
        <Card title="Atendimentos de Hoje" subtitle={`${todayAppointments.length} consultas agendadas`}>
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.time} - {appointment.procedure}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={appointment.status} />
                    {appointment.status === 'realizado' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowEvaluation(true);
                        }}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Avaliar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum atendimento agendado para hoje</p>
              </div>
            )}
          </div>
        </Card>

        {/* Retornos Agendados */}
        <Card title="Próximos Retornos" subtitle={`${todayReturns.length} retornos de hoje`}>
          <div className="space-y-4">
            {todayReturns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum retorno agendado para hoje</p>
              </div>
            ) : (
              todayReturns.slice(0, 5).map((returnVisit) => (
                <div key={returnVisit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{returnVisit.paciente_nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {returnVisit.hora_retorno || '09:00'} - {returnVisit.procedimento}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={returnVisit.status} type="return" />
                </div>
              ))
            )}
            {todayReturns.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  +{todayReturns.length - 5} retornos adicionais
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Indicadores do Mês */}
      <Card title="Indicadores do Mês" subtitle={`Performance da clínica em ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{monthlyStats.atendimentosRealizados}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Atendimentos Realizados</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{monthlyStats.taxaComparecimento}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Comparecimento</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyStats.faturamento)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Faturamento</p>
          </div>
        </div>
      </Card>
      
      {selectedAppointment && (
        <EvaluationModal
          isOpen={showEvaluation}
          onClose={() => {
            setShowEvaluation(false);
            setSelectedAppointment(null);
          }}
          patientName={selectedAppointment.patientName}
          appointmentId={selectedAppointment.id}
        />
      )}
    </div>
  );
}