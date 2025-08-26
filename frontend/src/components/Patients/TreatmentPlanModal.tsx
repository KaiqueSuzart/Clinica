import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import StatusBadge from '../UI/StatusBadge';
import { apiService, UpdateSessionData } from '../../services/api';
import EditProcedureModal from './EditProcedureModal';

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: number;
  existingPlan?: any;
  onSave: (planData: any) => void;
  onSessionCompleted?: (sessionData: {
    patientId: number;
    procedure: string;
    tooth?: string;
    date: string;
    description: string;
    sessionNumber: number;
    sessionId: string;
  }) => void;
}

interface Session {
  id: string;
  date: string;
  description: string;
  completed: boolean;
}

interface TreatmentItem {
  id: string;
  procedure: string;
  description: string;
  tooth?: string;
  priority: 'alta' | 'media' | 'baixa';
  estimatedCost: number;
  estimatedSessions: number;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  startDate?: string;
  completionDate?: string;
  notes: string;
  order: number;
  sessions: Session[];
}

export default function TreatmentPlanModal({ 
  isOpen, 
  onClose, 
  patientName, 
  patientId, 
  existingPlan,
  onSave,
  onSessionCompleted
}: TreatmentPlanModalProps) {
  console.log('=== COMPONENTE RENDERIZADO ===');
  console.log('existingPlan:', existingPlan);
  console.log('patientName:', patientName);
  console.log('patientId:', patientId);
  console.log('Tipo do patientId:', typeof patientId);
  console.log('isOpen:', isOpen);
  console.log('Modal está aberto?', isOpen);
  console.log('================================');
  
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customProcedureName, setCustomProcedureName] = useState('');
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showEditProcedure, setShowEditProcedure] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<TreatmentItem | null>(null);
  
  // Novo item
  const [newItem, setNewItem] = useState<Partial<TreatmentItem>>({
    procedure: '',
    description: '',
    tooth: '',
    priority: 'media',
    estimatedCost: 0,
    estimatedSessions: 1,
    status: 'planejado',
    notes: ''
  });

  const procedures = [
    'Limpeza',
    'Restauração',
    'Tratamento de Canal',
    'Extração',
    'Implante',
    'Prótese',
    'Clareamento',
    'Ortodontia',
    'Cirurgia',
    'Periodontia',
    'Outro'
  ];

  const addTreatmentItem = () => {
    if (!newItem.procedure || !newItem.description) return;

    // Usar nome personalizado se "Outro" for selecionado
    const procedureName = newItem.procedure === 'Outro' ? customProcedureName : newItem.procedure;
    if (newItem.procedure === 'Outro' && !customProcedureName.trim()) return;

    const item: TreatmentItem = {
      id: Date.now().toString(),
      procedure: procedureName!,
      description: newItem.description!,
      tooth: newItem.tooth || '',
      priority: newItem.priority!,
      estimatedCost: newItem.estimatedCost!,
      estimatedSessions: newItem.estimatedSessions!,
      status: 'planejado',
      notes: newItem.notes || '',
      order: treatmentItems.length + 1,
      sessions: Array.from({ length: newItem.estimatedSessions! }, (_, i) => {
        const sessionId = `${Date.now()}-session-${i}`;
        console.log('Criando sessão:', sessionId);
        return {
          id: sessionId,
          date: '',
          description: '',
          completed: false
        };
      })
    };

    setTreatmentItems(prev => [...prev, item]);
    setNewItem({
      procedure: '',
      description: '',
      tooth: '',
      priority: 'media',
      estimatedCost: 0,
      estimatedSessions: 1,
      status: 'planejado',
      notes: ''
    });
    setCustomProcedureName('');
    setShowNewItem(false);
  };

  const createNewPlan = () => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      title: 'Novo Plano de Tratamento',
      description: '',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllPlans(prev => [...prev, newPlan]);
    setCurrentPlanId(newPlan.id);
    setPlanTitle(newPlan.title);
    setPlanDescription(newPlan.description);
    setTreatmentItems([]);
    setShowNewItem(false);
    setEditingItem(null);
  };

  const selectPlan = (planId: string) => {
    const plan = allPlans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlanId(planId);
      setPlanTitle(plan.title || '');
      setPlanDescription(plan.description || '');
      setTreatmentItems(plan.items || []);
      setShowNewItem(false);
      setEditingItem(null);
    }
  };

  const loadPatientPlans = async () => {
    console.log('=== loadPatientPlans INICIADA ===');
    console.log('patientId recebido:', patientId);
    console.log('Tipo do patientId:', typeof patientId);
    console.log('==============================');
    
    try {
      console.log('Carregando planos do paciente:', patientId);
      console.log('Chamando apiService.getTreatmentPlansByPatient...');
      const plans = await apiService.getTreatmentPlansByPatient(patientId);
      console.log('Planos carregados da API:', plans);
      
      if (plans && plans.length > 0) {
        console.log(`Encontrados ${plans.length} planos para o paciente`);
        setAllPlans(plans);
        
        // Se não há plano atual selecionado e não há existingPlan, selecionar o mais recente
        if (!currentPlanId && plans.length > 0 && !existingPlan) {
          const latestPlan = plans[0]; // Já ordenados por data no backend
          console.log('Selecionando plano mais recente:', latestPlan);
          setCurrentPlanId(latestPlan.id);
          setPlanTitle(latestPlan.title || '');
          setPlanDescription(latestPlan.description || '');
          setTreatmentItems(latestPlan.items || []);
        }
        
        // Se há existingPlan, verificar se ele está na lista carregada
        if (existingPlan && existingPlan.id) {
          const existingPlanInList = plans.find((p: any) => p.id === existingPlan.id);
          if (existingPlanInList) {
            console.log('🎯 Plano existente encontrado na lista carregada:', existingPlanInList);
            setCurrentPlanId(existingPlanInList.id);
            setPlanTitle(existingPlanInList.title || existingPlan.title || '');
            setPlanDescription(existingPlanInList.description || existingPlan.description || '');
            setTreatmentItems(existingPlanInList.items || existingPlan.items || []);
          }
        }
      } else {
        console.log('Nenhum plano encontrado na API');
        // Se não há planos na API, criar um plano vazio
        const emptyPlan = {
          id: `empty-${Date.now()}`,
          title: 'Novo Plano de Tratamento',
          description: '',
          items: [],
          totalCost: 0,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAllPlans([emptyPlan]);
        setCurrentPlanId(emptyPlan.id);
        setPlanTitle(emptyPlan.title);
        setPlanDescription(emptyPlan.description);
        setTreatmentItems([]);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      // Em caso de erro, criar plano vazio
      const errorPlan = {
        id: `error-${Date.now()}`,
          title: 'Novo Plano de Tratamento',
          description: '',
          items: [],
          totalCost: 0,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAllPlans([errorPlan]);
        setCurrentPlanId(errorPlan.id);
        setPlanTitle(errorPlan.title);
        setPlanDescription(errorPlan.description);
        setTreatmentItems([]);
      }
    };

  // Função para carregar apenas a lista de planos sem sobrescrever o plano atual
  const loadPatientPlansForList = async () => {
    console.log('=== loadPatientPlansForList INICIADA ===');
    console.log('Carregando apenas lista de planos (não sobrescrevendo plano atual)');
    
    try {
      const plans = await apiService.getTreatmentPlansByPatient(patientId);
      if (plans && plans.length > 0) {
        console.log(`Encontrados ${plans.length} planos para a lista`);
        setAllPlans(plans);
      }
    } catch (error) {
      console.error('Erro ao carregar lista de planos:', error);
    }
  };

  // Configurar plano específico quando existingPlan for fornecido (PRIORIDADE ALTA)
  useEffect(() => {
    console.log('=== useEffect existingPlan (PRIORIDADE ALTA) ===');
    console.log('existingPlan:', existingPlan);
    console.log('isOpen:', isOpen);
    
    if (isOpen && existingPlan) {
      console.log('🎯 Configurando plano específico:', existingPlan);
      console.log('📝 Setando título:', existingPlan.title || '');
      console.log('📝 Setando descrição:', existingPlan.description || '');
      console.log('📝 Setando items:', existingPlan.items || []);
      
      setCurrentPlanId(existingPlan.id);
      setPlanTitle(existingPlan.title || '');
      setPlanDescription(existingPlan.description || '');
      setTreatmentItems(existingPlan.items || []);
      
      console.log('✅ Plano específico configurado com:');
      console.log('   - ID:', existingPlan.id);
      console.log('   - Título:', existingPlan.title);
      console.log('   - Descrição:', existingPlan.description);
    }
  }, [isOpen, existingPlan]);

  // Carregar planos quando o modal abrir (PRIORIDADE BAIXA - só se não houver existingPlan)
  useEffect(() => {
    console.log('=== useEffect loadPatientPlans (PRIORIDADE BAIXA) ===');
    console.log('isOpen:', isOpen);
    console.log('patientId:', patientId);
    console.log('existingPlan:', existingPlan);
    console.log('=======================');
    
    if (isOpen && patientId && !existingPlan) {
      console.log('Chamando loadPatientPlans (não há existingPlan)...');
      loadPatientPlans();
    } else if (isOpen && patientId && existingPlan) {
      console.log('Não chamando loadPatientPlans - há existingPlan, carregando apenas para lista...');
      // Carregar apenas para ter a lista completa, mas não sobrescrever o plano atual
      loadPatientPlansForList();
    } else {
      console.log('Não chamando loadPatientPlans - condições não atendidas');
    }
  }, [isOpen, patientId, existingPlan]);

  const saveEditedItem = (itemId: string) => {
    const item = treatmentItems.find(item => item.id === itemId);
    if (!item) return;

    // Atualizar o item com as mudanças
    setTreatmentItems(prev => prev.map(prevItem => 
      prevItem.id === itemId ? { ...prevItem, ...item } : prevItem
    ));
    
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const updateItemStatus = (itemId: string, status: TreatmentItem['status']) => {
    setTreatmentItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, status };
        if (status === 'em_andamento' && !item.startDate) {
          updatedItem.startDate = new Date().toISOString().split('T')[0];
        }
        if (status === 'concluido' && !item.completionDate) {
          updatedItem.completionDate = new Date().toISOString().split('T')[0];
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setTreatmentItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateSession = async (itemId: string, sessionId: string, updates: Partial<Session>) => {
    console.log('updateSession chamada:', { itemId, sessionId, updates });
    
    // SEMPRE atualizar o estado local primeiro para UI responsiva
    setTreatmentItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          sessions: item.sessions.map(session => 
            session.id === sessionId ? { ...session, ...updates } : session
          )
        };

        // Verificar se uma sessão foi marcada como concluída
        if (updates.completed && updates.date && updates.description) {
          const completedSession = updatedItem.sessions.find(s => s.id === sessionId);
          if (completedSession && completedSession.completed && completedSession.date && completedSession.description) {
            const sessionIndex = updatedItem.sessions.findIndex(s => s.id === sessionId);
             
            // Notificar sobre a sessão concluída
            if (onSessionCompleted) {
              onSessionCompleted({
                patientId,
                procedure: updatedItem.procedure,
                tooth: updatedItem.tooth,
                date: completedSession.date,
                description: completedSession.description,
                sessionNumber: sessionIndex + 1,
                sessionId: sessionId // Adicionar o ID da sessão para identificação
              });
            }
          }
        }

        return updatedItem;
      }
      return item;
    }));

    // Se o sessionId é um ID local (contém 'session-'), não fazer chamada para API ainda
    if (sessionId.includes('session-')) {
      console.log('ID de sessão local detectado, atualizando apenas localmente');
      return;
    }

    // Para IDs reais do Supabase, tentar atualizar na API
    try {
      const updateData: UpdateSessionData = {};
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      console.log('Dados para API:', updateData);
      await apiService.updateSession(sessionId, updateData);
      console.log('Sessão atualizada no Supabase com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar sessão no Supabase:', error);
      // Não reverter o estado local - manter a mudança visual
    }
  };

  const getCompletedSessions = (item: TreatmentItem) => {
    return item.sessions.filter(session => session.completed).length;
  };

  const getSessionProgress = (item: TreatmentItem) => {
    if (item.sessions.length === 0) return 0;
    return Math.round((getCompletedSessions(item) / item.sessions.length) * 100);
  };



  const getTotalCost = () => {
    return treatmentItems.reduce((total, item) => total + (item.estimatedCost || 0), 0);
  };

  const getProgress = () => {
    if (treatmentItems.length === 0) return 0;
    const totalSessions = treatmentItems.reduce((total, item) => total + item.sessions.length, 0);
    const completedSessions = treatmentItems.reduce((total, item) => total + getCompletedSessions(item), 0);
    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'baixa': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejado': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'em_andamento': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'concluido': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelado': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚨 === HANDLE SUBMIT CHAMADO! ===');
    console.log('🎯 Evento:', e);
    console.log('🎯 Tipo:', e.type);
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🚀 === INICIANDO SALVAMENTO ===');
      console.log('📝 planTitle:', planTitle);
      console.log('📝 planDescription:', planDescription);
      console.log('🆔 existingPlan?.id:', existingPlan?.id);
      console.log('🆔 currentPlanId:', currentPlanId);
      console.log('🎯 existingPlan completo:', existingPlan);
      
      // Salvar o plano principal primeiro
      const planData = {
        id: existingPlan?.id || currentPlanId || `plan-${Date.now()}`,
        patientId,
        title: planTitle,
        description: planDescription,
        items: treatmentItems.map(item => ({
          ...item,
          // Limpar campos de data vazios ou inválidos
          startDate: item.startDate && item.startDate.trim() !== '' && item.startDate !== 'Invalid Date' ? 
            (() => {
              try {
                const date = new Date(item.startDate);
                return isNaN(date.getTime()) ? undefined : date.toISOString();
              } catch {
                return undefined;
              }
            })() : undefined,
          completionDate: item.completionDate && item.completionDate.trim() !== '' && item.completionDate !== 'Invalid Date' ? 
            (() => {
              try {
                const date = new Date(item.completionDate);
                return isNaN(date.getTime()) ? undefined : date.toISOString();
              } catch {
                return undefined;
              }
            })() : undefined,
          sessions: item.sessions || []
        })),
        totalCost: getTotalCost(),
        progress: getProgress(),
        createdAt: existingPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 Dados do plano para salvar:', {
        existingPlanId: existingPlan?.id,
        currentPlanId,
        finalPlanId: planData.id,
        isEditing: !!existingPlan?.id,
        titleChanged: planTitle !== existingPlan?.title,
        descriptionChanged: planDescription !== existingPlan?.description
      });

      console.log('📦 Dados completos do plano para salvar:', planData);
      console.log('🔍 Detalhes dos itens do plano:');
      planData.items.forEach((item, index) => {
        console.log(`   Item ${index}:`, {
          id: item.id,
          procedure: item.procedure,
          description: item.description,
          tooth: item.tooth,
          priority: item.priority,
          estimatedCost: item.estimatedCost,
          estimatedSessions: item.estimatedSessions,
          status: item.status,
          order: item.order,
          hasDescription: !!(item.description && item.description.trim()),
          descriptionLength: item.description?.length || 0
        });
      });

      // Salvar o plano
      console.log('📡 Chamando onSave...');
      const result = await onSave(planData);
      console.log('✅ onSave retornou:', result);
      console.log('✅ Plano salvo com sucesso!');
      
      // Se onSave não retornou dados, usar os dados locais
      const finalData = (result as any) || planData;

      // Atualizar a lista de planos com o plano atual
      console.log('🔄 Atualizando lista de planos local...');
      console.log('   - ID do plano salvo:', planData.id);
      console.log('   - Dados do plano salvo:', planData);
      
      setAllPlans(prev => {
        console.log('   - Lista atual antes da atualização:', prev);
        const existingIndex = prev.findIndex(p => p.id === planData.id);
        console.log('   - Índice encontrado:', existingIndex);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = planData;
          console.log('   - Lista atualizada (editado):', updated);
          return updated;
        } else {
          const newList = [...prev, planData];
          console.log('   - Lista atualizada (novo):', newList);
          return newList;
        }
      });

      // As sessões são criadas automaticamente no backend após salvar o plano/itens.

      console.log('Salvamento concluído com sucesso!');
      setIsSubmitting(false);
      
      // Verificar se precisamos atualizar os campos locais com o resultado
      console.log('🔄 Verificando se os campos precisam ser atualizados...');
      console.log('   - planTitle atual:', planTitle);
      console.log('   - planDescription atual:', planDescription);
      console.log('   - finalData.title:', finalData?.title);
      console.log('   - finalData.description:', finalData?.description);
      
      // Forçar atualização dos campos se o resultado for diferente
      if (finalData && (finalData.title !== planTitle || finalData.description !== planDescription)) {
        console.log('🔄 Atualizando campos locais com dados do servidor...');
        setPlanTitle(finalData.title || planTitle);
        setPlanDescription(finalData.description || planDescription);
        if (finalData.items) {
          setTreatmentItems(finalData.items);
        }
        console.log('✅ Campos atualizados com:', {
          title: finalData.title,
          description: finalData.description,
          items: finalData.items?.length || 0
        });
      }
      
      // Fechar o modal após salvamento bem-sucedido
      console.log('✅ Salvamento concluído, fechando modal...');
      
      // IMPORTANTE: Não chamar onSave novamente com dados do backend
      // pois isso causaria erro de items undefined na segunda chamada
      console.log('✅ Salvamento já foi feito na primeira chamada do onSave');
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      setIsSubmitting(false);
    }
  };

  const handleEditProcedure = (procedure: TreatmentItem) => {
    setSelectedProcedure(procedure);
    setShowEditProcedure(true);
  };

  const handleSaveProcedure = (procedureId: string, updates: {
    completionDate: string;
    description: string;
    status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  }) => {
    setTreatmentItems(prev => prev.map(item => 
      item.id === procedureId ? { ...item, ...updates } : item
    ));
    
    // Atualizar também na lista de planos
    setAllPlans(prev => prev.map(plan => ({
      ...plan,
      items: plan.items?.map((item: any) => 
        item.id === procedureId ? { ...item, ...updates } : item
      ) || []
    })));
  };

  console.log('=== MODAL CHECK RENDER ===');
  console.log('Verificando se deve renderizar modal...');
  console.log('isOpen:', isOpen);
  console.log('==========================');
  
  if (!isOpen) {
    console.log('Modal NÃO renderizado - isOpen é false');
    return null;
  }
  
  console.log('Modal VAI ser renderizado - isOpen é true');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Plano de Tratamento - {patientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Seletor de Planos */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Histórico de Planos
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {allPlans.length} plano(s) encontrado(s) | Paciente ID: {patientId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última atualização: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={loadPatientPlans}
                    className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    title="Recarregar planos da API"
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      console.log('=== TESTE DE CONEXÃO ===');
                      try {
                        const result = await apiService.getHealth();
                        console.log('Health check:', result);
                      } catch (error) {
                        console.error('Erro no health check:', error);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Testar conexão com API"
                  >
                    🧪
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPlanSelector(!showPlanSelector)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showPlanSelector ? 'Ocultar Lista' : 'Ver Todos'}
                  </button>
                </div>
              </div>
              
                                {(() => {
                                  console.log('=== RENDERIZANDO LISTA DE PLANOS ===');
                                  console.log('showPlanSelector:', showPlanSelector);
                                  console.log('allPlans.length:', allPlans.length);
                                  console.log('allPlans:', allPlans);
                                  console.log('====================================');
                                  return null;
                                })()}
                                
                                {showPlanSelector ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {allPlans.length > 0 ? allPlans.map((plan, index) => (
                        <div
                          key={plan.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            currentPlanId === plan.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => selectPlan(plan.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                  {plan.title || `Plano ${index + 1}`}
                                </h5>
                                {index === 0 && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                                    Mais Recente
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span>{plan.items?.length || 0} procedimentos</span>
                                <span>R$ {(plan.totalCost || 0).toFixed(2)}</span>
                                <span>{plan.progress || 0}% completo</span>
                              </div>
                              {plan.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                  {plan.description}
                                </p>
                              )}
                              {/* Debug info */}
                              <div className="text-xs text-gray-400 mt-1">
                                <span>ID: {plan.id}</span> | 
                                <span>Status: {plan.status}</span>
                              </div>
                            </div>
                            {currentPlanId === plan.id && (
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium ml-2">
                                Ativo
                              </span>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">Nenhum plano encontrado</p>
                          <p className="text-xs">Crie um novo plano para começar</p>
                        </div>
                      )}
                    </div>
                  ) : (
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600">
                  {currentPlanId ? (
                    <>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        {planTitle || 'Plano sem título'}
                      </h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>{treatmentItems.length} procedimentos</span>
                        <span>R$ {getTotalCost().toFixed(2)}</span>
                        <span>{getProgress()}% completo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Carregando planos...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informações Gerais do Plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título do Plano
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Tratamento Completo - Reabilitação Oral"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progresso Atual
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {getProgress()}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição Geral
              </label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Descrição geral do plano de tratamento..."
              />
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {treatmentItems.length}
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Procedimentos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R$ {getTotalCost().toFixed(2)}
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">Custo Total</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {treatmentItems.reduce((total, item) => total + getCompletedSessions(item), 0)}
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-200">Consultas Concluídas</p>
                </div>
              </div>
            </div>

            {/* Lista de Procedimentos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  Procedimentos do Plano
                </h4>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={createNewPlan}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewItem(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Procedimento
                  </button>
                </div>
              </div>

              {/* Novo Item */}
              {showNewItem && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 animate-in slide-in-from-top-4 duration-200">
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Novo Procedimento</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Procedimento
                      </label>
                      <select
                        value={newItem.procedure}
                        onChange={(e) => {
                          setNewItem(prev => ({ ...prev, procedure: e.target.value }));
                          // Limpar nome personalizado se não for "Outro"
                          if (e.target.value !== 'Outro') {
                            setCustomProcedureName('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Selecione...</option>
                        {procedures.map(proc => (
                          <option key={proc} value={proc}>{proc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Campo para nome personalizado quando "Outro" for selecionado */}
                    {newItem.procedure === 'Outro' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nome do Procedimento
                        </label>
                        <input
                          type="text"
                          value={customProcedureName}
                          onChange={(e) => setCustomProcedureName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Digite o nome do procedimento..."
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">
                        Dente
                      </label>
                      <input
                        type="text"
                        value={newItem.tooth}
                        onChange={(e) => setNewItem(prev => ({ ...prev, tooth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: 11, 21-22"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={newItem.priority}
                        onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Custo Estimado
                      </label>
                      <input
                        type="number"
                        value={newItem.estimatedCost || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, estimatedCost: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Consultas Estimadas
                      </label>
                      <input
                        type="number"
                        value={newItem.estimatedSessions || ''}
                        onChange={(e) => setNewItem(prev => ({ ...prev, estimatedSessions: Number(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="1"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Descrição detalhada do procedimento..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewItem(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={addTreatmentItem}
                      disabled={!newItem.procedure || !newItem.description || (newItem.procedure === 'Outro' && !customProcedureName.trim())}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Itens */}
              <div className="space-y-3">
                {treatmentItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            #{item.order}
                          </span>
                          
                          {editingItem === item.id ? (
                            // Modo de edição
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={item.procedure}
                                onChange={(e) => {
                                  setTreatmentItems(prev => prev.map(prevItem => 
                                    prevItem.id === item.id ? { ...prevItem, procedure: e.target.value } : prevItem
                                  ));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                              <input
                                type="text"
                                value={item.tooth || ''}
                                onChange={(e) => {
                                  setTreatmentItems(prev => prev.map(prevItem => 
                                    prevItem.id === item.id ? { ...prevItem, tooth: e.target.value } : prevItem
                                  ));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Dente (ex: 11, 21-22)"
                              />
                              <textarea
                                value={item.description}
                                onChange={(e) => {
                                  setTreatmentItems(prev => prev.map(prevItem => 
                                    prevItem.id === item.id ? { ...prevItem, description: e.target.value } : prevItem
                                  ));
                                }}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  value={item.estimatedCost || ''}
                                  onChange={(e) => {
                                    setTreatmentItems(prev => prev.map(prevItem => 
                                      prevItem.id === item.id ? { ...prevItem, estimatedCost: Number(e.target.value) || 0 } : prevItem
                                    ));
                                  }}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  placeholder="Custo"
                                  min="0"
                                  step="0.01"
                                />
                                <input
                                  type="number"
                                  value={item.estimatedSessions || ''}
                                  onChange={(e) => {
                                    setTreatmentItems(prev => prev.map(prevItem => 
                                      prevItem.id === item.id ? { ...prevItem, estimatedSessions: Number(e.target.value) || 1 } : prevItem
                                    ));
                                  }}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  placeholder="Sessões"
                                  min="1"
                                />
                              </div>
                              <select
                                value={item.priority}
                                onChange={(e) => {
                                  setTreatmentItems(prev => prev.map(prevItem => 
                                    prevItem.id === item.id ? { ...prevItem, priority: e.target.value as any } : prevItem
                                  ));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="alta">Alta</option>
                                <option value="media">Média</option>
                                <option value="baixa">Baixa</option>
                              </select>
                            </div>
                          ) : (
                            // Modo de visualização
                            <>
                              <h5 
                                className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => handleEditProcedure(item)}
                                title="Clique para editar este procedimento"
                              >
                                {item.procedure}
                                {item.tooth && <span className="text-blue-600 dark:text-blue-400"> - Dente {item.tooth}</span>}
                              </h5>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </>
                          )}
                          
                          {editingItem !== item.id && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>R$ {(item.estimatedCost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{getCompletedSessions(item)}/{item.estimatedSessions || 0} consultas</span>
                            </div>
                          </div>
                        </div>

                        {/* Barra de progresso das consultas */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progresso das Consultas</span>
                            <span>{getSessionProgress(item)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getSessionProgress(item)}%` }}
                            />
                          </div>
                        </div>

                        {/* Lista de Consultas */}
                        <div className="mt-3 space-y-2">
                          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Consultas:</h6>
                          {item.sessions.map((session, sessionIndex) => {
                            console.log('Renderizando sessão:', { session, sessionIndex, itemId: item.id });
                            return (
                            <div key={session.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                              <input
                                type="checkbox"
                                checked={session.completed}
                                onChange={(e) => updateSession(item.id, session.id, { completed: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Consulta {sessionIndex + 1}
                              </span>
                              <input
                                type="date"
                                value={session.date || ''}
                                onChange={(e) => updateSession(item.id, session.id, { date: e.target.value })}
                                className="text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Data"
                              />
                              <input
                                type="text"
                                value={session.description || ''}
                                onChange={(e) => updateSession(item.id, session.id, { description: e.target.value })}
                                className="flex-1 text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Descrição do que foi feito..."
                              />
                            </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {editingItem === item.id ? (
                          // Botões de edição
                          <>
                            <button
                              type="button"
                              onClick={() => saveEditedItem(item.id)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          // Botões de visualização
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingItem(item.id)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Editar
                            </button>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <StatusBadge status={item.status} />
                            </div>
                            
                            <select
                              value={item.status}
                              onChange={(e) => updateItemStatus(item.id, e.target.value as any)}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="planejado">Planejado</option>
                              <option value="em_andamento">Em Andamento</option>
                              <option value="concluido">Concluído</option>
                              <option value="cancelado">Cancelado</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {treatmentItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Nenhum procedimento adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar Procedimento" para começar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
            
            <div className="flex space-x-3">
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                disabled={!planTitle || treatmentItems.length === 0}
                icon={Save}
                onClick={() => console.log('🔘 Botão Salvar Plano clicado!')}
              >
                Salvar Plano
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Edição de Procedimento */}
      {selectedProcedure && (
        <EditProcedureModal
          isOpen={showEditProcedure}
          onClose={() => {
            setShowEditProcedure(false);
            setSelectedProcedure(null);
          }}
          onSave={handleSaveProcedure}
          procedure={selectedProcedure}
        />
      )}
    </div>
  );
}