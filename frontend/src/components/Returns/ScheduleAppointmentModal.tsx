import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService, Appointment } from '../../services/api';
import { useBusinessHours } from '../../contexts/BusinessHoursContext';
import { formatPhoneDisplay } from '../../utils/phoneFormatter';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone: string;
  procedure: string;
  onSave: (appointmentData: any) => void;
}

export default function ScheduleAppointmentModal({ 
  isOpen, 
  onClose, 
  patientName, 
  patientPhone,
  procedure,
  onSave 
}: ScheduleAppointmentModalProps) {
  const { isWorkingDay } = useBusinessHours();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [professional, setProfessional] = useState('Dr. Ana Silva');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const professionals = [
    'Dr. Ana Silva',
    'Dr. Pedro Costa',
    'Dra. Maria Santos'
  ];

  // Carregar consultas existentes quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadExistingAppointments();
    }
  }, [isOpen]);

  // Recarregar horários quando a data ou profissional mudar
  useEffect(() => {
    if (isOpen && selectedDate) {
      loadOccupiedTimes();
      setSelectedTime(''); // Limpar seleção quando mudar data/profissional
    }
  }, [selectedDate, professional, isOpen]);

  // Inicializar com lista vazia de horários ocupados
  useEffect(() => {
    if (isOpen) {
      setOccupiedTimes([]);
    }
  }, [isOpen]);

  const loadExistingAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const appointments = await apiService.getAllAppointments();
      setExistingAppointments(appointments);
    } catch (error) {
      console.error('Erro ao carregar consultas existentes:', error);
    } finally {
      setLoadingAppointments(false);
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
      
      console.log('Verificando horários ocupados para data:', dateStr, 'Profissional:', professional);
      
      // Buscar todas as consultas e retornos da data selecionada
      const [allAppointments, confirmedReturns] = await Promise.all([
        apiService.getAllAppointments(),
        apiService.getConfirmedReturns()
      ]);
      
      // Filtrar consultas do dia selecionado para o profissional específico (excluindo canceladas)
      const dayAppointments = allAppointments.filter(apt => 
        apt.date === dateStr && 
        apt.professional === professional &&
        apt.status !== 'cancelado'
      );
      
      // Filtrar retornos do dia selecionado para o profissional específico (excluindo cancelados)
      const dayReturns = confirmedReturns.filter(ret => 
        ret.data_retorno === dateStr && 
        ret.status !== 'cancelado'
      );
      
      // Função para gerar intervalos ocupados baseado na duração
      const generateOccupiedIntervals = (appointments: any[], isReturn = false) => {
        const intervals: string[] = [];
        
        appointments.forEach(apt => {
          const startTime = isReturn ? (apt.hora_retorno || '09:00') : apt.time;
          const duration = isReturn ? 60 : (apt.duration || 60); // Retornos têm 60min padrão
          
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
      
      // Gerar intervalos ocupados das consultas
      const occupiedAppointments = generateOccupiedIntervals(dayAppointments, false);
      
      // Gerar intervalos ocupados dos retornos
      const occupiedReturns = generateOccupiedIntervals(dayReturns, true);
      
      // Combinar horários ocupados de consultas e retornos
      const allOccupied = [...occupiedAppointments, ...occupiedReturns];
      setOccupiedTimes(allOccupied);
      
      console.log('Horários ocupados encontrados (normalizados):', allOccupied);
      console.log('Consultas do dia para', professional, ':', dayAppointments);
      console.log('Retornos do dia para', professional, ':', dayReturns);
    } catch (error) {
      console.error('Erro ao carregar horários ocupados:', error);
      // Em caso de erro, não mostrar horários ocupados
      setOccupiedTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

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

  // Verificar se um horário está ocupado (usando a mesma lógica da agenda)
  const isTimeSlotOccupied = (time: string) => {
    return occupiedTimes.includes(time);
  };

  // Verificar se um horário está disponível
  const isTimeSlotAvailable = (time: string) => {
    return !isTimeSlotOccupied(time) && !isPastDate(selectedDate);
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
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const appointmentData = {
      id: Date.now().toString(),
      patientName,
      patientPhone,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration,
      procedure,
      professional,
      status: 'confirmado',
      notes,
      isReturnAppointment: true
    };

    onSave(appointmentData);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setSelectedDate(new Date());
    setSelectedTime('');
    setNotes('');
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendar();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Agendar Consulta de Retorno
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
            {/* Informações do Paciente */}
            <div className="lg:col-span-2">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Dados do Retorno
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
                  <div>
                    <strong>Paciente:</strong> {patientName}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {formatPhoneDisplay(patientPhone)}
                  </div>
                  <div>
                    <strong>Procedimento:</strong> {procedure}
                  </div>
                </div>
              </div>
            </div>

            {/* Calendário */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Selecionar Data
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
                    onClick={() => setSelectedDate(date)}
                    disabled={isPastDate(date) || isWeekend(date)}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      isSameDate(date, selectedDate)
                        ? 'bg-blue-600 text-white transform scale-110'
                        : isToday(date)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : isSameMonth(date)
                        ? isPastDate(date) || isWeekend(date)
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
              {selectedDate && (
                <div className="animate-in fade-in duration-300">
                  <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Horários - {selectedDate.toLocaleDateString('pt-BR')} - {professional}
                    {loadingTimes && <span className="ml-2 text-sm text-gray-500">(Carregando...)</span>}
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => {
                      const isOccupied = isTimeSlotOccupied(time);
                      const isAvailable = isTimeSlotAvailable(time);
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => isAvailable && setSelectedTime(time)}
                          disabled={!isAvailable}
                          className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                            selectedTime === time
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transform scale-105'
                              : isOccupied
                              ? 'border-red-200 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 cursor-not-allowed opacity-60'
                              : isAvailable
                              ? 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              : 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {time}
                          {isOccupied && <span className="block text-xs">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Configurações da Consulta */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Configurações da Consulta
              </h4>

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
                  placeholder="Informações adicionais sobre a consulta..."
                />
              </div>

              {/* Resumo da consulta */}
              {selectedDate && selectedTime && (
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                  <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Resumo da Consulta
                  </h5>
                  <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                    <p><strong>Paciente:</strong> {patientName}</p>
                    <p><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Procedimento:</strong> {procedure}</p>
                    <p><strong>Profissional:</strong> {professional}</p>
                    <p><strong>Duração:</strong> {duration} minutos</p>
                  </div>
                </div>
              )}
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
              disabled={!selectedDate || !selectedTime}
              icon={Save}
            >
              Agendar Consulta
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}