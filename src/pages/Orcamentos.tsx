import React, { useState } from 'react';
import { FileText, Plus, DollarSign, Send, Eye, Edit, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import { budgets } from '../data/mockData';

export default function Orcamentos() {
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showViewBudget, setShowViewBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [budgetsList, setBudgetsList] = useState(budgets);

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowViewBudget(true);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowEditBudget(true);
  };

  const handleSendBudget = (budget: any) => {
    // Simular envio do orçamento
    alert(`Orçamento enviado para ${budget.patientName}!\n\nValor: R$ ${budget.total.toFixed(2)}\nStatus: Enviado por WhatsApp`);
    
    // Atualizar status para enviado (em uma aplicação real, seria uma chamada à API)
    setBudgetsList(prev => prev.map(b => 
      b.id === budget.id ? { ...b, status: 'enviado', sentAt: new Date().toISOString() } : b
    ));
  };

  const handleSaveBudget = (budgetData: any) => {
    if (selectedBudget) {
      // Editar orçamento existente
      setBudgetsList(prev => prev.map(b => 
        b.id === selectedBudget.id ? { ...b, ...budgetData, updatedAt: new Date().toISOString() } : b
      ));
    } else {
      // Novo orçamento
      const newBudget = {
        ...budgetData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setBudgetsList(prev => [...prev, newBudget]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie os orçamentos da clínica</p>
        </div>
        <Button icon={Plus} onClick={() => setShowNewBudget(true)}>
          Novo Orçamento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{budgetsList.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgetsList.filter(b => b.status === 'aprovado').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Rascunhos</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgetsList.filter(b => b.status === 'rascunho').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold text-sm">×</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recusados</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgetsList.filter(b => b.status === 'recusado').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showNewBudget && (
        <Card title="Novo Orçamento">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecione um paciente</option>
                  <option value="1">João Santos</option>
                  <option value="2">Maria Oliveira</option>
                  <option value="3">Carlos Pereira</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validade
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Itens do Orçamento</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedimento
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do procedimento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      placeholder="Descrição detalhada"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Unit.
                    </label>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button variant="outline" size="sm">+</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-lg font-semibold">
                Total: R$ 0,00
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowNewBudget(false)}>
                  Cancelar
                </Button>
                <Button variant="secondary">Salvar Rascunho</Button>
                <Button>Finalizar Orçamento</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Orçamentos */}
      <Card title="Orçamentos Criados" subtitle={`${budgetsList.length} orçamentos na lista`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
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
              {budgetsList.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {budget.patientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      R$ {budget.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={budget.status} type="budget" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={Eye}>
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditBudget(budget)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        icon={Send}
                        onClick={() => handleSendBudget(budget)}
                      >
                        Enviar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}