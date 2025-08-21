import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import LoadingButton from '../components/UI/LoadingButton';

export default function AgendaOnline() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const procedures = [
    { id: 'consulta', name: 'Consulta', duration: 30, price: 'R$ 80,00' },
    { id: 'limpeza', name: 'Limpeza', duration: 60, price: 'R$ 120,00' },
    { id: 'restauracao', name: 'Restauração', duration: 90, price: 'R$ 200,00' },
    { id: 'clareamento', name: 'Clareamento', duration: 120, price: 'R$ 400,00' }
  ];

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Agendamento realizado:', {
      date: selectedDate,
      time: selectedTime,
      procedure: selectedProcedure,
      patient: patientData
    });
    
    setIsSubmitting(false);
    setStep(4); // Página de confirmação
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedProcedure('');
    setPatientData({ name: '', phone: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Agende sua Consulta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Smile Care Odontologia - Agendamento Online
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white transform scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <Card title="Escolha o Procedimento" className="animate-in slide-in-from-right duration-300">
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <button
                  key={procedure.id}
                  onClick={() => setSelectedProcedure(procedure.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                    selectedProcedure === procedure.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 transform scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {procedure.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Duração: {procedure.duration} minutos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {procedure.price}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <LoadingButton
                onClick={() => setStep(2)}
                disabled={!selectedProcedure}
              >
                Próximo
              </LoadingButton>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Escolha Data e Horário" className="animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {selectedDate && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário Disponível
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 border rounded-lg text-center transition-all duration-200 hover:shadow-md ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transform scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <LoadingButton
                variant="outline"
                onClick={() => setStep(1)}
              >
                Voltar
              </LoadingButton>
              <LoadingButton
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
              >
                Próximo
              </LoadingButton>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Seus Dados" className="animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={patientData.phone}
                  onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={patientData.email}
                  onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Resumo do Agendamento */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Resumo do Agendamento
              </h4>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Procedimento:</strong> {procedures.find(p => p.id === selectedProcedure)?.name}</p>
                <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> {selectedTime}</p>
                <p><strong>Valor:</strong> {procedures.find(p => p.id === selectedProcedure)?.price}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <LoadingButton
                variant="outline"
                onClick={() => setStep(2)}
              >
                Voltar
              </LoadingButton>
              <LoadingButton
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!patientData.name || !patientData.phone}
              >
                Confirmar Agendamento
              </LoadingButton>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="text-center animate-in zoom-in-95 duration-500">
            <div className="py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Agendamento Confirmado!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Seu agendamento foi realizado com sucesso. Você receberá uma confirmação por WhatsApp.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p><strong>Procedimento:</strong> {procedures.find(p => p.id === selectedProcedure)?.name}</p>
                  <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                  <p><strong>Paciente:</strong> {patientData.name}</p>
                </div>
              </div>
              <LoadingButton onClick={resetForm}>
                Fazer Novo Agendamento
              </LoadingButton>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}