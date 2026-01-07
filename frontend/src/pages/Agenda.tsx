import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Filter, MessageCircle, CheckCircle, AlertCircle, XCircle, Search, History } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewAppointmentModal from '../components/Appointments/NewAppointmentModal';
import EditAppointmentModal from '../components/Appointments/EditAppointmentModal';
import RegisterPaymentModal from '../components/Payments/RegisterPaymentModal';
import { apiService, Appointment, ReturnVisit } from '../services/api';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneFormatter';
import { useDentistas } from '../hooks/useDentistas';

export default function Agenda() {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [historyAppointments, setHistoryAppointments] = useState<ReturnVisit[]>([]);
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [confirmedReturns, setConfirmedReturns] = useState<ReturnVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRegisterPayment, setShowRegisterPayment] = useState(false);
  const [appointmentForPayment, setAppointmentForPayment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month'>('today');

  // Função para corrigir problema de fuso horário na exibição de datas
  const formatDateSafe = (dateString: string | undefined, options: Intl.DateTimeFormatOptions) => {
    if (!dateString) {
      return 'Data não disponível';
    }
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return localDate.toLocaleDateString('pt-BR', options);
  };

  const { dentistas, getDentistasOptions } = useDentistas();
  // Usar dentistas do banco de dados
  const professionalsOptions = getDentistasOptions();
  const professionals = professionalsOptions.length > 0 
    ? ['all', ...professionalsOptions.map(d => d.nome)]
    : ['all', 'Dr. Ana Silva']; // Fallback se não houver dentistas
  const statuses = ['confirmado', 'pendente', 'cancelado', 'realizado'];

  // Carregar agendamentos da API
  useEffect(() => {
    loadAppointments();
  }, []);

  // Escutar evento de retorno agendado
  useEffect(() => {
    const handleReturnScheduled = (event: CustomEvent) => {
      console.log('Retorno agendado, recarregando dados da agenda...');
      loadAppointments();
    };

    window.addEventListener('returnScheduled', handleReturnScheduled as EventListener);
    
    return () => {
      window.removeEventListener('returnScheduled', handleReturnScheduled as EventListener);
    };
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar consultas do dia, semana, mês, retornos confirmados e histórico de retornos realizados
      const [todayData, weekData, monthData, confirmedReturnsData, historyData] = await Promise.all([
        apiService.getTodayAppointments(),
        apiService.getWeekAppointments(),
        apiService.getMonthAppointments(),
        apiService.getConfirmedReturns(), // Retornos confirmados para a agenda
        apiService.getCompletedReturns() // Usar retornos realizados no histórico
      ]);
      
      setTodayAppointments(todayData);
      setWeekAppointments(weekData);
      setMonthAppointments(monthData);
      setConfirmedReturns(confirmedReturnsData);
      setHistoryAppointments(historyData);
    } catch (err) {
      setError('Erro ao carregar agendamentos. Verifique se o backend está rodando.');
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se uma consulta já passou
  const isPastAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    return appointmentDate < now;
  };

  // Filtrar e ordenar consultas
  const getFilteredAppointments = (appointments: Appointment[], filterByToday = false) => {
    return appointments
      .filter(apt => {
        const professionalMatch = selectedProfessional === 'all' || apt.professional === selectedProfessional;
        const statusMatch = selectedStatus === 'all' || apt.status === selectedStatus;
        const searchMatch = searchTerm === '' || 
          apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.procedure.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtrar consultas realizadas da agenda do dia
        const notCompleted = apt.status !== 'realizado';
        
        // Filtrar por data se necessário (para agenda do dia)
        let dateMatch = true;
        if (filterByToday) {
          const today = new Date().toISOString().split('T')[0];
          dateMatch = apt.date === today;
        }
        
        return professionalMatch && statusMatch && searchMatch && notCompleted && dateMatch;
      })
      .sort((a, b) => {
        // Ordenar por data e horário
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Função para filtrar retornos (histórico)
  const getFilteredReturns = (returns: ReturnVisit[]) => {
    return returns
      .filter(ret => {
        const searchMatch = searchTerm === '' || 
          ret.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ret.procedimento.toLowerCase().includes(searchTerm.toLowerCase());
        
        return searchMatch;
      })
      .sort((a, b) => {
        // Ordenar por data e horário
        const dateA = new Date(`${a.data_retorno}T${a.hora_retorno || '00:00:00'}`);
        const dateB = new Date(`${b.data_retorno}T${b.hora_retorno || '00:00:00'}`);
        return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
      });
  };

  // Função para mesclar consultas e retornos confirmados
  const mergeAppointmentsAndReturns = (appointments: Appointment[], returns: ReturnVisit[]) => {
    // Converter retornos para o formato de consulta e filtrar realizados
    const convertedReturns = returns
      .filter(ret => ret.status !== 'realizado') // Filtrar retornos realizados
      .map(ret => {
        return {
          id: `return_${ret.id}`,
          patientId: ret.cliente_id,
          patientName: ret.paciente_nome,
          patientPhone: ret.paciente_telefone,
          date: ret.data_retorno,
          time: ret.hora_retorno,
          duration: 60, // Duração padrão para retornos
          procedure: ret.procedimento,
          professional: 'Dr. Ana Silva', // Profissional padrão
          status: ret.status as 'pendente' | 'confirmado' | 'cancelado' | 'realizado',
          notes: ret.observacoes,
          isReturn: true // Flag para identificar que é um retorno
        };
      });

    // Mesclar e ordenar por data e horário
    const merged = [...appointments, ...convertedReturns].sort((a, b) => {
      // Verificar se as datas existem antes de criar os objetos Date
      if (!a.date || !b.date) {
        console.warn('Data não encontrada:', { a: a.date, b: b.date });
        return 0;
      }
      const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    return merged;
  };

  const filteredTodayAppointments = getFilteredAppointments(todayAppointments, true); // Filtrar por hoje
  const filteredWeekAppointments = getFilteredAppointments(weekAppointments);
  const filteredMonthAppointments = getFilteredAppointments(monthAppointments);
  const filteredHistoryReturns = getFilteredReturns(historyAppointments);
  const filteredConfirmedReturns = getFilteredReturns(confirmedReturns);

  // Escolher qual lista mostrar baseado na aba ativa e filtro de período
  const getAppointmentsToShow = () => {
    if (activeTab === 'history') {
      return filteredHistoryReturns;
    }
    
    // Para a aba de consultas, mesclar consultas com retornos confirmados
    let appointments = [];
    switch (periodFilter) {
      case 'today':
        appointments = filteredTodayAppointments;
        break;
      case 'week':
        appointments = filteredWeekAppointments;
        break;
      case 'month':
        appointments = filteredMonthAppointments;
        break;
      default:
        appointments = filteredTodayAppointments;
    }
    
    // Mesclar consultas com retornos confirmados
    return mergeAppointmentsAndReturns(appointments, filteredConfirmedReturns);
  };

  const appointmentsToShow = getAppointmentsToShow();

  const handleNewAppointment = async (newAppointment: any) => {
    try {
      console.log('Criando nova consulta:', newAppointment);
      
      const created = await apiService.createAppointment({
        patientId: newAppointment.patientId,
        date: newAppointment.date,
        time: newAppointment.time,
        duration: newAppointment.duration,
        procedure: newAppointment.procedure,
        professional: newAppointment.professional,
        status: newAppointment.status || 'pendente',
        notes: newAppointment.notes
      });
      
      console.log('Consulta criada com sucesso:', created);
      
      // Recarregar todos os dados da agenda para garantir consistência
      await loadAppointments();
      
      console.log('Dados da agenda recarregados');
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError('Erro ao criar agendamento. Verifique se o backend está rodando.');
    }
  };

  const handleMarkAsCompleted = async (appointment: Appointment) => {
    try {
      console.log('Marcando consulta como realizada:', appointment);
      console.log('ID da consulta:', appointment.id);
      
      if (!appointment.id) {
        throw new Error('ID da consulta não encontrado');
      }
      
      // Se for um retorno (isReturn), não marcar como realizado diretamente
      // Retornos devem ser tratados separadamente
      if ((appointment as any).isReturn) {
        console.log('É um retorno, não deve ser marcado como realizado aqui');
        return;
      }
      
      const updated = await apiService.markAppointmentAsCompleted(appointment.id);
      
      // Recarregar todos os dados da agenda para garantir consistência
      // Isso evita duplicações e garante que os dados estejam atualizados
      await loadAppointments();
      
      console.log('Consulta marcada como realizada e dados recarregados:', updated);
    } catch (err) {
      setError('Erro ao marcar consulta como realizada');
      console.error('Erro ao marcar consulta como realizada:', err);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditAppointment(true);
  };

  const handleSaveEditAppointment = async (updatedAppointment: Appointment) => {
    try {
      const updated = await apiService.updateAppointment(updatedAppointment.id, updatedAppointment);
      
      // Recarregar todos os dados da agenda para garantir consistência
      await loadAppointments();
      
      // Disparar evento customizado para notificar que uma consulta foi editada
      // Isso permite que outros componentes (como NewAppointmentModal) recarreguem seus dados
      window.dispatchEvent(new CustomEvent('appointmentUpdated', { 
        detail: { appointment: updated } 
      }));
      
      console.log('Consulta editada e dados recarregados:', updated);
    } catch (err) {
      setError('Erro ao atualizar agendamento');
      console.error('Erro ao atualizar agendamento:', err);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pendente':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'realizado':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <p className="text-red-800 font-medium">Erro ao carregar agendamentos</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={loadAppointments}
              className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Agenda</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Gerencie os agendamentos da clínica</p>
        </div>
        <Button icon={Plus} onClick={() => setShowNewAppointment(true)} className="w-full sm:w-auto">
          <span className="hidden sm:inline">Nova Consulta</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Abas de Navegação */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por nome do paciente ou procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'today'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Consultas ({appointmentsToShow.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico ({filteredHistoryReturns.length})
            </button>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>

          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos os profissionais</option>
            {professionals.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos os status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Filtros de Período - só aparecem na aba de consultas */}
          {activeTab === 'today' && (
            <>
              <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPeriodFilter('today')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodFilter === 'today'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setPeriodFilter('week')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodFilter === 'week'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setPeriodFilter('month')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodFilter === 'month'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Este Mês
                </button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Lista de Agendamentos */}
      <Card 
        title={activeTab === 'today' ? 
          (periodFilter === 'today' ? "Agenda do Dia" : 
           periodFilter === 'week' ? "Agenda da Semana" : 
           "Agenda do Mês") : 
          "Histórico de Retornos"} 
        subtitle={`${appointmentsToShow.length} ${activeTab === 'today' ? 'itens' : 'retornos'} encontrados${searchTerm ? ` para "${searchTerm}"` : ''}`}
      >
        {appointmentsToShow.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              {activeTab === 'history' ? <History className="w-8 h-8 mx-auto" /> : <Clock className="w-8 h-8 mx-auto" />}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `Nenhum ${activeTab === 'today' ? 'item' : 'retorno'} encontrado para "${searchTerm}"`
                : activeTab === 'history'
                ? 'Nenhum retorno no histórico'
                : periodFilter === 'today'
                ? 'Nenhuma consulta ou retorno agendado para hoje'
                : periodFilter === 'week'
                ? 'Nenhuma consulta ou retorno agendado para esta semana'
                : 'Nenhuma consulta ou retorno agendado para este mês'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentsToShow.map((item) => {
              // Verificar se é um retorno ou consulta
              const isReturn = 'isReturn' in item && item.isReturn === true;
              const isPast = isReturn ? false : isPastAppointment(item as Appointment);
              
              
              return (
            <div key={item.id} className={`border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isPast 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 opacity-75' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 sm:p-3 flex-shrink-0">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {formatDateSafe(
                        isReturn 
                          ? (item as any).data_retorno || (item as any).date
                          : (item as Appointment).date, 
                        { day: '2-digit' }
                      )}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {formatDateSafe(
                        isReturn 
                          ? (item as any).data_retorno || (item as any).date
                          : (item as Appointment).date, 
                        { month: 'short' }
                      )}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{(item as Appointment).patientName}</h3>
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        {getStatusIcon((item as Appointment).status)}
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{(item as Appointment).time}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{(item as Appointment).procedure}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{(item as Appointment).professional}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{formatPhoneDisplay((item as Appointment).patientPhone)}</p>
                    {!isPast && !isReturn && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {(() => {
                          const now = new Date();
                          const appointmentDateTime = new Date(`${(item as Appointment).date}T${(item as Appointment).time}`);
                          const diffMs = appointmentDateTime.getTime() - now.getTime();
                          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          
                          if (diffHours < 0) return '';
                          if (diffHours === 0 && diffMinutes <= 30) return '🔔 Consulta em breve!';
                          if (diffHours < 24) return `Em ${diffHours}h ${diffMinutes}min`;
                          return `Em ${Math.floor(diffHours / 24)} dias`;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-3 flex-shrink-0">
                  <div className="flex-shrink-0">
                    <StatusBadge status={(item as Appointment).status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isReturn && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAppointment(item as Appointment)}
                        className="text-xs sm:text-sm"
                      >
                        Editar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const phone = (item as Appointment).patientPhone;
                        const whatsappUrl = getWhatsAppLink(phone);
                        if (whatsappUrl) {
                          window.open(whatsappUrl, '_blank');
                        }
                      }}
                      className="text-xs sm:text-sm"
                    >
                      WhatsApp
                    </Button>
                    {activeTab === 'today' && !isReturn && (item as Appointment).status !== 'realizado' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          const appointment = item as Appointment;
                          if (!appointment.id) {
                            console.error('ID não encontrado no item:', appointment);
                            setError('Erro: ID da consulta não encontrado');
                            return;
                          }
                          handleMarkAsCompleted(appointment);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                      >
                        Realizar
                      </Button>
                    )}
                    {!isReturn && (item as Appointment).status === 'realizado' && !(item as Appointment).pago && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          setAppointmentForPayment(item as Appointment);
                          setShowRegisterPayment(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm whitespace-nowrap"
                      >
                        Registrar Pagamento
                      </Button>
                    )}
                    {isReturn && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={async () => {
                          // Para retornos, marcar como realizado no backend
                          const returnId = (item as any).id?.replace('return_', '');
                          if (returnId) {
                            try {
                              await apiService.updateReturn(returnId, { status: 'realizado' });
                              await loadAppointments(); // Recarregar dados
                            } catch (err) {
                              console.error('Erro ao marcar retorno como realizado:', err);
                              setError('Erro ao marcar retorno como realizado');
                            }
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                      >
                        Realizar Consulta
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        )}
      </Card>
      
      <NewAppointmentModal
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSave={handleNewAppointment}
      />
      
      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={showEditAppointment}
          onClose={() => {
            setShowEditAppointment(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSave={handleSaveEditAppointment}
        />
      )}

      {showRegisterPayment && (
        <RegisterPaymentModal
          isOpen={showRegisterPayment}
          onClose={() => {
            setShowRegisterPayment(false);
            setAppointmentForPayment(null);
          }}
          onSave={async (data) => {
            try {
              await apiService.createPayment(data);
              await loadAppointments();
              setShowRegisterPayment(false);
              setAppointmentForPayment(null);
            } catch (err) {
              console.error('Erro ao registrar pagamento:', err);
              throw err;
            }
          }}
          appointment={appointmentForPayment}
        />
      )}
    </div>
  );
}