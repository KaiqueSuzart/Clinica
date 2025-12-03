import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, ChevronLeft, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService } from '../../services/api';
import { useBusinessHours } from '../../contexts/BusinessHoursContext';
import { formatPhoneDisplay } from '../../utils/phoneFormatter';
import { useDentistas } from '../../hooks/useDentistas';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSave: (appointment: any) => void;
}

export default function EditAppointmentModal({ isOpen, onClose, appointment, onSave }: EditAppointmentModalProps) {
  const { isWorkingDay } = useBusinessHours();
  const { dentistas, getDentistasOptions } = useDentistas();
  
  // Função para criar data segura
  const createSafeDate = (dateString?: string) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const [selectedDate, setSelectedDate] = useState(createSafeDate(appointment?.date));
  const [selectedTime, setSelectedTime] = useState(appointment?.time || '');
  const [selectedPatient, setSelectedPatient] = useState(appointment?.patientId || '');
  const [procedure, setProcedure] = useState(appointment?.procedure || '');
  const [professional, setProfessional] = useState(appointment?.professional || 'Dr. Ana Silva');
  const [duration, setDuration] = useState(appointment?.duration || 60);
  const [status, setStatus] = useState(appointment?.status || 'pendente');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(createSafeDate(appointment?.date));
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Carregar pacientes quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  // Carregar horários ocupados quando a data mudar
  useEffect(() => {
    if (selectedDate) {
      loadOccupiedTimes();
    }
  }, [selectedDate]);

  // Recarregar horários ocupados quando o horário selecionado mudar (para atualizar interface)
  useEffect(() => {
    if (selectedDate && selectedTime) {
      // Aguardar um pouco para evitar muitas chamadas
      const timeoutId = setTimeout(() => {
        loadOccupiedTimes();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTime]);

  // Atualizar dados quando o appointment mudar
  useEffect(() => {
    if (appointment) {
      const localDate = createSafeDate(appointment.date);
      
      console.log('Inicializando modal com appointment.date:', appointment.date);
      console.log('Data local criada:', localDate);
      console.log('Dia da data local:', localDate.getDate());
      
      setSelectedDate(localDate);
      setSelectedTime(appointment.time);
      setSelectedPatient(appointment.patientId);
      setProcedure(appointment.procedure);
      setProfessional(appointment.professional);
      setDuration(appointment.duration);
      setStatus(appointment.status);
      setNotes(appointment.notes || '');
      setCurrentMonth(localDate);
    }
  }, [appointment]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const patientsData = await apiService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadOccupiedTimes = async () => {
    try {
      setLoadingTimes(true);
      
      // Formatar data para busca
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Buscar todas as consultas da data selecionada
      const allAppointments = await apiService.getAllAppointments();
      
      // Filtrar consultas do dia selecionado (excluindo a consulta atual e canceladas)
      const dayAppointments = allAppointments.filter(apt => 
        apt.date === dateStr && 
        apt.id !== appointment?.id &&
        apt.status !== 'cancelado'
      );
      
      console.log('=== DEBUG HORÁRIOS OCUPADOS ===');
      console.log('Consulta sendo editada:', appointment?.id);
      console.log('Horário original da consulta:', appointment?.time);
      console.log('Horário selecionado atual:', selectedTime);
      console.log('Total de consultas do dia:', allAppointments.filter(apt => apt.date === dateStr).length);
      console.log('Consultas filtradas (sem a atual):', dayAppointments.length);
      
      // Função para gerar intervalos ocupados baseado na duração
      const generateOccupiedIntervals = (appointments: any[]) => {
        const intervals: string[] = [];
        
        appointments.forEach(apt => {
          const startTime = apt.time;
          const duration = apt.duration || 60; // Duração padrão de 60 minutos
          
          // Normalizar formato: 09:00:00 -> 09:00
          const normalizedStartTime = startTime.length > 5 ? startTime.substring(0, 5) : startTime;
          
          // Converter para minutos desde meia-noite
          const [hours, minutes] = normalizedStartTime.split(':').map(Number);
          const startMinutes = hours * 60 + minutes;
          const endMinutes = startMinutes + duration;
          
          // Gerar intervalos de 30 minutos ocupados
          for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
            const intervalHours = Math.floor(minutes / 60);
            const intervalMinutes = minutes % 60;
            const intervalTime = `${intervalHours.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
            intervals.push(intervalTime);
          }
        });
        
        return intervals;
      };
      
      // Gerar intervalos ocupados baseado na duração
      const occupied = generateOccupiedIntervals(dayAppointments);
      setOccupiedTimes(occupied);
      
      console.log('Horários ocupados para', dateStr, ':', occupied);
      console.log('Horários originais do banco:', dayAppointments.map(apt => apt.time));
    } catch (error) {
      console.error('Erro ao carregar horários ocupados:', error);
      setOccupiedTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const procedures = [
    'Consulta',
    'Limpeza',
    'Restauração',
    'Tratamento de Canal',
    'Extração',
    'Clareamento',
    'Prótese',
    'Implante'
  ];

  // Usar dentistas do banco de dados
  const professionalsOptions = getDentistasOptions();
  const professionals = professionalsOptions.length > 0 
    ? professionalsOptions.map(d => d.nome)
    : ['Dr. Ana Silva']; // Fallback se não houver dentistas

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'realizado', label: 'Realizado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Função para gerar o calendário
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isWeekend = (date: Date) => {
    // Usar as configurações de business hours em vez de hardcoded
    return !isWorkingDay(date);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug detalhado da data
      console.log('=== DEBUG DATA ===');
      console.log('selectedDate original:', selectedDate);
      console.log('selectedDate toString():', selectedDate.toString());
      console.log('selectedDate getDate():', selectedDate.getDate());
      console.log('selectedDate getMonth():', selectedDate.getMonth());
      console.log('selectedDate getFullYear():', selectedDate.getFullYear());
      
      // Usar uma abordagem mais segura para a data
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      console.log('Data formatada final:', formattedDate);
      console.log('=== FIM DEBUG ===');

      const updatedAppointment = {
        ...appointment,
        date: formattedDate,
        time: selectedTime,
        duration,
        procedure,
        professional,
        status,
        notes
      };

      onSave(updatedAppointment);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const calendarDays = generateCalendar();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Editar Consulta - {appointment.patientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendário */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Alterar Data
              </h4>
              
              {/* Navegação do mês */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h5>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendário */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      // Criar uma nova data "limpa" para evitar problemas de referência
                      const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      console.log('Clicou na data original:', date);
                      console.log('Data limpa criada:', cleanDate);
                      console.log('Data limpa getDate():', cleanDate.getDate());
                      setSelectedDate(cleanDate);
                    }}
                    disabled={isWeekend(date)}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      isSameDate(date, selectedDate)
                        ? 'bg-blue-600 text-white transform scale-110'
                        : isToday(date)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : isSameMonth(date)
                        ? isWeekend(date)
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>

              {/* Horários disponíveis */}
              <div>
                <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Alterar Horário - {selectedDate.toLocaleDateString('pt-BR')}
                </h5>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isOccupied = occupiedTimes.includes(time);
                    const isCurrentTime = selectedTime === time;
                    
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => !isOccupied && setSelectedTime(time)}
                        disabled={isOccupied}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                          isCurrentTime
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transform scale-105'
                            : isOccupied
                            ? 'border-red-200 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 cursor-not-allowed opacity-60'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {time}
                        {isOccupied && (
                          <div className="text-xs mt-1 text-red-500">Ocupado</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {loadingTimes && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Verificando horários disponíveis...
                  </div>
                )}
              </div>
            </div>

            {/* Formulário */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dados da Consulta
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Paciente (não pode ser alterado)
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">{appointment?.patientName}</span>
                  <span className="ml-2 text-gray-500">({formatPhoneDisplay(appointment?.patientPhone)})</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Para alterar o paciente, crie uma nova consulta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Procedimento *
                </label>
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione um procedimento</option>
                  {procedures.map(proc => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profissional
                </label>
                <select
                  value={professional}
                  onChange={(e) => setProfessional(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {professionals.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>

              {/* Campo de Status em destaque */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Status da Consulta
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    console.log('Status alterado para:', e.target.value);
                    // Recarregar horários ocupados quando status mudar
                    if (e.target.value === 'cancelado' || status === 'cancelado') {
                      setTimeout(() => loadOccupiedTimes(), 100);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    status === 'cancelado' 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : status === 'confirmado'
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {status === 'cancelado' && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Horário será liberado automaticamente para outros agendamentos
                  </p>
                )}
                {status === 'confirmado' && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✅ Consulta confirmada
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duração (minutos)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Observações sobre a consulta..."
                />
              </div>

              {/* Resumo da consulta */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Resumo da Consulta
                </h5>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Paciente:</strong> {appointment?.patientName}</p>
                  <p><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                  <p><strong>Procedimento:</strong> {procedure}</p>
                  <p><strong>Profissional:</strong> {professional}</p>
                  <p><strong>Duração:</strong> {duration} minutos</p>
                  <p><strong>Status:</strong> {statusOptions.find(s => s.value === status)?.label}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!selectedDate || !selectedTime || !procedure}
              icon={Save}
            >
              Salvar Alterações
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}