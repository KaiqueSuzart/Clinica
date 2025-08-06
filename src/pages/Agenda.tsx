import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, Filter, MessageCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewAppointmentModal from '../components/Appointments/NewAppointmentModal';
import { appointments } from '../data/mockData';

export default function Agenda() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState(appointments);

  const professionals = ['Dr. Ana Silva', 'Dr. Pedro Costa', 'Dra. Maria Santos'];
  const statuses = ['confirmado', 'pendente', 'cancelado', 'realizado'];

  const filteredAppointments = appointmentsList.filter(apt => {
    const professionalMatch = selectedProfessional === 'all' || apt.professional === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || apt.status === selectedStatus;
    return professionalMatch && statusMatch;
  });

  const handleNewAppointment = (newAppointment: any) => {
    setAppointmentsList(prev => [...prev, newAppointment]);
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
      <Card title="Consultas Agendadas" subtitle={`${filteredAppointments.length} consultas encontradas`}>
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {new Date(appointment.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
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
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <StatusBadge status={appointment.status} />
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="outline" size="sm">WhatsApp</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <NewAppointmentModal
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSave={handleNewAppointment}
      />
    </div>
  );
}