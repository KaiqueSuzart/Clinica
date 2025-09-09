import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Calendar, User, Save, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import { apiService, Patient } from '../../services/api';
import { useToast } from '../UI/Toast';
import { useBusinessHours } from '../../contexts/BusinessHoursContext';

interface NewReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (returnVisit: any) => void;
}

export default function NewReturnModal({ isOpen, onClose, onSave }: NewReturnModalProps) {
  const { showSuccess, showError } = useToast();
  const { isWorkingDay, getAvailableTimeSlots } = useBusinessHours();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [procedure, setProcedure] = useState('');
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [returnTime, setReturnTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [professional, setProfessional] = useState('Dr. Ana Silva');

  const procedures = [
    'Avaliação pós-limpeza',
    'Controle do canal',
    'Remoção de pontos',
    'Avaliação de restauração',
    'Controle pós-cirúrgico',
    'Ajuste de prótese',
    'Controle de implante',
    'Avaliação ortodôntica'
  ];

  // Usar horários disponíveis baseados nas configurações de business hours
  const timeSlots = returnDate ? getAvailableTimeSlots(returnDate) : [];

  const professionals = [
    'Dr. Ana Silva',
    'Dr. Pedro Costa',
    'Dra. Maria Santos'
  ];

  // Carregar pacientes quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      showError('Erro ao carregar lista de pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Recarregar horários quando a data ou profissional mudar
  useEffect(() => {
    if (isOpen && returnDate) {
      loadOccupiedTimes();
      setReturnTime(''); // Limpar seleção quando mudar data/profissional
    }
  }, [returnDate, professional, isOpen]);

  const loadOccupiedTimes = async () => {
    if (!returnDate) return;
    
    try {
      setLoadingTimes(true);
      
      // Formatar data para busca
      const year = returnDate.getFullYear();
      const month = String(returnDate.getMonth() + 1).padStart(2, '0');
      const day = String(returnDate.getDate()).padStart(2, '0');
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

  const isWeekend = (date: Date) => {
    // Usar as configurações de business hours em vez de hardcoded
    return !isWorkingDay(date);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Verificar se um horário está ocupado
  const isTimeSlotOccupied = (time: string) => {
    return occupiedTimes.includes(time);
  };

  // Verificar se um horário está disponível
  const isTimeSlotAvailable = (time: string) => {
    return !isTimeSlotOccupied(time) && returnDate && !isPastDate(returnDate);
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

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const validateForm = () => {
    return selectedPatient && procedure && returnDate && returnTime;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Converter data para string no formato correto
      const year = returnDate.getFullYear();
      const month = String(returnDate.getMonth() + 1).padStart(2, '0');
      const day = String(returnDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const newReturn = {
        cliente_id: selectedPatient,
        data_retorno: formattedDate,
        hora_retorno: returnTime,
        motivo: procedure,
        procedimento: procedure,
        status: 'pendente',
        observacoes: notes
      };

      onSave(newReturn);
      showSuccess('Retorno criado com sucesso!');
      setIsSubmitting(false);
      onClose();
      
      // Reset form
      setSelectedPatient('');
      setProcedure('');
      setReturnDate(null);
      setReturnTime('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao criar retorno:', error);
      showError('Erro ao criar retorno');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <RotateCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Novo Retorno
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Seleção do Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paciente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                  disabled={loadingPatients}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nome} - {patient.telefone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Informações do Paciente Selecionado */}
            {selectedPatientData && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Paciente Selecionado
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Nome:</strong> {selectedPatientData.nome}</p>
                  <p><strong>Telefone:</strong> {selectedPatientData.telefone}</p>
                  {selectedPatientData.Email && <p><strong>Email:</strong> {selectedPatientData.Email}</p>}
                  {selectedPatientData.ultima_visita && (
                    <p><strong>Última Visita:</strong> {new Date(selectedPatientData.ultima_visita).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Calendário para seleção de data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data do Retorno *
              </label>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {/* Cabeçalho do calendário */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendário */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendar().map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                          const isSelected = returnDate && returnDate.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isWeekendDay = isWeekend(date);
                    const isPast = isPastDate(date);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (!isPast && isCurrentMonth) {
                            // Criar uma nova data "limpa" para evitar problemas de referência
                            const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                            setReturnDate(cleanDate);
                          }
                        }}
                        disabled={isPast || !isCurrentMonth}
                        className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : isToday
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : isPast || !isCurrentMonth
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : isWeekendDay
                            ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Horários disponíveis */}
            {returnDate && (
              <div className="animate-in fade-in duration-300">
                <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Horários - {returnDate.toLocaleDateString('pt-BR')} - {professional}
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
                        onClick={() => isAvailable && setReturnTime(time)}
                        disabled={!isAvailable}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                          returnTime === time
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

            {/* Profissional */}
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

            {/* Procedimento/Motivo do Retorno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo do Retorno *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione o motivo do retorno</option>
                  {procedures.map((proc) => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Informações adicionais sobre o retorno..."
              />
            </div>

            {/* Resumo do Retorno */}
            {selectedPatientData && procedure && returnDate && returnTime && (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg animate-in fade-in duration-300">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Resumo do Retorno
                </h5>
                <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  <p><strong>Paciente:</strong> {selectedPatientData.nome}</p>
                  <p><strong>Data do Retorno:</strong> {returnDate.toLocaleDateString('pt-BR')}</p>
                  <p><strong>Hora do Retorno:</strong> {returnTime}</p>
                  <p><strong>Motivo:</strong> {procedure}</p>
                  {notes && <p><strong>Observações:</strong> {notes}</p>}
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 px-6 pb-6">
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
            disabled={!validateForm()}
            icon={Save}
            onClick={handleSubmit}
          >
            Agendar Retorno
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
