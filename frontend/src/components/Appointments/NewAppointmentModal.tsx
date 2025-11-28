import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService } from '../../services/api';
import { useBusinessHours } from '../../contexts/BusinessHoursContext';
import { formatPhoneDisplay } from '../../utils/phoneFormatter';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
}

export default function NewAppointmentModal({ isOpen, onClose, onSave }: NewAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [procedure, setProcedure] = useState('');
  const [professional, setProfessional] = useState('Dr. Ana Silva');
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [customProcedure, setCustomProcedure] = useState('');
  const [showCustomProcedure, setShowCustomProcedure] = useState(false);
  const [patientProcedures, setPatientProcedures] = useState<string[]>([]);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  const { getAvailableTimeSlots, isWorkingDay } = useBusinessHours();

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

  // Carregar procedimentos do paciente quando um paciente for selecionado
  useEffect(() => {
    if (selectedPatient) {
      loadPatientProcedures(selectedPatient);
      // Encontrar os dados do paciente selecionado
      const patientData = patients.find(p => String(p.id) === String(selectedPatient));
      setSelectedPatientData(patientData);
      console.log('Paciente selecionado:', patientData);
    }
  }, [selectedPatient, patients]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const patientsData = await apiService.getAllPatients();
      console.log('Pacientes carregados:', patientsData);
      console.log('Primeiro paciente:', patientsData[0]);
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      // Dados mock para teste caso o backend não esteja funcionando
      setPatients([
        { id: '1', nome: 'João Santos', telefone: '(11) 99999-9999' },
        { id: '2', nome: 'Maria Oliveira', telefone: '(11) 88888-8888' },
        { id: '3', nome: 'Carlos Pereira', telefone: '(11) 77777-7777' }
      ]);
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
      
      console.log('Verificando horários ocupados para data:', dateStr);
      
      // Buscar todas as consultas da data selecionada
      const allAppointments = await apiService.getAllAppointments();
      
      // Filtrar consultas do dia selecionado (excluindo canceladas)
      const dayAppointments = allAppointments.filter(apt => 
        apt.date === dateStr && apt.status !== 'cancelado'
      );
      
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
      
      console.log('Horários ocupados encontrados (normalizados):', occupied);
      console.log('Consultas do dia:', dayAppointments);
      console.log('Horários originais do banco:', dayAppointments.map(apt => apt.time));
    } catch (error) {
      console.error('Erro ao carregar horários ocupados:', error);
      setOccupiedTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const loadPatientProcedures = async (patientId: string) => {
    try {
      // Buscar histórico de procedimentos do paciente via API específica
      const response = await fetch(`http://localhost:3001/appointments/patient/${patientId}/procedures`);
      if (response.ok) {
        const procedures = await response.json();
        setPatientProcedures(procedures);
      } else {
        setPatientProcedures([]);
      }
    } catch (error) {
      console.error('Erro ao carregar procedimentos do paciente:', error);
      // Dados mock para teste
      setPatientProcedures(['Limpeza', 'Restauração', 'Consulta']);
    }
  };

  // Usar slots de tempo baseados nas configurações de horário de funcionamento para a data selecionada
  const timeSlots = getAvailableTimeSlots(selectedDate);

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

  const professionals = [
    'Dr. Ana Silva',
    'Dr. Pedro Costa',
    'Dra. Maria Santos'
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

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Corrigir problema de fuso horário na data
    const localDate = new Date(selectedDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    console.log('Data selecionada:', selectedDate);
    console.log('Data formatada para envio:', formattedDate);

    const newAppointment = {
      patientId: selectedPatient,
      date: formattedDate,
      time: selectedTime,
      duration,
      procedure,
      professional,
      status: 'pendente'
    };

    onSave(newAppointment);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setSelectedDate(new Date());
    setSelectedTime('');
    setSelectedPatient('');
    setSelectedPatientData(null);
    setProcedure('');
    setCustomProcedure('');
    setShowCustomProcedure(false);
    setPatientProcedures([]);
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendar();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nova Consulta
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
                    onClick={() => {
                      // Criar uma nova data "limpa" para evitar problemas de referência
                      const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      setSelectedDate(cleanDate);
                    }}
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
                    Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}
                  </h5>
                  
                  {selectedDate && !isWorkingDay(selectedDate) && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          A clínica não funciona neste dia da semana. Escolha outro dia.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => {
                      const isOccupied = occupiedTimes.includes(time);
                      const isCurrentTime = selectedTime === time;
                      const isWorkingDaySelected = selectedDate ? isWorkingDay(selectedDate) : true;
                      const isDisabled = isOccupied || !isWorkingDaySelected;
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => !isDisabled && setSelectedTime(time)}
                          disabled={isDisabled}
                          className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                            isCurrentTime
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transform scale-105'
                              : isDisabled
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
              )}
            </div>

            {/* Formulário */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dados da Consulta
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paciente *
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                  disabled={loadingPatients}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  <option value="">
                    {loadingPatients ? 'Carregando pacientes...' : 'Selecione um paciente'}
                  </option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nome || patient.name} - {formatPhoneDisplay(patient.telefone || patient.phone)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Procedimento *
                </label>
                <select
                  value={procedure}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomProcedure(true);
                      setProcedure('');
                    } else {
                      setShowCustomProcedure(false);
                      setProcedure(e.target.value);
                    }
                  }}
                  required={!showCustomProcedure}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione um procedimento</option>
                  
                  {/* Procedimentos padrão */}
                  <optgroup label="Procedimentos Padrão">
                    {procedures.map(proc => (
                      <option key={proc} value={proc}>{proc}</option>
                    ))}
                  </optgroup>
                  
                  {/* Procedimentos do paciente */}
                  {patientProcedures.length > 0 && (
                    <optgroup label="Histórico do Paciente">
                      {patientProcedures.map(proc => (
                        <option key={`patient-${proc}`} value={proc}>
                          {proc} (Já realizado)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Opção para procedimento customizado */}
                  <optgroup label="Outro">
                    <option value="custom">+ Adicionar novo procedimento</option>
                  </optgroup>
                </select>

                {/* Campo para procedimento customizado */}
                {showCustomProcedure && (
                  <div className="mt-3 animate-in fade-in duration-200">
                    <input
                      type="text"
                      placeholder="Digite o nome do procedimento"
                      value={customProcedure}
                      onChange={(e) => {
                        setCustomProcedure(e.target.value);
                        setProcedure(e.target.value);
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomProcedure(false);
                        setCustomProcedure('');
                        setProcedure('');
                      }}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Voltar para lista de procedimentos
                    </button>
                  </div>
                )}
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

              {/* Resumo da consulta */}
              {selectedDate && selectedTime && selectedPatient && procedure && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Resumo da Consulta
                  </h5>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <p><strong>Paciente:</strong> {selectedPatientData?.nome || selectedPatientData?.name || 'Selecione um paciente'}</p>
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
              disabled={!selectedDate || !selectedTime || !selectedPatient || !procedure}
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