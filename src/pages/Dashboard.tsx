import React from 'react';
import { useState } from 'react';
import { Calendar, Users, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import StatusBadge from '../components/UI/StatusBadge';
import EvaluationModal from '../components/Evaluations/EvaluationModal';
import { appointments, patients, messages, returnVisits } from '../data/mockData';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );
  
  const pendingConfirmations = appointments.filter(apt => apt.status === 'pendente').length;
  const totalPatients = patients.length;
  const pendingMessages = messages.filter(msg => msg.status === 'enviada').length;

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
      value: todayAppointments.length,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Total de Pacientes',
      value: totalPatients,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Confirmações Pendentes',
      value: pendingConfirmations,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      title: 'Mensagens Não Lidas',
      value: pendingMessages,
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

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
        <Card title="Próximos Retornos" subtitle={`${returnVisits.length} retornos agendados`}>
          <div className="space-y-4">
            {returnVisits.map((returnVisit) => (
              <div key={returnVisit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">{returnVisit.patientName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(returnVisit.returnDate).toLocaleDateString('pt-BR')} - {returnVisit.procedure}
                    </p>
                  </div>
                </div>
                <StatusBadge status={returnVisit.status} type="return" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Indicadores do Mês */}
      <Card title="Indicadores do Mês" subtitle="Performance da clínica em Janeiro 2024">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">45</div>
            <p className="text-sm text-gray-600">Atendimentos Realizados</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
            <p className="text-sm text-gray-600">Taxa de Comparecimento</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">R$ 12.450</div>
            <p className="text-sm text-gray-600">Faturamento</p>
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