import React from 'react';
import { useState } from 'react';
import { RotateCcw, Calendar, Clock, Phone } from 'lucide-react';
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

  // Simular possíveis retornos (em uma aplicação real, viria do backend)
  const possibleReturns = [
    {
      id: '3',
      patientName: 'Ana Costa',
      procedure: 'Consulta de rotina',
      scheduledDate: '2024-02-01',
      reminderDate: '2024-01-25',
      daysSinceReminder: 0,
      status: 'pendente_agendamento'
    },
    {
      id: '4',
      patientName: 'Roberto Silva',
      procedure: 'Controle periodontal',
      scheduledDate: '2024-02-05',
      reminderDate: '2024-01-22',
      daysSinceReminder: 3,
      status: 'pendente_agendamento'
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
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{possibleReturns.length}</p>
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

      {/* Lista de Possíveis Retornos */}
      {activeTab === 'possible' && (
        <Card title="Possíveis Retornos" subtitle="Pacientes que precisam agendar retorno">
          <div className="space-y-4">
            {possibleReturns.map((possibleReturn) => (
              <div key={possibleReturn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      possibleReturn.daysSinceReminder > 0 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{possibleReturn.patientName}</h3>
                        {possibleReturn.daysSinceReminder > 0 && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">
                            {possibleReturn.daysSinceReminder} dias atrasado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{possibleReturn.procedure}</span>
                        <span>•</span>
                        <span>Previsto para: {new Date(possibleReturn.scheduledDate).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>Lembrete: {new Date(possibleReturn.reminderDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={Phone}>
                        Ligar
                      </Button>
                      <Button variant="outline" size="sm">
                        WhatsApp
                      </Button>
                      <Button variant="success" size="sm">
                        Marcar Consulta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {possibleReturns.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum retorno pendente
                </h3>
                <p>Todos os pacientes estão com seus retornos em dia!</p>
              </div>
            )}
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