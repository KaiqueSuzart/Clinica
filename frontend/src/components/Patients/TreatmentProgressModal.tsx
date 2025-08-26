import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, CheckCircle, Clock, Activity } from 'lucide-react';
import Button from '../UI/Button';

interface TreatmentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    completedSessions: number;
    sessionDescription: string;
    sessionDate: string;
    currentSession: number;
    selectedProcedures: string[];
  }) => void;
  onSessionCompleted: (sessionData: any) => void;
  plan: {
    id: string;
    title: string;
    description?: string;
    progress?: number;
    totalCost?: number;
    items?: any[];
  };
  patientName: string;
  patientId: number;
}

export default function TreatmentProgressModal({
  isOpen,
  onClose,
  onSave,
  onSessionCompleted,
  plan,
  patientName,
  patientId
}: TreatmentProgressModalProps) {
  const [currentSession, setCurrentSession] = useState(1);
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Calcular total de sessões baseado nos itens do plano
  const totalSessions = plan.items?.reduce((total, item) => total + (item.estimatedSessions || 1), 0) || 0;
  
  // Calcular sessões concluídas baseado nas sessões reais dos itens
  const realCompletedSessions = plan.items?.reduce((total, item) => {
    return total + (item.sessions?.filter(s => s.completed).length || 0);
  }, 0) || 0;
  
  const remainingSessions = totalSessions - realCompletedSessions;
  
  // Calcular progresso baseado na sessão selecionada (não na sessão atual)
  const selectedSessionProgress = Math.round((currentSession / totalSessions) * 100);

  // Função para calcular sessões restantes de um procedimento específico
  const getRemainingSessionsForProcedure = (item: any) => {
    const completedSessions = item.sessions?.filter(s => s.completed).length || 0;
    return Math.max(0, (item.estimatedSessions || 1) - completedSessions);
  };
  
  console.log('📊 Cálculos de sessão:', {
    totalSessions,
    realCompletedSessions,
    remainingSessions,
    planProgress: plan.progress,
    selectedSessionProgress,
    currentSession
  });
  
  // DEBUG: Verificar estrutura dos itens e sessões
  console.log('🔍 DEBUG: Estrutura completa do plano:', plan);
  console.log('🔍 DEBUG: Itens do plano:', plan.items);
  if (plan.items) {
    plan.items.forEach((item, index) => {
      console.log(`🔍 DEBUG: Item ${index}:`, {
        id: item.id,
        procedure: item.procedure,
        estimatedSessions: item.estimatedSessions,
        sessions: item.sessions,
        sessionsLength: item.sessions?.length
      });
    });
  }

  useEffect(() => {
    if (isOpen && plan) {
      // Calcular sessões concluídas baseado nas sessões reais dos itens
      const realCompletedSessions = plan.items?.reduce((total, item) => {
        return total + (item.sessions?.filter(s => s.completed).length || 0);
      }, 0) || 0;
      
      // Definir próxima sessão a ser feita (próxima não concluída)
      const initialSession = realCompletedSessions + 1;
      
      setCurrentSession(initialSession);
      setSessionDescription('');
      setSessionDate(new Date().toISOString().split('T')[0]);
      
      console.log('🔄 Modal aberto:', {
        realCompletedSessions,
        totalSessions,
        initialSession,
        remainingSessions: totalSessions - realCompletedSessions
      });
    }
  }, [isOpen, plan, realCompletedSessions, totalSessions]);

  const handleSave = async () => {
    console.log('💾 Tentando salvar sessão:', {
      sessionDescription: sessionDescription.trim(),
      selectedProcedures,
      currentSession
    });

    if (!sessionDescription.trim()) {
      alert('Por favor, descreva o que foi realizado nesta sessão');
      return;
    }

    if (selectedProcedures.length === 0) {
      alert('Por favor, selecione o procedimento que foi realizado');
      return;
    }

    setIsSaving(true);
    try {
      // Calcular novo progresso baseado na sessão atual
      const newProgress = Math.round((currentSession / totalSessions) * 100);
      
      // PRIMEIRO: Salvar o progresso geral
      await onSave({
        completedSessions: currentSession,
        sessionDescription,
        sessionDate,
        currentSession,
        selectedProcedures
      });
      
      // SEGUNDO: Marcar a sessão específica como concluída
      console.log('🔍 DEBUG: Procurando sessão para marcar como concluída');
      console.log('🔍 DEBUG: selectedProcedures:', selectedProcedures);
      console.log('🔍 DEBUG: plan.items:', plan.items);
      console.log('🔍 DEBUG: currentSession:', currentSession);
      
      // Encontrar o item do procedimento selecionado
      const selectedItem = plan.items?.find(item => 
        selectedProcedures.includes(item.id || `item-${plan.items.indexOf(item)}`)
      );
      
      console.log('🔍 DEBUG: selectedItem encontrado:', selectedItem);
      
      if (selectedItem && selectedItem.sessions) {
        console.log('🔍 DEBUG: selectedItem.sessions:', selectedItem.sessions);
        
        // DEBUG: Verificar estrutura detalhada de cada sessão
        selectedItem.sessions.forEach((session, index) => {
          console.log(`🔍 DEBUG: Sessão ${index}:`, session);
          console.log(`🔍 DEBUG: session.sessionNumber:`, session.sessionNumber);
          console.log(`🔍 DEBUG: session.session_number:`, session.session_number);
        });
        
        // Encontrar a primeira sessão NÃO concluída (próxima a fazer)
        const sessionToComplete = selectedItem.sessions.find(session => 
          !session.completed && (session.sessionNumber === currentSession || session.session_number === currentSession)
        );
        
        console.log('🔍 DEBUG: sessionToComplete encontrada:', sessionToComplete);
        
        if (sessionToComplete) {
          console.log('🔄 Marcando sessão como concluída:', sessionToComplete);
          
          // Chamar onSessionCompleted para marcar a sessão individual
          await onSessionCompleted({
            patientId: patientId,
            sessionId: sessionToComplete.id,
            procedure: selectedItem.procedure,
            sessionNumber: currentSession,
            date: sessionDate,
            description: sessionDescription.trim(),
            tooth: selectedItem.tooth
          });
          
          console.log('✅ onSessionCompleted chamado com sucesso');
        } else {
          console.log('❌ Nenhuma sessão encontrada para o número:', currentSession);
        }
      } else {
        console.log('❌ selectedItem ou sessions não encontrados:', { selectedItem, hasSessions: !!selectedItem?.sessions });
      }
      
      console.log('✅ Sessão salva:', { 
        currentSession, 
        sessionDescription, 
        sessionDate, 
        newProgress: `${newProgress}%`,
        selectedSessionProgress: `${selectedSessionProgress}%`
      });
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      alert('Erro ao salvar sessão. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSessionSelect = (sessionNumber: number) => {
    setCurrentSession(sessionNumber);
  };

  const handleProcedureToggle = (procedureId: string) => {
    console.log('🔄 Selecionando procedimento:', procedureId);
    // Permitir apenas uma seleção por vez (como radio button)
    const newSelection = selectedProcedures.includes(procedureId) ? [] : [procedureId];
    setSelectedProcedures(newSelection);
    console.log('📋 Procedimento selecionado:', newSelection);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Gerenciar Sessões do Tratamento
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {patientName} • {plan.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Resumo do Plano - Mais Compacto */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {plan.items?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Procedimentos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  R$ {(plan.totalCost || 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Custo Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {totalSessions}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total de Sessões</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {remainingSessions}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Restantes</div>
              </div>
            </div>
          </div>

          {/* Seleção de Procedimentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Qual procedimento será realizado nesta sessão? *
            </label>
            <div className="space-y-2">
              {plan.items && plan.items.length > 0 ? plan.items.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => handleProcedureToggle(item.id || `item-${index}`)}
                  className={`
                    p-2 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedProcedures.includes(item.id || `item-${index}`)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.procedure}
                        {item.tooth && (
                          <span className="text-xs text-gray-500 ml-2">(Dente {item.tooth})</span>
                        )}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {getRemainingSessionsForProcedure(item)} sessões restantes
                      </span>
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${selectedProcedures.includes(item.id || `item-${index}`)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {selectedProcedures.includes(item.id || `item-${index}`) && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum procedimento encontrado neste plano
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Selecione o procedimento que será executado nesta sessão
            </div>
          </div>

          {/* Seleção de Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Activity className="w-4 h-4 inline mr-2" />
              Número da Sessão
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {Array.from({ length: totalSessions }, (_, i) => i + 1).map((sessionNum) => (
                <button
                  key={sessionNum}
                  onClick={() => setCurrentSession(sessionNum)}
                  disabled={sessionNum > realCompletedSessions + 1}
                  className={`
                    p-2 rounded border text-sm font-medium transition-all
                    ${sessionNum === currentSession
                      ? 'bg-blue-500 text-white border-blue-500'
                      : sessionNum <= realCompletedSessions
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : sessionNum > realCompletedSessions + 1
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-blue-900/30'
                    }
                  `}
                  title={sessionNum > realCompletedSessions + 1 ? 'Sessões futuras não podem ser selecionadas' : `Sessão ${sessionNum}`}
                >
                  {sessionNum}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {realCompletedSessions} de {totalSessions} sessões concluídas • {remainingSessions} Restantes
            </div>
          </div>

          {/* Data da Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data da Sessão
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Progresso Automático - Mais Compacto */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Progresso: {selectedSessionProgress}%
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Sessão {currentSession}/{totalSessions}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${selectedSessionProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Descrição da Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              O que foi realizado na Sessão {currentSession}? *
            </label>
            <textarea
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder={`Descreva o que foi realizado na sessão ${currentSession}...`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              required
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {sessionDescription.length} caracteres
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !sessionDescription.trim() || selectedProcedures.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Sessão {currentSession}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
