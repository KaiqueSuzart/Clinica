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
        {/* Modal de Visualização */}
        {showViewBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Visualizar Orçamento - {selectedBudget.patientName}
                </h3>
                <button
                  onClick={() => setShowViewBudget(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Paciente
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedBudget.patientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Criação
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedBudget.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Válido até
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedBudget.validUntil).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Itens do Orçamento</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Procedimento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Qtd
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Valor Unit.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedBudget.items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.procedure}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              R$ {item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              R$ {item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Total do Orçamento:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {selectedBudget.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={selectedBudget.status} type="budget" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowViewBudget(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Fechar
                  </button>
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => {
                      setShowViewBudget(false);
                      handleEditBudget(selectedBudget);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    icon={Send}
                    onClick={() => {
                      handleSendBudget(selectedBudget);
                      setShowViewBudget(false);
                    }}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Editar Orçamento - {selectedBudget.patientName}
                </h3>
                <button
                  onClick={() => setShowEditBudget(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paciente
                    </label>
                    <input
                      type="text"
                      value={selectedBudget.patientName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Válido até
                    </label>
                    <input
                      type="date"
                      defaultValue={selectedBudget.validUntil}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Itens do Orçamento</h4>
                  
                  {/* Itens existentes */}
                  <div className="space-y-3 mb-4">
                    {selectedBudget.items.map((item: any, index: number) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="col-span-3">
                          <input
                            type="text"
                            defaultValue={item.procedure}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            defaultValue={item.description}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            defaultValue={item.quantity}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            defaultValue={item.unitPrice}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            R$ {item.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <Button variant="danger" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar novo item */}
                  <div className="grid grid-cols-12 gap-3 items-end p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Procedimento
                      </label>
                      <input
                        type="text"
                        placeholder="Nome do procedimento"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        placeholder="Descrição detalhada"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Qtd
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        placeholder="0,00"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button icon={Plus} size="sm">Adicionar</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Total do Orçamento:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {selectedBudget.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditBudget(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <Button variant="secondary">Salvar Rascunho</Button>
                  <Button icon={Save}>Salvar Alterações</Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        icon={Eye}
                        onClick={() => handleViewBudget(budget)}
                      >
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