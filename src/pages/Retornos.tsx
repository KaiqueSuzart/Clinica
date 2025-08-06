import React from 'react';
import { useState } from 'react';
import { RotateCcw, Calendar, Clock, Phone, CheckCircle, AlertCircle, MessageSquare, User } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewReturnModal from '../components/Returns/NewReturnModal';
import { returnVisits } from '../data/mockData';

export default function Retornos() {
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [returnsList, setReturnsList] = useState(returnVisits);
  const [activeTab, setActiveTab] = useState<'confirmed' | 'possible'>('confirmed');

  const handleNewReturn = (newReturn: any) => {
    setReturnsList(prev => [...prev, newReturn]);
  };

  const handleMarcarConsulta = (possibleReturn: any) => {
    // Simular agendamento da consulta
    console.log('Marcando consulta para:', possibleReturn.patientName);
    
    // Aqui você poderia:
    // 1. Abrir modal de agendamento
    // 2. Redirecionar para página de agenda
    // 3. Marcar como agendado
    
    // Por enquanto, vamos simular que foi marcado
    alert(`Consulta marcada para ${possibleReturn.patientName}!\n\nProcedimento: ${possibleReturn.procedure}\nData prevista: ${new Date(possibleReturn.scheduledDate).toLocaleDateString('pt-BR')}`);
  };

  // Simular possíveis retornos (em uma aplicação real, viria do backend)
  const possibleReturns = [
    {
      id: '3',
      patientPhone: '(11) 99999-1111',
      patientName: 'Ana Costa',
      procedure: 'Consulta de rotina',
      scheduledDate: '2024-02-01',
      reminderDate: '2024-01-25',
      daysSinceReminder: 0,
      status: 'aguardando'
    },
    {
      id: '4',
      patientPhone: '(11) 99999-2222',
      patientName: 'Roberto Silva',
      procedure: 'Controle periodontal',
      scheduledDate: '2024-02-05',
      reminderDate: '2024-01-22',
      daysSinceReminder: 3,
      status: 'atrasado'
    },
    {
      id: '5',
      patientPhone: '(11) 99999-3333',
      patientName: 'Maria Santos',
      procedure: 'Avaliação pós-limpeza',
      scheduledDate: '2024-02-10',
      reminderDate: '2024-01-27',
      daysSinceReminder: -2,
      status: 'aguardando'
    },
    {
      id: '6',
      patientPhone: '(11) 99999-4444',
      patientName: 'Carlos Oliveira',
      procedure: 'Controle do canal',
      scheduledDate: '2024-01-30',
      reminderDate: '2024-01-16',
      daysSinceReminder: 9,
      status: 'atrasado'
    }
  ];

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
                  {possibleReturns.filter(r => r.status === 'aguardando').length}
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
                  {possibleReturns.filter(r => r.daysSinceReminder > 0).length}
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
                  {possibleReturns.filter(r => new Date(r.scheduledDate).getMonth() === new Date().getMonth()).length}
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
                {possibleReturns.map((possibleReturn) => (
                  <tr key={possibleReturn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          possibleReturn.status === 'atrasado' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {possibleReturn.patientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {possibleReturn.patientPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{possibleReturn.procedure}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(possibleReturn.scheduledDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(possibleReturn.reminderDate).toLocaleDateString('pt-BR')}
                      </div>
                      {possibleReturn.daysSinceReminder > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {possibleReturn.daysSinceReminder} dias atrasado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        possibleReturn.status === 'atrasado' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {possibleReturn.status === 'atrasado' ? 'Atrasado' : 'Aguardando'}
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
                ))}
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
                  Data Original
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
                        {returnVisit.patientName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{returnVisit.procedure}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(returnVisit.originalDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(returnVisit.returnDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={returnVisit.status} type="return" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Reagendar
                      </Button>
                      <Button variant="outline" size="sm" icon={Phone}>
                        Ligar
                      </Button>
                      {returnVisit.status === 'pendente' && (
                        <Button variant="success" size="sm">
                          Confirmar
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
      
      <NewReturnModal
        isOpen={showNewReturn}
        onClose={() => setShowNewReturn(false)}
        onSave={handleNewReturn}
      />
    </div>
  );
}