import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, FileText, Search, CheckCircle2, Clock, Receipt } from 'lucide-react';
import Button from '../UI/Button';
import { apiService, CreatePaymentData, PaymentMethod, Patient, Appointment } from '../../services/api';
import { formatPhoneDisplay } from '../../utils/phoneFormatter';

interface PendingItem {
  id: string;
  type: 'consulta' | 'orcamento' | 'plano_tratamento';
  description: string;
  value: number;
  date: string;
  status?: string;
  originalData?: any;
}

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePaymentData) => Promise<void>;
  appointment?: Appointment | null;
  patientId?: number;
}

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  onSave,
  appointment,
  patientId
}: RegisterPaymentModalProps) {
  const [formData, setFormData] = useState<CreatePaymentData>({
    paciente_id: patientId?.toString() || appointment?.patientId || '',
    valor: appointment?.valor || 0,
    forma_pagamento: 'pix',
    data_pagamento: new Date().toISOString().split('T')[0],
    descricao: appointment?.procedure || '',
    observacoes: '',
    confirmado: true,
    consulta_id: appointment?.id,
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PendingItem | null>(null);
  const [parcelas, setParcelas] = useState<number>(1);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      if (appointment) {
        setFormData(prev => ({
          ...prev,
          paciente_id: appointment.patientId,
          valor: appointment.valor || 0,
          descricao: appointment.procedure,
          consulta_id: appointment.id,
        }));
        // Buscar paciente para mostrar nome
        loadPatientById(appointment.patientId);
      } else if (patientId) {
        loadPatientById(patientId.toString());
      }
    } else {
      // Reset ao fechar
      setFormData({
        paciente_id: '',
        valor: 0,
        forma_pagamento: 'pix',
        data_pagamento: new Date().toISOString().split('T')[0],
        descricao: '',
        observacoes: '',
        confirmado: true,
      });
      setSelectedPatient(null);
      setSelectedItem(null);
      setPendingItems([]);
      setSearchTerm('');
      setShowPatientSearch(false);
      setSelectedProcedures([]);
      setParcelas(1);
    }
  }, [isOpen, appointment, patientId]);

  useEffect(() => {
    // Filtrar pacientes conforme busca
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients.slice(0, 10)); // Mostrar apenas 10 primeiros quando não há busca
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = patients.filter(p => 
        p.nome?.toLowerCase().includes(term) ||
        p.telefone?.includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.cpf?.includes(term)
      ).slice(0, 10);
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  useEffect(() => {
    // Quando paciente é selecionado, buscar itens pendentes e procedimentos
    if (selectedPatient && !appointment) {
      loadPendingItems(selectedPatient.id.toString());
      loadProcedures();
    }
  }, [selectedPatient, appointment]);

  useEffect(() => {
    // Quando selecionar uma consulta, carregar procedimentos relacionados
    if (selectedItem?.type === 'consulta' && selectedItem.originalData) {
      // O procedimento já vem na consulta, mas podemos buscar procedimentos adicionais
      loadProcedures();
    }
  }, [selectedItem]);

  const loadPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
      setFilteredPatients(data.slice(0, 10));
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  const loadPatientById = async (id: string) => {
    try {
      const patient = patients.find(p => p.id.toString() === id);
      if (patient) {
        setSelectedPatient(patient);
      } else {
        // Se não encontrou na lista, buscar individualmente
        const allPatients = await apiService.getPatients();
        const found = allPatients.find(p => p.id.toString() === id);
        if (found) {
          setSelectedPatient(found);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar paciente:', err);
    }
  };

  const loadProcedures = async () => {
    try {
      const response = await apiService.getProcedures(undefined, true);
      if (response.success && response.data) {
        setProcedures(response.data.filter((p: any) => p.ativo !== false));
      }
    } catch (err) {
      console.error('Erro ao carregar procedimentos:', err);
    }
  };

  const loadPendingItems = async (patientId: string) => {
    setLoadingItems(true);
    try {
      const items: PendingItem[] = [];
      console.log('[RegisterPaymentModal] Buscando itens pendentes para paciente:', patientId);

      // Normalizar patientId para comparação (pode ser string ou number)
      const patientIdStr = String(patientId);
      const patientIdNum = Number(patientId);

      // Buscar consultas não pagas
      try {
        let appointments: any[] = [];
        
        // Tentar buscar por endpoint específico primeiro
        try {
          console.log('[RegisterPaymentModal] Tentando buscar consultas via endpoint específico:', `/appointments/patient/${patientIdStr}`);
          const response = await apiService.request(`/appointments/patient/${patientIdStr}`);
          console.log('[RegisterPaymentModal] Resposta do endpoint:', response);
          
          // O backend retorna dados brutos, precisamos mapear
          if (Array.isArray(response)) {
            appointments = response.map((consulta: any) => {
              // Buscar dados do paciente se não vierem no response
              return {
                id: consulta.id,
                patientId: consulta.cliente_id,
                patientName: consulta.patientName || `Paciente ${consulta.cliente_id}`,
                patientPhone: consulta.patientPhone || '',
                date: consulta.data_consulta,
                time: consulta.hora_inicio,
                duration: consulta.duracao_minutos || 60,
                procedure: consulta.procedimento,
                professional: consulta.dentista_id || '',
                status: consulta.status || 'pendente',
                notes: consulta.observacoes,
                valor: consulta.valor || null,
                pago: consulta.pago || false
              };
            });
          } else {
            appointments = [];
          }
          console.log('[RegisterPaymentModal] Consultas mapeadas do endpoint específico:', appointments.length);
        } catch (err: any) {
          console.log('[RegisterPaymentModal] Endpoint específico não disponível ou erro:', err?.message);
          // Se não houver, buscar todas e filtrar
          console.log('[RegisterPaymentModal] Buscando todas as consultas e filtrando...');
          const allAppointments = await apiService.getAllAppointments();
          console.log('[RegisterPaymentModal] Total de consultas encontradas:', allAppointments.length);
          
          appointments = allAppointments.filter(apt => {
            const aptPatientId = String(apt.patientId || '');
            const matches = aptPatientId === patientIdStr || Number(apt.patientId) === patientIdNum;
            console.log('[RegisterPaymentModal] Comparando consulta:', {
              aptPatientId,
              targetPatientId: patientIdStr,
              matches
            });
            return matches;
          });
          console.log('[RegisterPaymentModal] Consultas filtradas para paciente:', appointments.length);
        }
        
        console.log('[RegisterPaymentModal] Total de consultas encontradas para paciente:', appointments.length);
        
        // Log detalhado de cada consulta
        appointments.forEach((apt: any, index: number) => {
          console.log(`[RegisterPaymentModal] Consulta ${index + 1}:`, {
            id: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            status: apt.status,
            pago: apt.pago,
            valor: apt.valor,
            procedure: apt.procedure,
            date: apt.date
          });
        });
        
        // Incluir TODAS as consultas do paciente (realizadas, confirmadas, etc) para poder cobrar
        // Não filtrar apenas por "realizado" - pode querer cobrar consultas confirmadas também
        const unpaidAppointments = appointments.filter((apt: any) => {
          // Verificar se não está pago (ou sem campo pago)
          const isUnpaid = apt.pago === false || apt.pago === undefined || apt.pago === null;
          // Incluir consultas confirmadas ou realizadas (não incluir canceladas)
          const isValidStatus = apt.status === 'confirmado' || apt.status === 'realizado' || apt.status === 'pendente';
          
          console.log('[RegisterPaymentModal] Filtrando consulta:', {
            aptId: apt.id,
            status: apt.status,
            pago: apt.pago,
            isUnpaid,
            isValidStatus,
            passaFiltro: isUnpaid && isValidStatus
          });
          
          // Incluir consultas não pagas com status válido (mesmo sem valor definido)
          return isUnpaid && isValidStatus;
        });
        
        console.log('[RegisterPaymentModal] Consultas não pagas encontradas:', unpaidAppointments.length);
        
        unpaidAppointments.forEach((apt: any) => {
          const procedureName = apt.procedure || apt.procedimento || 'Consulta';
          const date = apt.date || apt.data_consulta;
          const time = apt.time || apt.hora_inicio || '';
          const statusLabel = apt.status === 'confirmado' ? 'Confirmada' : apt.status === 'realizado' ? 'Realizada' : apt.status === 'pendente' ? 'Pendente' : apt.status;
          
          items.push({
            id: apt.id,
            type: 'consulta',
            description: `${procedureName} - ${new Date(date).toLocaleDateString('pt-BR')} ${time} (${statusLabel})`,
            value: apt.valor || 0, // Pode ser 0 se não tiver valor definido ainda
            date: date,
            status: apt.status,
            originalData: apt,
          });
        });
      } catch (err: any) {
        console.error('[RegisterPaymentModal] Erro ao buscar consultas:', err);
        console.error('[RegisterPaymentModal] Stack trace:', err?.stack);
      }

      // Buscar orçamentos aprovados não pagos
      try {
        console.log('[RegisterPaymentModal] Buscando orçamentos para paciente:', patientId);
        const budgets = await apiService.getBudgetsByPatient(patientIdStr);
        console.log('[RegisterPaymentModal] Orçamentos encontrados:', budgets.length);
        
        // Incluir orçamentos aprovados E também rascunhos/enviados que podem ser pagos
        const unpaidBudgets = budgets.filter(budget => {
          const isApproved = budget.status === 'aprovado';
          const isDraftOrSent = budget.status === 'rascunho' || budget.status === 'enviado';
          const hasValue = budget.valor_final > 0;
          
          console.log('[RegisterPaymentModal] Orçamento:', {
            id: budget.id,
            status: budget.status,
            valor_final: budget.valor_final,
            cliente_id: budget.cliente_id,
            isApproved,
            isDraftOrSent,
            hasValue
          });
          
          return (isApproved || isDraftOrSent) && hasValue;
        });
        
        console.log('[RegisterPaymentModal] Orçamentos não pagos encontrados:', unpaidBudgets.length);
        
        unpaidBudgets.forEach(budget => {
          // Calcular valor por parcela se houver parcelas
          const valorParcela = budget.parcelas > 0 ? budget.valor_final / budget.parcelas : budget.valor_final;
          const parcelasInfo = budget.parcelas > 1 ? ` (${budget.parcelas}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcela)})` : '';
          
          items.push({
            id: budget.id,
            type: 'orcamento',
            description: `${budget.descricao || `Orçamento #${budget.id.slice(0, 8)}`}${parcelasInfo}`,
            value: budget.valor_final,
            date: budget.created_at,
            status: budget.status,
            originalData: budget,
          });
        });
      } catch (err) {
        console.error('[RegisterPaymentModal] Erro ao buscar orçamentos:', err);
      }

      // Buscar planos de tratamento (itens não pagos)
      try {
        console.log('[RegisterPaymentModal] Buscando planos de tratamento para paciente:', patientIdNum, '(tipo:', typeof patientIdNum, ')');
        const plans = await apiService.getTreatmentPlansByPatient(patientIdNum);
        console.log('[RegisterPaymentModal] Planos retornados pela API:', plans);
        console.log('[RegisterPaymentModal] É array?', Array.isArray(plans));
        console.log('[RegisterPaymentModal] Quantidade de planos:', plans?.length || 0);
        
        if (!Array.isArray(plans)) {
          console.error('[RegisterPaymentModal] Planos não é um array:', plans);
        } else {
          plans.forEach((plan: any, planIndex: number) => {
            console.log(`[RegisterPaymentModal] Plano ${planIndex + 1}:`, {
              id: plan.id,
              title: plan.title,
              description: plan.description,
              descricao: plan.descricao,
              paciente_id: plan.paciente_id,
              patientId: plan.patientId,
              items: plan.items,
              itemsLength: plan.items?.length || 0,
              status: plan.status,
              totalCost: plan.totalCost,
              custo_total: plan.custo_total
            });
            
            // Verificar se tem items no formato mapeado ou original
            const planItems = plan.items || plan.itens || [];
            
            if (planItems && Array.isArray(planItems) && planItems.length > 0) {
              console.log(`[RegisterPaymentModal] Processando ${planItems.length} itens do plano ${plan.id}`);
              
              planItems.forEach((item: any, itemIndex: number) => {
                // O campo correto é custo_estimado (não valor_total)
                const valorTotal = item.custo_estimado || item.estimatedCost || item.valor_total || item.valor || 0;
                
                console.log(`[RegisterPaymentModal] Item ${itemIndex + 1} do plano ${plan.id}:`, {
                  id: item.id,
                  descricao: item.descricao,
                  description: item.description,
                  procedimento: item.procedimento,
                  procedure: item.procedure,
                  nome: item.nome,
                  custo_estimado: item.custo_estimado,
                  estimatedCost: item.estimatedCost,
                  valor_total: item.valor_total,
                  valorTotalCalculado: valorTotal
                });
                
                // Considerar todos os itens com valor maior que zero
                if (valorTotal > 0) {
                  const itemDescricao = item.descricao || item.description || item.procedimento || item.procedure || item.nome || 'Item';
                  const planDescricao = plan.descricao || plan.description || plan.title || plan.titulo || 'Plano de Tratamento';
                  
                  items.push({
                    id: `${plan.id}-${item.id || itemIndex}`,
                    type: 'plano_tratamento',
                    description: `${planDescricao} - ${itemDescricao}`,
                    value: valorTotal,
                    date: plan.created_at || plan.createdAt || new Date().toISOString(),
                    status: plan.status || 'ativo',
                    originalData: { plan, item },
                  });
                  
                  console.log('[RegisterPaymentModal] Item adicionado:', {
                    id: `${plan.id}-${item.id || itemIndex}`,
                    description: `${planDescricao} - ${itemDescricao}`,
                    value: valorTotal
                  });
                } else {
                  console.log(`[RegisterPaymentModal] Item ${itemIndex + 1} ignorado (sem valor):`, valorTotal);
                }
              });
            } else {
              console.log(`[RegisterPaymentModal] Plano ${plan.id} não tem itens ou itens vazios`);
            }
          });
        }
      } catch (err: any) {
        console.error('[RegisterPaymentModal] Erro ao buscar planos de tratamento:', err);
        console.error('[RegisterPaymentModal] Stack trace:', err?.stack);
        console.error('[RegisterPaymentModal] Mensagem:', err?.message);
      }

      console.log('[RegisterPaymentModal] Total de itens pendentes encontrados:', items.length);

      // Ordenar por data (mais recentes primeiro)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPendingItems(items);
    } catch (err) {
      console.error('[RegisterPaymentModal] Erro ao carregar itens pendentes:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, paciente_id: patient.id.toString() }));
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  const handleItemSelect = (item: PendingItem) => {
    // Se já está selecionado, desselecionar
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
      setSelectedProcedures([]);
      setParcelas(1);
      setFormData(prev => ({
        ...prev,
        valor: 0,
        descricao: '',
        consulta_id: undefined,
        forma_pagamento: 'pix' as PaymentMethod,
      }));
      return;
    }
    
    // Selecionar novo item
    setSelectedItem(item);
    setSelectedProcedures([]); // Reset procedimentos selecionados
    
    // Se for orçamento parcelado, mudar para cartão e configurar parcelas
    let formaPagamento = formData.forma_pagamento;
    let numParcelas = 1;
    
    if (item.type === 'orcamento' && item.originalData?.parcelas > 1) {
      formaPagamento = 'cartao_credito'; // Parcelado geralmente é cartão
      numParcelas = item.originalData.parcelas;
    }
    
    setParcelas(numParcelas);
    
    // Se for consulta, usar o procedimento da consulta como descrição inicial
    let descricao = item.description;
    if (item.type === 'consulta' && item.originalData?.procedure) {
      descricao = item.originalData.procedure;
    }
    
    setFormData(prev => ({
      ...prev,
      valor: item.value || 0, // Pode ser 0 se não tiver valor definido
      descricao: descricao,
      consulta_id: item.type === 'consulta' ? item.id : undefined,
      forma_pagamento: formaPagamento as PaymentMethod,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente_id) {
      newErrors.paciente_id = 'Paciente é obrigatório';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.forma_pagamento) {
      newErrors.forma_pagamento = 'Forma de pagamento é obrigatória';
    }

    if (!formData.data_pagamento) {
      newErrors.data_pagamento = 'Data de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência',
    };
    return labels[method] || method;
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'consulta':
        return <Calendar className="w-4 h-4" />;
      case 'orcamento':
        return <Receipt className="w-4 h-4" />;
      case 'plano_tratamento':
        return <FileText className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'consulta':
        return 'Consulta';
      case 'orcamento':
        return 'Orçamento';
      case 'plano_tratamento':
        return 'Plano de Tratamento';
      default:
        return type;
    }
  };

  // Fechar busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showPatientSearch && !target.closest('.patient-search-container')) {
        setShowPatientSearch(false);
      }
    };

    if (showPatientSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPatientSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registrar Pagamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações da Consulta (se houver) */}
          {appointment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Informações da Consulta
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Paciente:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {appointment.patientName}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Data:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {new Date(appointment.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700 dark:text-blue-300">Procedimento:</span>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {appointment.procedure}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paciente com busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Paciente *
            </label>
            {appointment || patientId ? (
              <input
                type="text"
                value={selectedPatient?.nome || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-900 dark:text-gray-100"
              />
            ) : (
              <div className="relative patient-search-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente por nome, telefone, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowPatientSearch(true);
                    }}
                    onFocus={() => setShowPatientSearch(true)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.paciente_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                
                {/* Lista de pacientes */}
                {showPatientSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.nome}
                          </div>
                          {patient.telefone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPhoneDisplay(patient.telefone)}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Paciente selecionado */}
                {selectedPatient && !showPatientSearch && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedPatient.nome}
                      </div>
                      {selectedPatient.telefone && (
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          {formatPhoneDisplay(selectedPatient.telefone)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setFormData(prev => ({ ...prev, paciente_id: '' }));
                        setPendingItems([]);
                        setSelectedItem(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            {errors.paciente_id && (
              <p className="mt-1 text-sm text-red-600">{errors.paciente_id}</p>
            )}
          </div>

          {/* Itens Pendentes de Pagamento */}
          {selectedPatient && !appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Itens Pendentes de Pagamento
              </label>
              {loadingItems ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Carregando itens pendentes...
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
                  Nenhum item pendente encontrado para este paciente
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className={`w-full p-4 border rounded-lg transition-colors ${
                        selectedItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`mt-1 ${selectedItem?.id === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                            {getItemTypeIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.description}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {getItemTypeLabel(item.type)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(item.date).toLocaleDateString('pt-BR')}
                            </div>
                            {/* Mostrar informações adicionais para orçamentos */}
                            {item.type === 'orcamento' && item.originalData?.parcelas > 1 && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {item.originalData.parcelas}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value / item.originalData.parcelas)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                            </div>
                            {selectedItem?.id === item.id && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 mx-auto" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingItem(item);
                            }}
                            className="ml-2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Ver detalhes"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemSelect(item)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              selectedItem?.id === item.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {selectedItem?.id === item.id ? 'Selecionado' : 'Selecionar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.valor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, forma_pagamento: method });
                    // Se não for cartão, resetar parcelas para 1
                    if (method !== 'cartao_credito' && method !== 'cartao_debito') {
                      setParcelas(1);
                    }
                  }}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    formData.forma_pagamento === method
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {getPaymentMethodLabel(method)}
                </button>
              ))}
            </div>
            {errors.forma_pagamento && (
              <p className="mt-1 text-sm text-red-600">{errors.forma_pagamento}</p>
            )}
          </div>

          {/* Campo de Parcelas (só aparece para cartão) */}
          {(formData.forma_pagamento === 'cartao_credito' || formData.forma_pagamento === 'cartao_debito') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parcelas
              </label>
              <select
                value={parcelas}
                onChange={(e) => {
                  const numParcelas = Number(e.target.value);
                  setParcelas(numParcelas);
                  // Atualizar valor se for orçamento parcelado
                  if (selectedItem?.type === 'orcamento' && selectedItem.originalData?.parcelas > 1) {
                    const valorParcela = selectedItem.value / numParcelas;
                    setFormData(prev => ({ ...prev, valor: valorParcela * numParcelas }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num}x {num > 1 ? `de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.valor / num)}` : ''}
                  </option>
                ))}
              </select>
              {parcelas > 1 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Valor por parcela: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.valor / parcelas)}
                </p>
              )}
            </div>
          )}

          {/* Data de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data de Pagamento *
            </label>
            <input
              type="date"
              value={formData.data_pagamento}
              onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.data_pagamento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.data_pagamento && (
              <p className="mt-1 text-sm text-red-600">{errors.data_pagamento}</p>
            )}
          </div>

          {/* Procedimentos (quando for consulta) */}
          {selectedItem?.type === 'consulta' && procedures.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Procedimentos Realizados
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                {procedures.map((procedure: any) => (
                  <label key={procedure.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProcedures.includes(procedure.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProcedures([...selectedProcedures, procedure.id]);
                          // Adicionar valor do procedimento ao total
                          const valorProcedimento = procedure.preco_estimado || 0;
                          setFormData(prev => ({
                            ...prev,
                            valor: (prev.valor || 0) + valorProcedimento,
                            descricao: prev.descricao 
                              ? `${prev.descricao}, ${procedure.nome}`
                              : procedure.nome
                          }));
                        } else {
                          setSelectedProcedures(selectedProcedures.filter(id => id !== procedure.id));
                          // Remover valor do procedimento do total
                          const valorProcedimento = procedure.preco_estimado || 0;
                          setFormData(prev => ({
                            ...prev,
                            valor: Math.max(0, (prev.valor || 0) - valorProcedimento),
                            descricao: prev.descricao
                              ?.split(', ')
                              .filter(p => p !== procedure.nome)
                              .join(', ') || ''
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {procedure.nome}
                    </span>
                    {procedure.preco_estimado && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(procedure.preco_estimado)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {selectedProcedures.length > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedProcedures.length} procedimento(s) selecionado(s)
                </p>
              )}
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Descrição do Procedimento
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Consulta, Limpeza, Restauração..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações adicionais sobre o pagamento..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Confirmado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="confirmado"
              checked={formData.confirmado}
              onChange={(e) => setFormData({ ...formData, confirmado: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirmado" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Pagamento confirmado
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </form>

        {/* Modal de Visualização de Detalhes */}
        {viewingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingItem(null);
            }
          }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalhes do Item
                </h3>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Tipo e Status */}
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600 dark:text-blue-400">
                    {getItemTypeIcon(viewingItem.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {getItemTypeLabel(viewingItem.type)}
                    </div>
                    {viewingItem.status && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        Status: {viewingItem.status}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descrição
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {viewingItem.description}
                  </p>
                </div>

                {/* Data */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {new Date(viewingItem.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Detalhes específicos por tipo */}
                {viewingItem.type === 'orcamento' && viewingItem.originalData && (
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valor Total
                      </label>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingItem.value)}
                      </p>
                    </div>

                    {viewingItem.originalData.parcelas > 1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Parcelas
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {viewingItem.originalData.parcelas}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingItem.value / viewingItem.originalData.parcelas)}
                        </p>
                      </div>
                    )}

                    {viewingItem.originalData.desconto > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Desconto
                        </label>
                        <p className="mt-1 text-red-600 dark:text-red-400">
                          - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingItem.originalData.desconto)}
                        </p>
                      </div>
                    )}

                    {viewingItem.originalData.itens && viewingItem.originalData.itens.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Itens do Orçamento
                        </label>
                        <div className="space-y-2">
                          {viewingItem.originalData.itens.map((item: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.descricao || `Item ${index + 1}`}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Qtd: {item.quantidade} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unitario)}
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingItem.originalData.data_validade && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Válido até
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {new Date(viewingItem.originalData.data_validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {viewingItem.type === 'consulta' && viewingItem.originalData && (
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Procedimento
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {viewingItem.originalData.procedure || 'Consulta'}
                      </p>
                    </div>

                    {viewingItem.originalData.time && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Horário
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {viewingItem.originalData.time}
                        </p>
                      </div>
                    )}

                    {viewingItem.originalData.professional && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Profissional
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {viewingItem.originalData.professional}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valor
                      </label>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingItem.value)}
                      </p>
                    </div>
                  </div>
                )}

                {viewingItem.type === 'plano_tratamento' && viewingItem.originalData && (
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plano
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {viewingItem.originalData.plan?.descricao || 'Plano de Tratamento'}
                      </p>
                    </div>

                    {viewingItem.originalData.item && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Item do Plano
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {viewingItem.originalData.item.descricao || viewingItem.originalData.item.procedimento || viewingItem.originalData.item.nome || 'Item'}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valor
                      </label>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingItem.value)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewingItem(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleItemSelect(viewingItem);
                      setViewingItem(null);
                    }}
                  >
                    Selecionar este Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
