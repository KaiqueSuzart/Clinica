import React from 'react';
import { useState, useEffect } from 'react';
import { RotateCcw, Calendar, Clock, Phone, CheckCircle, AlertCircle, MessageSquare, User } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewReturnModal from '../components/Returns/NewReturnModal';
import ScheduleAppointmentModal from '../components/Returns/ScheduleAppointmentModal';
import { useToast } from '../components/UI/Toast';
import { apiService, ReturnVisit } from '../services/api';

export default function Retornos() {
  const { showSuccess, showError } = useToast();
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [returnsList, setReturnsList] = useState<ReturnVisit[]>([]);
  const [possibleReturns, setPossibleReturns] = useState<ReturnVisit[]>([]);
  const [completedReturns, setCompletedReturns] = useState<ReturnVisit[]>([]);
  const [overdueReturns, setOverdueReturns] = useState<ReturnVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'confirmed' | 'possible' | 'completed' | 'overdue'>('confirmed');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPossibleReturn, setSelectedPossibleReturn] = useState<ReturnVisit | null>(null);
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [selectedReturnToReschedule, setSelectedReturnToReschedule] = useState<ReturnVisit | null>(null);

  // Carregar dados da API
  useEffect(() => {
    loadReturnsData();
  }, []);

  const loadReturnsData = async () => {
    try {
      setLoading(true);
      const [confirmedReturns, possibleReturnsData, completedReturnsData, overdueReturnsData] = await Promise.all([
        apiService.getConfirmedReturns(),
        apiService.getPossibleReturns(),
        apiService.getCompletedReturns(),
        apiService.getOverdueReturns()
      ]);
      
      setReturnsList(confirmedReturns);
      setPossibleReturns(possibleReturnsData);
      setCompletedReturns(completedReturnsData);
      setOverdueReturns(overdueReturnsData);
    } catch (error) {
      console.error('Erro ao carregar retornos:', error);
      showError('Erro ao carregar dados dos retornos');
    } finally {
      setLoading(false);
    }
  };

  const handleNewReturn = async (newReturn: any) => {
    try {
      const createdReturn = await apiService.createReturn(newReturn);
      setReturnsList(prev => [...prev, createdReturn]);
      await loadReturnsData(); // Recarregar dados para garantir consistência
    } catch (error) {
      console.error('Erro ao criar retorno:', error);
      showError('Erro ao criar retorno');
    }
  };

  const handleMarcarConsulta = (possibleReturn: ReturnVisit) => {
    setSelectedPossibleReturn(possibleReturn);
    setShowScheduleModal(true);
  };

  const handleReagendar = (returnVisit: ReturnVisit) => {
    setSelectedReturnToReschedule(returnVisit);
    setShowReagendarModal(true);
  };

      const handleSaveAppointment = async (appointmentData: any) => {
      try {
        console.log('Iniciando agendamento de retorno:', appointmentData);
        console.log('Retorno selecionado:', selectedPossibleReturn);
        
        // Criar consulta real na agenda
        let appointment;
        try {
          appointment = await apiService.createAppointment({
            patientId: selectedPossibleReturn?.cliente_id,
            date: appointmentData.date,
            time: appointmentData.time,
            duration: appointmentData.duration || 60,
            procedure: selectedPossibleReturn?.procedimento || appointmentData.procedure,
            professional: appointmentData.professional || 'Dr. Ana Silva',
            status: 'confirmado',
            notes: `Retorno confirmado - ${selectedPossibleReturn?.motivo || ''}`
          });
          console.log('Consulta criada com sucesso:', appointment);
        } catch (appointmentError) {
          console.error('Erro ao criar consulta:', appointmentError);
          showError('Erro ao criar consulta na agenda');
          return;
        }

        // Confirmar o retorno como agendado e atualizar horário
        if (selectedPossibleReturn) {
          try {
            console.log('Atualizando retorno com ID:', selectedPossibleReturn.id);
            console.log('Dados para atualização:', {
              status: 'pendente',
              hora_retorno: appointmentData.time,
              data_retorno: appointmentData.date
            });
            
            // Atualizar o retorno com o horário da consulta criada
            // Manter status 'pendente' para confirmação posterior
            const updatedReturn = await apiService.updateReturn(selectedPossibleReturn.id, {
              status: 'pendente',
              hora_retorno: appointmentData.time,
              data_retorno: appointmentData.date
            });
            console.log('Retorno confirmado e atualizado com sucesso:', updatedReturn);
          } catch (confirmError) {
            console.error('Erro ao confirmar retorno:', confirmError);
            showError('Erro ao atualizar retorno');
            return;
          }
          
          // Recarregar dados para atualizar a lista
          console.log('Recarregando dados...');
          await loadReturnsData();
        }
        
        showSuccess(`Retorno agendado com sucesso! Paciente: ${appointmentData.patientName} - ${new Date(appointmentData.date).toLocaleDateString('pt-BR')} às ${appointmentData.time}. Será enviada uma mensagem de confirmação no dia da consulta.`);
      } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        showError('Erro ao agendar consulta');
      }
    };

  const handleSaveReschedule = async (appointmentData: any) => {
    try {
      // Criar nova consulta na agenda
      const appointment = await apiService.createAppointment({
        patientId: selectedReturnToReschedule?.cliente_id,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || 60,
        procedure: selectedReturnToReschedule?.procedimento || appointmentData.procedure,
        professional: appointmentData.professional || 'Dr. Ana Silva',
        status: 'confirmado',
        notes: `Retorno reagendado - ${selectedReturnToReschedule?.motivo || ''}`
      });

      if (selectedReturnToReschedule) {
        await apiService.updateReturn(selectedReturnToReschedule.id, {
          data_retorno: appointmentData.date,
          hora_retorno: appointmentData.time,
          status: 'confirmado'
        });
        await loadReturnsData(); // Recarregar dados
      }
      
      showSuccess(`Consulta reagendada com sucesso! Paciente: ${appointmentData.patientName} - ${new Date(appointmentData.date).toLocaleDateString('pt-BR')} às ${appointmentData.time}`);
    } catch (error) {
      console.error('Erro ao reagendar consulta:', error);
      showError('Erro ao reagendar consulta');
    }
  };

  const handleConfirmReturn = async (returnId: string) => {
    try {
      // Buscar dados do retorno para criar consulta
      const returnData = returnsList.find(r => r.id === returnId);
      if (returnData) {
        // Criar consulta real na agenda
        await apiService.createAppointment({
          patientId: returnData.cliente_id,
          date: returnData.data_retorno,
          time: returnData.hora_retorno,
          duration: 60,
          procedure: returnData.procedimento,
          professional: 'Dr. Ana Silva',
          status: 'confirmado',
          notes: `Retorno confirmado - ${returnData.motivo || ''}`
        });
      }

      await apiService.confirmReturn(returnId);
      await loadReturnsData();
      showSuccess('Retorno confirmado com sucesso! A consulta agora aparece na agenda!');
    } catch (error) {
      console.error('Erro ao confirmar retorno:', error);
      showError('Erro ao confirmar retorno');
    }
  };

  const handleCompleteReturn = async (returnId: string) => {
    try {
      await apiService.completeReturn(returnId);
      await loadReturnsData();
      showSuccess('Retorno marcado como realizado!');
    } catch (error) {
      console.error('Erro ao marcar retorno como realizado:', error);
      showError('Erro ao marcar retorno como realizado');
    }
  };

  // Função para calcular dias desde o lembrete
  const calculateDaysSinceReminder = (returnDate: string) => {
    const today = new Date();
    const returnDateObj = new Date(returnDate + 'T00:00:00');
    const diffTime = today.getTime() - returnDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateReminderDate = (returnDate: string, observations: string) => {
    // Extrair dias de lembrete das observações
    const reminderMatch = observations?.match(/Lembrete: (\d+) dias antes/);
    const reminderDays = reminderMatch ? parseInt(reminderMatch[1]) : 7; // Default 7 dias
    
    const returnDateObj = new Date(returnDate + 'T00:00:00');
    const reminderDate = new Date(returnDateObj);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    
    return reminderDate.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Carregando retornos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retornos</h1>
          <p className="text-gray-600">Gerencie os retornos agendados dos pacientes</p>
        </div>
        <Button icon={RotateCcw} onClick={() => setShowNewReturn(true)}>
          Novo Retorno
        </Button>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Retornos Confirmados
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                {returnsList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('possible')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'possible'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Possíveis Retornos
              <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs">
                {possibleReturns.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Histórico
              <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                {completedReturns.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overdue'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Atrasados
              <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs">
                {overdueReturns.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Estatísticas */}
      {activeTab === 'confirmed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total de Retornos</p>
              <p className="text-2xl font-bold text-gray-900">{returnsList.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {returnsList.filter(r => r.status === 'pendente').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <RotateCcw className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-gray-900">
                {returnsList.filter(r => r.status === 'confirmado').length}
              </p>
            </div>
          </div>
        </Card>
      </div>
      )}

      {activeTab === 'possible' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Aguardando Agendamento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {possibleReturns.filter(r => r.status === 'pendente').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Atrasados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {possibleReturns.filter(r => {
                  const reminderDate = calculateReminderDate(r.data_retorno, r.observacoes);
                  const reminderDateObj = new Date(reminderDate.split('/').reverse().join('-') + 'T00:00:00');
                  const today = new Date();
                  const diffTime = today.getTime() - reminderDateObj.getTime();
                  const daysSinceReminder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return daysSinceReminder > 0;
                }).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {possibleReturns.filter(r => new Date(r.data_retorno + 'T00:00:00').getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </Card>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Realizados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedReturns.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedReturns.filter(r => new Date(r.data_retorno + 'T00:00:00').getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedReturns.filter(r => {
                    const returnDate = new Date(r.data_retorno + 'T00:00:00');
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return returnDate >= weekAgo && returnDate <= today;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'overdue' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Atrasados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {overdueReturns.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mais de 1 Dia</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {overdueReturns.filter(r => {
                    const returnDate = new Date(r.data_retorno + 'T' + (r.hora_retorno || '00:00:00'));
                    const today = new Date();
                    const diffTime = today.getTime() - returnDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays > 1;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {overdueReturns.filter(r => {
                    const returnDate = new Date(r.data_retorno + 'T00:00:00');
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return returnDate >= weekAgo && returnDate <= today;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}


      {/* Lista de Possíveis Retornos */}
      {activeTab === 'possible' && (
        <Card title="Possíveis Retornos" subtitle={`${possibleReturns.length} pacientes aguardando agendamento`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Procedimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Prevista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lembrete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {possibleReturns.map((possibleReturn) => {
                  const reminderDate = calculateReminderDate(possibleReturn.data_retorno, possibleReturn.observacoes);
                  const reminderDateObj = new Date(reminderDate.split('/').reverse().join('-') + 'T00:00:00');
                  const today = new Date();
                  const diffTime = today.getTime() - reminderDateObj.getTime();
                  const daysSinceReminder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isOverdue = daysSinceReminder > 0;
                  
                  return (
                    <tr key={possibleReturn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            isOverdue ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {possibleReturn.paciente_nome}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {possibleReturn.paciente_telefone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{possibleReturn.procedimento}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(possibleReturn.data_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {calculateReminderDate(possibleReturn.data_retorno, possibleReturn.observacoes)}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                            {daysSinceReminder} dias atrasado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {isOverdue ? 'Atrasado' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" icon={Phone}>
                            Ligar
                          </Button>
                          <Button variant="outline" size="sm" icon={MessageSquare}>
                            WhatsApp
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm" 
                            icon={Calendar}
                            onClick={() => handleMarcarConsulta(possibleReturn)}
                          >
                            Marcar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lista de Retornos Confirmados */}
      {activeTab === 'confirmed' && (
        <Card title="Retornos Confirmados" subtitle={`${returnsList.length} retornos na lista`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Retorno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returnsList.map((returnVisit) => (
                <tr key={returnVisit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {returnVisit.paciente_nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {returnVisit.paciente_telefone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{returnVisit.procedimento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(returnVisit.data_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {returnVisit.hora_retorno}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={returnVisit.status} type="return" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReagendar(returnVisit)}
                      >
                        Reagendar
                      </Button>
                      <Button variant="outline" size="sm" icon={Phone}>
                        Ligar
                      </Button>
                      {returnVisit.status === 'pendente' && (
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleConfirmReturn(returnVisit.id)}
                        >
                          Confirmar
                        </Button>
                      )}
                      {returnVisit.status === 'confirmado' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleCompleteReturn(returnVisit.id)}
                        >
                          Realizar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {/* Lista de Retornos Realizados (Histórico) */}
      {activeTab === 'completed' && (
        <Card title="Histórico de Retornos" subtitle={`${completedReturns.length} retornos realizados`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Procedimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Realizada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {completedReturns.map((returnVisit) => (
                  <tr key={returnVisit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {returnVisit.paciente_nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {returnVisit.paciente_telefone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{returnVisit.procedimento}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(returnVisit.data_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {returnVisit.hora_retorno}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        Realizado
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" icon={Phone}>
                          Ligar
                        </Button>
                        <Button variant="outline" size="sm" icon={MessageSquare}>
                          WhatsApp
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lista de Retornos Atrasados */}
      {activeTab === 'overdue' && (
        <Card title="Retornos Atrasados" subtitle={`${overdueReturns.length} retornos que passaram da data/hora`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Procedimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data/Hora Agendada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atraso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {overdueReturns.map((returnVisit) => {
                  const returnDateTime = new Date(`${returnVisit.data_retorno}T${returnVisit.hora_retorno || '00:00:00'}`);
                  const now = new Date();
                  const diffTime = now.getTime() - returnDateTime.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                  
                  return (
                    <tr key={returnVisit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {returnVisit.paciente_nome}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {returnVisit.paciente_telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{returnVisit.procedimento}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(returnVisit.data_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {returnVisit.hora_retorno}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {diffDays > 1 ? `${diffDays} dias` : `${diffHours} horas`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          atrasado
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                          Atrasado
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReagendar(returnVisit)}
                          >
                            Reagendar
                          </Button>
                          <Button variant="outline" size="sm" icon={Phone}>
                            Ligar
                          </Button>
                          <Button variant="outline" size="sm" icon={MessageSquare}>
                            WhatsApp
                          </Button>
                          {returnVisit.status === 'pendente' && (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleConfirmReturn(returnVisit.id)}
                            >
                              Confirmar
                            </Button>
                          )}
                          {returnVisit.status === 'confirmado' && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleCompleteReturn(returnVisit.id)}
                            >
                              Realizar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      
      <NewReturnModal
        isOpen={showNewReturn}
        onClose={() => setShowNewReturn(false)}
        onSave={handleNewReturn}
      />
      
      {selectedPossibleReturn && (
        <ScheduleAppointmentModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedPossibleReturn(null);
          }}
          patientName={selectedPossibleReturn.paciente_nome}
          patientPhone={selectedPossibleReturn.paciente_telefone}
          procedure={selectedPossibleReturn.procedimento}
          onSave={handleSaveAppointment}
        />
      )}
      
      {selectedReturnToReschedule && (
        <ScheduleAppointmentModal
          isOpen={showReagendarModal}
          onClose={() => {
            setShowReagendarModal(false);
            setSelectedReturnToReschedule(null);
          }}
          patientName={selectedReturnToReschedule.paciente_nome}
          patientPhone={selectedReturnToReschedule.paciente_telefone}
          procedure={selectedReturnToReschedule.procedimento}
          onSave={handleSaveReschedule}
        />
      )}
    </div>
  );
}