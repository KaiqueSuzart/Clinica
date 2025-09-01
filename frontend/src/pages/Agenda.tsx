import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Filter, MessageCircle, CheckCircle, AlertCircle, XCircle, Search, History } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewAppointmentModal from '../components/Appointments/NewAppointmentModal';
import EditAppointmentModal from '../components/Appointments/EditAppointmentModal';
import { apiService, Appointment } from '../services/api';

export default function Agenda() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPastAppointments, setShowPastAppointments] = useState(false);

  // Função para corrigir problema de fuso horário na exibição de datas
  const formatDateSafe = (dateString: string, options: Intl.DateTimeFormatOptions) => {
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return localDate.toLocaleDateString('pt-BR', options);
  };

  const professionals = ['Dr. Ana Silva', 'Dr. Pedro Costa', 'Dra. Maria Santos'];
  const statuses = ['confirmado', 'pendente', 'cancelado', 'realizado'];

  // Carregar agendamentos da API
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const appointments = await apiService.getAllAppointments();
      setAppointmentsList(appointments);
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
  const filteredAppointments = appointmentsList
    .filter(apt => {
      const professionalMatch = selectedProfessional === 'all' || apt.professional === selectedProfessional;
      const statusMatch = selectedStatus === 'all' || apt.status === selectedStatus;
      const searchMatch = searchTerm === '' || 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.procedure.toLowerCase().includes(searchTerm.toLowerCase());
      
      return professionalMatch && statusMatch && searchMatch;
    })
    .sort((a, b) => {
      // Ordenar por data e horário
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  // Separar consultas futuras e passadas
  const upcomingAppointments = filteredAppointments.filter(apt => !isPastAppointment(apt));
  const pastAppointments = filteredAppointments.filter(apt => isPastAppointment(apt));

  // Escolher qual lista mostrar
  const appointmentsToShow = showPastAppointments ? pastAppointments : upcomingAppointments;

  const handleNewAppointment = async (newAppointment: any) => {
    try {
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
      setAppointmentsList(prev => [...prev, created]);
    } catch (err) {
      setError('Erro ao criar agendamento');
      console.error('Erro ao criar agendamento:', err);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditAppointment(true);
  };

  const handleSaveEditAppointment = async (updatedAppointment: Appointment) => {
    try {
      const updated = await apiService.updateAppointment(updatedAppointment.id, updatedAppointment);
      setAppointmentsList(prev => prev.map(apt => 
        apt.id === updated.id ? updated : apt
      ));
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
        </div>
        <Button icon={Plus} onClick={() => setShowNewAppointment(true)}>
          Nova Consulta
        </Button>
      </div>

      {/* Barra de Pesquisa */}
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
              onClick={() => setShowPastAppointments(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                !showPastAppointments
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Próximas ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setShowPastAppointments(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                showPastAppointments
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico ({pastAppointments.length})
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
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Mês
            </button>
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
        </div>
      </Card>

      {/* Lista de Agendamentos */}
      <Card 
        title={showPastAppointments ? "Histórico de Consultas" : "Próximas Consultas"} 
        subtitle={`${appointmentsToShow.length} consultas encontradas${searchTerm ? ` para "${searchTerm}"` : ''}`}
      >
        {appointmentsToShow.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              {showPastAppointments ? <History className="w-8 h-8 mx-auto" /> : <Clock className="w-8 h-8 mx-auto" />}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `Nenhuma consulta encontrada para "${searchTerm}"`
                : showPastAppointments 
                ? 'Nenhuma consulta no histórico'
                : 'Nenhuma consulta próxima agendada'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentsToShow.map((appointment) => {
              const isPast = isPastAppointment(appointment);
              return (
            <div key={appointment.id} className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isPast 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 opacity-75' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {formatDateSafe(appointment.date, { day: '2-digit' })}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {formatDateSafe(appointment.date, { month: 'short' })}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{appointment.patientName}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        {getStatusIcon(appointment.status)}
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <span>•</span>
                      <span>{appointment.procedure}</span>
                      <span>•</span>
                      <span>{appointment.professional}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{appointment.patientPhone}</p>
                    {!isPast && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {(() => {
                          const now = new Date();
                          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
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
                
                <div className="flex items-center space-x-3">
                  <StatusBadge status={appointment.status} />
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">WhatsApp</Button>
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
    </div>
  );
}