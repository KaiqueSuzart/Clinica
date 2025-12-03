import React, { useState, useEffect } from 'react';
import { FileText, Plus, DollarSign, Send, Eye, Edit, X, Save, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import SuccessModal from '../components/UI/SuccessModal';
import ErrorModal from '../components/UI/ErrorModal';
import SendBudgetModal from '../components/UI/SendBudgetModal';
import ApproveRejectModal from '../components/UI/ApproveRejectModal';
import ConfirmModal from '../components/UI/ConfirmModal';
import { apiService, Budget, CreateBudgetData, Patient, Procedure } from '../services/api';

export default function Orcamentos() {
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showViewBudget, setShowViewBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetsList, setBudgetsList] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'patient' | 'status' | 'value' | 'date'>('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [budgetToSend, setBudgetToSend] = useState<Budget | null>(null);
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [budgetToApproveReject, setBudgetToApproveReject] = useState<Budget | null>(null);
  const [approveRejectAction, setApproveRejectAction] = useState<'approve' | 'reject' | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  
  // Estados para novo orçamento
  const [newBudgetPatient, setNewBudgetPatient] = useState('');
  const [newBudgetValidUntil, setNewBudgetValidUntil] = useState('');
  const [newBudgetItems, setNewBudgetItems] = useState<any[]>([]);
  const [newBudgetParcels, setNewBudgetParcels] = useState(1);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  
  // Estados para novo item
  const [newItemProcedure, setNewItemProcedure] = useState('');
  const [newItemSelectedProcedure, setNewItemSelectedProcedure] = useState<string>(''); // ID do procedimento selecionado
  const [newItemIsCustom, setNewItemIsCustom] = useState(false); // Se está digitando manualmente
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = filterBudgets(budgetsList, searchTerm, searchFilter);
    setFilteredBudgets(filtered);
  }, [budgetsList, searchTerm, searchFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [budgetsData, patientsData, proceduresData] = await Promise.all([
        apiService.getAllBudgets(),
        apiService.getAllPatients(),
        apiService.getProcedures(undefined, true) // Carregar apenas procedimentos ativos
      ]);
      
      // Garantir que budgetsData é um array
      const budgetsArray = Array.isArray(budgetsData) ? budgetsData : [];
      setBudgetsList(budgetsArray);
      setFilteredBudgets(budgetsArray);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      
      // Processar procedimentos
      if (proceduresData && proceduresData.data) {
        const proceduresArray = Array.isArray(proceduresData.data) ? proceduresData.data : [];
        setProcedures(proceduresArray);
      } else {
        setProcedures([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
      // Definir arrays vazios em caso de erro
      setBudgetsList([]);
      setPatients([]);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para quando um procedimento é selecionado
  const handleProcedureSelect = (procedureId: string) => {
    if (procedureId === 'custom') {
      // Modo manual
      setNewItemIsCustom(true);
      setNewItemSelectedProcedure('');
      setNewItemProcedure('');
      setNewItemDescription('');
      setNewItemUnitPrice(0);
    } else if (procedureId) {
      // Procedimento cadastrado selecionado
      const selectedProcedure = procedures.find(p => p.id === procedureId);
      if (selectedProcedure) {
        setNewItemIsCustom(false);
        setNewItemSelectedProcedure(procedureId);
        setNewItemProcedure(selectedProcedure.nome);
        setNewItemDescription(selectedProcedure.descricao || '');
        setNewItemUnitPrice(selectedProcedure.preco_estimado || 0);
      }
    } else {
      // Limpar seleção
      setNewItemIsCustom(false);
      setNewItemSelectedProcedure('');
      setNewItemProcedure('');
      setNewItemDescription('');
      setNewItemUnitPrice(0);
    }
  };

  const addNewItem = () => {
    if (!newItemProcedure.trim()) {
      showError('Preencha o procedimento');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      procedure: newItemProcedure,
      description: newItemDescription || newItemProcedure, // Usar descrição ou o nome do procedimento
      quantity: newItemQuantity,
      unitPrice: newItemUnitPrice,
      total: newItemQuantity * newItemUnitPrice,
      valor_total: newItemQuantity * newItemUnitPrice, // Adicionar também valor_total para compatibilidade
      observacoes: newItemDescription || newItemProcedure, // Usar a descrição como observações
      procedureId: newItemSelectedProcedure || null // ID do procedimento se foi selecionado
    };

    setNewBudgetItems(prev => [...prev, newItem]);
    
    // Reset campos
    setNewItemProcedure('');
    setNewItemSelectedProcedure('');
    setNewItemIsCustom(false);
    setNewItemDescription('');
    setNewItemQuantity(1);
    setNewItemUnitPrice(0);
  };

  const removeItem = (itemId: string) => {
    setNewBudgetItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return newBudgetItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowViewBudget(true);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowEditBudget(true);
  };

  const handleSendBudget = (budget: Budget) => {
    setBudgetToSend(budget);
    setShowSendModal(true);
  };

  const handleConfirmSend = async (method: 'whatsapp' | 'email' | 'copy') => {
    if (!budgetToSend) return;

    try {
      // Atualizar status para "enviado"
      await apiService.updateBudgetStatus(budgetToSend.id, 'enviado');
      
      const methodNames = {
        whatsapp: 'WhatsApp',
        email: 'Email',
        copy: 'Copiado'
      };

      showSuccess(`Orçamento enviado via ${methodNames[method]} para ${budgetToSend.clientelA?.nome}!`);
      await loadData(); // Recarregar dados
      setShowSendModal(false);
      setBudgetToSend(null);
    } catch (err) {
      console.error('Erro ao enviar orçamento:', err);
      showError('Erro ao enviar orçamento. Tente novamente.');
    }
  };

  const handleApproveReject = (budget: Budget, action: 'approve' | 'reject') => {
    setBudgetToApproveReject(budget);
    setApproveRejectAction(action);
    setShowApproveRejectModal(true);
  };

  const handleConfirmApproveReject = async (action: 'approve' | 'reject', reason?: string) => {
    if (!budgetToApproveReject) return;

    try {
      const newStatus = action === 'approve' ? 'aprovado' : 'recusado';
      await apiService.updateBudgetStatus(budgetToApproveReject.id, newStatus);
      
      const actionNames = {
        approve: 'aprovado',
        reject: 'recusado'
      };

      showSuccess(`Orçamento ${actionNames[action]} com sucesso!`);
      await loadData(); // Recarregar dados
      setShowApproveRejectModal(false);
      setBudgetToApproveReject(null);
      setApproveRejectAction(null);
    } catch (err) {
      console.error('Erro ao atualizar status do orçamento:', err);
      showError('Erro ao atualizar orçamento. Tente novamente.');
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    setBudgetToDelete(budget);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;

    try {
      await apiService.deleteBudget(budgetToDelete.id);
      showSuccess('Orçamento excluído com sucesso!');
      await loadData(); // Recarregar dados
      setShowDeleteConfirmModal(false);
      setBudgetToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir orçamento:', err);
      showError('Erro ao excluir orçamento. Tente novamente.');
    }
  };

  const clearNewBudgetForm = () => {
    setNewBudgetPatient('');
    setNewBudgetValidUntil('');
    setNewBudgetItems([]);
    setNewBudgetParcels(1);
    setDiscountType('percentage');
    setDiscountValue(0);
  };

  const handleSaveBudget = async (budgetData: CreateBudgetData) => {
    try {
      if (selectedBudget) {
        // Editar orçamento existente
        await apiService.updateBudget(selectedBudget.id, budgetData);
        showSuccess('Orçamento atualizado com sucesso!');
      } else {
        // Novo orçamento
        await apiService.createBudget(budgetData);
        showSuccess('Orçamento criado com sucesso!');
      }
      await loadData(); // Recarregar dados
      clearNewBudgetForm(); // Limpar formulário
      setShowNewBudget(false);
      setShowEditBudget(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err);
      showError('Erro ao salvar orçamento. Tente novamente.');
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const filterBudgets = (budgets: Budget[], term: string, filter: string) => {
    if (!term.trim()) return budgets;

    return budgets.filter(budget => {
      const searchLower = term.toLowerCase();
      
      switch (filter) {
        case 'patient':
          return budget.clientelA?.nome?.toLowerCase().includes(searchLower) || false;
        
        case 'status':
          return budget.status?.toLowerCase().includes(searchLower) || false;
        
        case 'value':
          const valueStr = budget.valor_final?.toString() || '';
          return valueStr.includes(term) || 
                 budget.valor_total?.toString().includes(term) || false;
        
        case 'date':
          const validDate = new Date(budget.data_validade).toLocaleDateString('pt-BR');
          return validDate.includes(term) || 
                 budget.data_validade?.includes(term) || false;
        
        case 'all':
        default:
          return (
            budget.clientelA?.nome?.toLowerCase().includes(searchLower) ||
            budget.status?.toLowerCase().includes(searchLower) ||
            budget.valor_final?.toString().includes(term) ||
            budget.valor_total?.toString().includes(term) ||
            budget.data_validade?.includes(term) ||
            budget.descricao?.toLowerCase().includes(searchLower) ||
            false
          );
      }
    });
  };

  const updateBudgetTotal = (budget: any) => {
    const valorTotal = (budget.itens_orcamento || []).reduce((sum: number, item: any) => sum + (item.valor_total || 0), 0);
    const desconto = budget.desconto || 0;
    const tipoDesconto = budget.tipo_desconto || 'fixed';
    let valorFinal = valorTotal;
    
    if (desconto > 0) {
      if (tipoDesconto === 'percentage') {
        valorFinal = valorTotal * (1 - desconto / 100);
      } else {
        valorFinal = valorTotal - desconto;
      }
    }
    
    return {
      ...budget,
      valor_total: valorTotal,
      valor_final: valorFinal
    };
  };

  const handleDiscountChange = (field: 'desconto' | 'tipo_desconto', value: string | number) => {
    if (!selectedBudget) return;
    
    const updatedBudget = {
      ...selectedBudget,
      [field]: value
    };
    
    // Atualizar totais
    const budgetWithTotals = updateBudgetTotal(updatedBudget);
    setSelectedBudget(budgetWithTotals);
  };

  const handleAddItemEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir submit do formulário
    e.stopPropagation(); // Parar propagação do evento
    
    // Coletar dados dos campos com ID
    const procedure = (document.getElementById('novo_procedimento_edit') as HTMLInputElement)?.value;
    const description = (document.getElementById('nova_descricao_edit') as HTMLInputElement)?.value;
    const quantity = parseInt((document.getElementById('nova_quantidade_edit') as HTMLInputElement)?.value || '1');
    const unitPrice = parseFloat((document.getElementById('novo_valor_unitario_edit') as HTMLInputElement)?.value || '0');
    
    if (!procedure?.trim() || !description?.trim()) {
      showError('Preencha o procedimento e a descrição');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      descricao: procedure,
      observacoes: description,
      quantidade: quantity,
      valor_unitario: unitPrice,
      valor_total: quantity * unitPrice
    };

    // Adicionar item à lista de itens do orçamento selecionado
    if (selectedBudget) {
      const updatedItems = [...(selectedBudget.itens_orcamento || []), newItem];
      const updatedBudget = {
        ...selectedBudget,
        itens_orcamento: updatedItems
      };
      
      // Atualizar totais
      const budgetWithTotals = updateBudgetTotal(updatedBudget);
      setSelectedBudget(budgetWithTotals);
    }

    // Limpar campos
    const procedureSelect = document.getElementById('novo_procedimento_edit_select') as HTMLSelectElement;
    const procedureInput = document.getElementById('novo_procedimento_edit') as HTMLInputElement;
    const descriptionInput = document.getElementById('nova_descricao_edit') as HTMLInputElement;
    const quantityInput = document.getElementById('nova_quantidade_edit') as HTMLInputElement;
    const unitPriceInput = document.getElementById('novo_valor_unitario_edit') as HTMLInputElement;
    
    if (procedureSelect) procedureSelect.value = '';
    if (procedureInput) {
      procedureInput.value = '';
      procedureInput.style.display = 'none';
      procedureInput.disabled = false;
    }
    if (descriptionInput) {
      descriptionInput.value = '';
      descriptionInput.disabled = false;
    }
    if (quantityInput) quantityInput.value = '1';
    if (unitPriceInput) {
      unitPriceInput.value = '0';
      unitPriceInput.disabled = false;
    }
  };

  const handleSaveEditBudget = async () => {
    try {
      if (!selectedBudget) return;

      // Coletar dados do formulário de edição
      const formData = new FormData(document.querySelector('#edit-budget-form') as HTMLFormElement);
      
      // Usar os valores do estado (que já estão atualizados em tempo real)
      const itens = selectedBudget.itens_orcamento || [];
      const valorTotal = selectedBudget.valor_total || 0;
      const valorFinal = selectedBudget.valor_final || 0;
      const desconto = selectedBudget.desconto || 0;
      const tipoDesconto = selectedBudget.tipo_desconto || 'fixed';
      
      const budgetData: UpdateBudgetData = {
        data_validade: formData.get('data_validade') as string,
        parcelas: parseInt(formData.get('parcelas') as string) || 1,
        desconto: desconto,
        tipo_desconto: tipoDesconto,
        valor_total: valorTotal,
        valor_final: valorFinal,
        itens: itens.map(item => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          observacoes: item.observacoes
        }))
      };

      console.log('Enviando dados para atualização:', budgetData);
      await apiService.updateBudget(selectedBudget.id, budgetData);
      showSuccess('Orçamento atualizado com sucesso!');
      await loadData(); // Recarregar dados
      setShowEditBudget(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      showError('Erro ao atualizar orçamento. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <X className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={loadData}>Tentar novamente</Button>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-gray-900">{filteredBudgets.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBudgets.filter(b => b.status === 'aprovado').length}
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
                {filteredBudgets.filter(b => b.status === 'rascunho').length}
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
                {filteredBudgets.filter(b => b.status === 'recusado').length}
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
                <select 
                  value={newBudgetPatient}
                  onChange={(e) => setNewBudgetPatient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id.toString()}>
                      {patient.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validade
                </label>
                <input
                  type="date"
                  value={newBudgetValidUntil}
                  onChange={(e) => setNewBudgetValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Parcelas
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newBudgetParcels}
                  onChange={(e) => setNewBudgetParcels(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor por Parcela
                </label>
                <input
                  type="text"
                  value={(() => {
                    const total = calculateTotal();
                    const parcelValue = total > 0 && newBudgetParcels > 0 ? total / newBudgetParcels : 0;
                    return `R$ ${parcelValue.toFixed(2)}`;
                  })()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Itens do Orçamento</h4>
              
              {/* Lista de itens adicionados */}
              {newBudgetItems.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-2">
                    {newBudgetItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.descricao || ''}</span>
                            <span className="text-gray-600 dark:text-gray-300">{item.observacoes || item.descricao || ''}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {(item.quantidade || 0)}x R$ {(item.valor_unitario || 0).toFixed(2)}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              R$ {(item.valor_total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Formulário para adicionar novo item */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Procedimento
                    </label>
                    {!newItemIsCustom ? (
                      <select
                        value={newItemSelectedProcedure}
                        onChange={(e) => handleProcedureSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Selecione um procedimento</option>
                        {procedures.map((procedure) => (
                          <option key={procedure.id} value={procedure.id}>
                            {procedure.nome} {procedure.preco_estimado ? `- R$ ${procedure.preco_estimado.toFixed(2)}` : ''}
                          </option>
                        ))}
                        <option value="custom">+ Digitar manualmente</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemProcedure}
                          onChange={(e) => setNewItemProcedure(e.target.value)}
                          placeholder="Nome do procedimento"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewItemIsCustom(false);
                            setNewItemProcedure('');
                            setNewItemSelectedProcedure('');
                            setNewItemDescription('');
                            setNewItemUnitPrice(0);
                          }}
                          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          title="Voltar para seleção"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
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
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor Unit.
                    </label>
                    <input
                      type="number"
                      value={newItemUnitPrice}
                      onChange={(e) => setNewItemUnitPrice(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      disabled={!newItemIsCustom && newItemSelectedProcedure} // Desabilitar se procedimento foi selecionado
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={addNewItem}
                      disabled={!newItemProcedure.trim()}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Sistema de Desconto */}
              {newBudgetItems.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Desconto</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Desconto
                      </label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {discountType === 'percentage' ? 'Percentual' : 'Valor'}
                      </label>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        min="0"
                        max={discountType === 'percentage' ? 100 : undefined}
                        step={discountType === 'percentage' ? 1 : 0.01}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder={discountType === 'percentage' ? '0' : '0,00'}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>Desconto: <span className="text-red-600 dark:text-red-400 font-semibold">
                          -R$ {calculateDiscount().toFixed(2)}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              {newBudgetItems.length > 0 ? (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Subtotal: R$ {calculateSubtotal().toFixed(2)}
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Desconto: -R$ {calculateDiscount().toFixed(2)}
                    </div>
                  )}
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Total: R$ {calculateTotal().toFixed(2)}
                  </div>
                </div>
              ) : (
              <div className="text-lg font-semibold">
                Total: R$ 0,00
              </div>
              )}
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => {
                  clearNewBudgetForm();
                  setShowNewBudget(false);
                }}>
                  Cancelar
                </Button>
                <Button 
                  variant="secondary"
                  disabled={newBudgetItems.length === 0}
                >
                  Salvar Rascunho
                </Button>
                <Button
                  disabled={newBudgetItems.length === 0 || !newBudgetPatient}
                  onClick={() => {
                    const budgetData: CreateBudgetData = {
                      cliente_id: newBudgetPatient,
                      descricao: 'Orçamento criado via sistema',
                      valor_total: calculateSubtotal(),
                      desconto: calculateDiscount(),
                      valor_final: calculateTotal(),
                      status: 'rascunho',
                      data_validade: newBudgetValidUntil,
                      observacoes: 'Orçamento criado via sistema',
                      forma_pagamento: 'a_definir',
                      parcelas: newBudgetParcels,
                      itens: newBudgetItems.map(item => ({
                        descricao: item.procedure, // Usar procedure como descrição principal
                        quantidade: item.quantity,
                        valor_unitario: item.unitPrice,
                        valor_total: item.total,
                        observacoes: item.observacoes || item.description || ''
                      }))
                    };
                    handleSaveBudget(budgetData);
                  }}
                >
                  Finalizar Orçamento
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Orçamentos */}
      <Card title="Orçamentos Criados" subtitle={`${filteredBudgets.length} orçamentos na lista`}>
        {/* Barra de Pesquisa */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar orçamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos os campos</option>
                <option value="patient">Paciente</option>
                <option value="status">Status</option>
                <option value="value">Valor</option>
                <option value="date">Data de validade</option>
              </select>
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchFilter('all');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Modal de Visualização */}
        {showViewBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Visualizar Orçamento - {selectedBudget.clientelA?.nome}
                </h3>
                <button
                  onClick={() => setShowViewBudget(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Paciente
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedBudget.clientelA?.nome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Criação
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedBudget.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Válido até
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedBudget.data_validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parcelas
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedBudget.parcelas || 1}x de R$ {((selectedBudget.valor_final || 0) / (selectedBudget.parcelas || 1)).toFixed(2)}
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
                        {selectedBudget.itens_orcamento?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.descricao}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              {item.observacoes || item.descricao || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {item.quantidade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              R$ {item.valor_unitario.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              R$ {item.valor_total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        Subtotal:
                      </span>
                      <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        R$ {selectedBudget.valor_total?.toFixed(2) || '0,00'}
                      </span>
                    </div>
                    
                    {selectedBudget.desconto && selectedBudget.desconto > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600 dark:text-red-400">
                          Desconto ({selectedBudget.tipo_desconto === 'percentage' ? 
                            `${selectedBudget.desconto}%` : 
                            `R$ ${selectedBudget.desconto.toFixed(2)}`}):
                        </span>
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                          -R$ {selectedBudget.tipo_desconto === 'percentage' 
                            ? ((selectedBudget.valor_total || 0) * (selectedBudget.desconto / 100)).toFixed(2)
                            : selectedBudget.desconto.toFixed(2)
                          }
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                          Total do Orçamento:
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          R$ {selectedBudget.valor_final.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
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
                  Editar Orçamento - {selectedBudget.clientelA?.nome}
                </h3>
                <button
                  onClick={() => setShowEditBudget(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form id="edit-budget-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paciente
                    </label>
                    <input
                      type="text"
                      value={selectedBudget.clientelA?.nome || ''}
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
                      name="data_validade"
                      defaultValue={selectedBudget.data_validade}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Parcelas
                    </label>
                    <input
                      type="number"
                      name="parcelas"
                      min="1"
                      max="60"
                      defaultValue={selectedBudget.parcelas || 1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor por Parcela
                    </label>
                    <input
                      type="text"
                      value={`R$ ${((selectedBudget.valor_final || 0) / (selectedBudget.parcelas || 1)).toFixed(2)}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Itens do Orçamento</h4>
                  
                  {/* Itens existentes */}
                  <div className="space-y-3 mb-4">
                    {selectedBudget.itens_orcamento?.map((item: any, index: number) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="col-span-3">
                          <input
                            type="text"
                            defaultValue={item.descricao || ''}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            defaultValue={item.observacoes || item.descricao || ''}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            defaultValue={item.quantidade || ''}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            defaultValue={item.valor_unitario || ''}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            R$ {(item.valor_total || 0).toFixed(2)}
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

                </div>
                </form>

                {/* Formulário para adicionar novo item (fora do form principal) */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Procedimento
                      </label>
                      <select
                        id="novo_procedimento_edit_select"
                        onChange={(e) => {
                          const procedureId = e.target.value;
                          const procedureInput = document.getElementById('novo_procedimento_edit') as HTMLInputElement;
                          const descriptionInput = document.getElementById('nova_descricao_edit') as HTMLInputElement;
                          const unitPriceInput = document.getElementById('novo_valor_unitario_edit') as HTMLInputElement;
                          
                          if (procedureId === 'custom') {
                            if (procedureInput) {
                              procedureInput.style.display = 'block';
                              procedureInput.value = '';
                              procedureInput.disabled = false;
                            }
                            if (descriptionInput) descriptionInput.disabled = false;
                            if (unitPriceInput) unitPriceInput.disabled = false;
                          } else if (procedureId) {
                            const selectedProcedure = procedures.find(p => p.id === procedureId);
                            if (selectedProcedure) {
                              if (procedureInput) {
                                procedureInput.value = selectedProcedure.nome;
                                procedureInput.style.display = 'block';
                                procedureInput.disabled = true;
                              }
                              if (descriptionInput) {
                                descriptionInput.value = selectedProcedure.descricao || '';
                                descriptionInput.disabled = true;
                              }
                              if (unitPriceInput) {
                                unitPriceInput.value = (selectedProcedure.preco_estimado || 0).toString();
                                unitPriceInput.disabled = true;
                              }
                            }
                          } else {
                            if (procedureInput) {
                              procedureInput.value = '';
                              procedureInput.style.display = 'none';
                            }
                            if (descriptionInput) {
                              descriptionInput.value = '';
                              descriptionInput.disabled = false;
                            }
                            if (unitPriceInput) {
                              unitPriceInput.value = '0';
                              unitPriceInput.disabled = false;
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                      >
                        <option value="">Selecione um procedimento</option>
                        {procedures.map((procedure) => (
                          <option key={procedure.id} value={procedure.id}>
                            {procedure.nome} {procedure.preco_estimado ? `- R$ ${procedure.preco_estimado.toFixed(2)}` : ''}
                          </option>
                        ))}
                        <option value="custom">+ Digitar manualmente</option>
                      </select>
                      <input
                        type="text"
                        id="novo_procedimento_edit"
                        placeholder="Nome do procedimento"
                        style={{ display: 'none' }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        id="nova_descricao_edit"
                        placeholder="Descrição detalhada"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Qtd
                      </label>
                      <input
                        type="number"
                        id="nova_quantidade_edit"
                        placeholder="1"
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        id="novo_valor_unitario_edit"
                        placeholder="0,00"
                        step="0.01"
                        defaultValue="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button type="button" icon={Plus} size="sm" onClick={handleAddItemEdit}>Adicionar</Button>
                    </div>
                  </div>
                </div>

                {/* Seção de Desconto */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Desconto</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Desconto
                      </label>
                      <select
                        name="tipo_desconto"
                        value={selectedBudget.tipo_desconto || 'fixed'}
                        onChange={(e) => handleDiscountChange('tipo_desconto', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valor do Desconto
                      </label>
                      <input
                        type="number"
                        name="valor_desconto"
                        value={selectedBudget.desconto || 0}
                        onChange={(e) => handleDiscountChange('desconto', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Total do Orçamento:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {selectedBudget.valor_final.toFixed(2)}
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
                  <Button icon={Save} onClick={handleSaveEditBudget}>Salvar Alterações</Button>
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
                  Descrição
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
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {budget.clientelA?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {budget.descricao || '-'}
                    </div>
                    {/* Debug: {JSON.stringify(budget.descricao)} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(budget.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(budget.data_validade).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      R$ {budget.valor_final.toFixed(2)}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        icon={Trash2}
                        onClick={() => handleDeleteBudget(budget)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Excluir
                      </Button>
                      {(budget.status === 'enviado' || budget.status === 'rascunho') && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            icon={CheckCircle}
                            onClick={() => handleApproveReject(budget, 'approve')}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            Aprovar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            icon={XCircle}
                            onClick={() => handleApproveReject(budget, 'reject')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Recusar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso!"
        message={successMessage}
        duration={3000}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erro!"
        message={errorMessage}
      />

      {/* Send Budget Modal */}
      <SendBudgetModal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          setBudgetToSend(null);
        }}
        budget={budgetToSend}
        onSend={handleConfirmSend}
      />

      {/* Approve/Reject Modal */}
      <ApproveRejectModal
        isOpen={showApproveRejectModal}
        onClose={() => {
          setShowApproveRejectModal(false);
          setBudgetToApproveReject(null);
          setApproveRejectAction(null);
        }}
        budget={budgetToApproveReject}
        action={approveRejectAction}
        onConfirm={handleConfirmApproveReject}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o orçamento de ${budgetToDelete?.clientelA?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}