import React, { useState } from 'react';
import { X, Plus, Save, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import LoadingButton from '../UI/LoadingButton';
import StatusBadge from '../UI/StatusBadge';
import { apiService, UpdateSessionData } from '../../services/api';

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  existingPlan?: any;
  onSave: (planData: any) => void;
  onSessionCompleted?: (sessionData: {
    patientId: string;
    procedure: string;
    tooth?: string;
    date: string;
    description: string;
    sessionNumber: number;
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
  onSave 
}: TreatmentPlanModalProps) {
  const [planTitle, setPlanTitle] = useState(existingPlan?.title || '');
  const [planDescription, setPlanDescription] = useState(existingPlan?.description || '');
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>(
    existingPlan?.items?.map(item => ({
      ...item,
      sessions: item.sessions || Array.from({ length: item.estimatedSessions }, (_, i) => ({
        id: `${item.id}-session-${i}`,
        date: '',
        description: '',
        completed: false
      }))
    })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [customProcedureName, setCustomProcedureName] = useState('');
  
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
      sessions: Array.from({ length: newItem.estimatedSessions! }, (_, i) => ({
        id: `${Date.now()}-session-${i}`,
        date: '',
        description: '',
        completed: false
      }))
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
    try {
      // Atualizar no Supabase primeiro
      const updateData: UpdateSessionData = {};
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      await apiService.updateSession(sessionId, updateData);

      // Atualizar o estado local
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
                  sessionNumber: sessionIndex + 1
                });
              }
            }
          }

          return updatedItem;
        }
        return item;
      }));
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const getCompletedSessions = (item: TreatmentItem) => {
    return item.sessions.filter(session => session.completed).length;
  };

  const getSessionProgress = (item: TreatmentItem) => {
    if (item.sessions.length === 0) return 0;
    return Math.round((getCompletedSessions(item) / item.sessions.length) * 100);
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    setTreatmentItems(prev => {
      const items = [...prev];
      const index = items.findIndex(item => item.id === itemId);
      
      if (direction === 'up' && index > 0) {
        [items[index], items[index - 1]] = [items[index - 1], items[index]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      
      // Atualizar ordem
      return items.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const getTotalCost = () => {
    return treatmentItems.reduce((total, item) => total + item.estimatedCost, 0);
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
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const planData = {
      id: existingPlan?.id || Date.now().toString(),
      patientId,
      title: planTitle,
      description: planDescription,
      items: treatmentItems.map(item => ({
        ...item,
        sessions: item.sessions || []
      })),
      totalCost: getTotalCost(),
      progress: getProgress(),
      createdAt: existingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(planData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

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
                   <p className="text-sm text-purple-800 dark:text-purple-200">Sessões Concluídas</p>
                 </div>
              </div>
            </div>

            {/* Lista de Procedimentos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  Procedimentos do Plano
                </h4>
                <button
                  type="button"
                  onClick={() => setShowNewItem(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Procedimento
                </button>
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
                        value={newItem.estimatedCost}
                        onChange={(e) => setNewItem(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sessões Estimadas
                      </label>
                      <input
                        type="number"
                        value={newItem.estimatedSessions}
                        onChange={(e) => setNewItem(prev => ({ ...prev, estimatedSessions: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="1"
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
                {treatmentItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            #{item.order}
                          </span>
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.procedure}
                            {item.tooth && <span className="text-blue-600 dark:text-blue-400"> - Dente {item.tooth}</span>}
                          </h5>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
                        
                                                 <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                           <div className="flex items-center space-x-1">
                             <DollarSign className="w-4 h-4" />
                             <span>R$ {item.estimatedCost.toFixed(2)}</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <Calendar className="w-4 h-4" />
                             <span>{getCompletedSessions(item)}/{item.estimatedSessions} sessões</span>
                           </div>
                         </div>

                         {/* Barra de progresso das sessões */}
                         <div className="mt-2">
                           <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                             <span>Progresso das Sessões</span>
                             <span>{getSessionProgress(item)}%</span>
                           </div>
                           <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                             <div 
                               className="bg-green-500 h-2 rounded-full transition-all duration-300"
                               style={{ width: `${getSessionProgress(item)}%` }}
                             />
                           </div>
                         </div>

                         {/* Lista de Sessões */}
                         <div className="mt-3 space-y-2">
                           <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sessões:</h6>
                           {item.sessions.map((session, sessionIndex) => (
                             <div key={session.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                               <input
                                 type="checkbox"
                                 checked={session.completed}
                                 onChange={(e) => updateSession(item.id, session.id, { completed: e.target.checked })}
                                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                               />
                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                 Sessão {sessionIndex + 1}
                               </span>
                               <input
                                 type="date"
                                 value={session.date}
                                 onChange={(e) => updateSession(item.id, session.id, { date: e.target.value })}
                                 className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                 placeholder="Data"
                               />
                               <input
                                 type="text"
                                 value={session.description}
                                 onChange={(e) => updateSession(item.id, session.id, { description: e.target.value })}
                                 className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                 placeholder="Descrição do que foi feito..."
                               />
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
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
              disabled={!planTitle || treatmentItems.length === 0}
              icon={Save}
            >
              Salvar Plano de Tratamento
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}