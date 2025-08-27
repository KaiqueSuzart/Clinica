import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Calendar, Plus, FileText, Upload, Clock, MessageSquare, StickyNote, AlertCircle, Trash2, Edit2, Activity } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewPatientModal from '../components/Patients/NewPatientModal';
import AnamneseModal from '../components/Patients/AnamneseModal';
import EditPatientModal from '../components/Patients/EditPatientModal';
import TreatmentPlanModal from '../components/Patients/TreatmentPlanModal';
import TreatmentProgressModal from '../components/Patients/TreatmentProgressModal';
import ScheduleReturnModal from '../components/Patients/ScheduleReturnModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ConfirmModal from '../components/UI/ConfirmModal';
import { apiService, Patient, CreatePatientData, Annotation } from '../services/api';

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'treatment' | 'timeline' | 'files' | 'notes'>('info');
  const [newNote, setNewNote] = useState('');
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showAnamnese, setShowAnamnese] = useState(false);
  const [selectedAnamnesePatient, setSelectedAnamnesePatient] = useState<number | null>(null);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [selectedEditPatient, setSelectedEditPatient] = useState<Patient | null>(null);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [selectedTreatmentPatient, setSelectedTreatmentPatient] = useState<Patient | null>(null);
  const [showScheduleReturn, setShowScheduleReturn] = useState(false);
  const [selectedReturnPatient, setSelectedReturnPatient] = useState<Patient | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);
  const [treatmentAnnotations, setTreatmentAnnotations] = useState<Annotation[]>([]);
  const [patientTreatmentPlans, setPatientTreatmentPlans] = useState<any[]>([]);
  const [loadingTreatmentPlans, setLoadingTreatmentPlans] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedPlanForProgress, setSelectedPlanForProgress] = useState<any>(null);

  const filteredPatients = patientsList.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.telefone && patient.telefone.includes(searchTerm)) ||
    (patient.Email && patient.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedPatientData = patientsList.find(p => p.id === selectedPatient);

  // Carregar pacientes do banco de dados
  useEffect(() => {
    loadPatients();
  }, []);

  // Carregar anotações e planos quando o paciente selecionado mudar
  useEffect(() => {
    if (selectedPatient) {
      loadAnnotations(selectedPatient);
      loadTreatmentPlans(selectedPatient);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patients = await apiService.getPatients();
      
      // Carregar planos de tratamento para cada paciente
      const patientsWithPlans = await Promise.all(
        patients.map(async (patient) => {
          try {
            const treatmentPlans = await apiService.getTreatmentPlansByPatient(patient.id);
            return {
              ...patient,
              treatmentPlan: treatmentPlans.length > 0 ? treatmentPlans[0] : null
            };
          } catch (err) {
            console.error(`Erro ao carregar planos do paciente ${patient.id}:`, err);
            return patient;
          }
        })
      );
      
      setPatientsList(patientsWithPlans);
      if (patientsWithPlans.length > 0 && !selectedPatient) {
        setSelectedPatient(patientsWithPlans[0].id);
      }
    } catch (err) {
      setError('Erro ao carregar pacientes. Verifique se o backend está rodando.');
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnotations = async (patientId: number) => {
    try {
      setLoadingAnnotations(true);
      const allAnnotations = await apiService.getAnnotations(patientId);
      
      // Filtrar anotações: remover as de categoria 'tratamento' da aba Anotações
      const normalAnnotations = allAnnotations.filter(annotation => annotation.category !== 'tratamento');
      setAnnotations(normalAnnotations);
      
      // Carregar também as anotações de tratamento para a timeline
      const treatmentNotes = await apiService.getAnnotationsByCategory(patientId, 'tratamento');
      
      // Filtrar apenas anotações que realmente são de tratamento (com conteúdo específico)
      const realTreatmentNotes = treatmentNotes.filter(annotation => 
        annotation.content.includes('Sessão') || 
        annotation.content.includes('Progresso') ||
        annotation.content.includes('Procedimentos') ||
        annotation.content.includes('tratamento')
      );
      
      setTreatmentAnnotations(realTreatmentNotes);
      console.log('📝 Anotações normais (sem tratamento):', normalAnnotations);
      console.log('🦷 Anotações de tratamento (filtradas):', realTreatmentNotes);
    } catch (err) {
      console.error('Erro ao carregar anotações:', err);
      // Se não conseguir carregar, usar array vazio
      setAnnotations([]);
      setTreatmentAnnotations([]);
    } finally {
      setLoadingAnnotations(false);
    }
  };

  const loadTreatmentPlans = async (patientId: number) => {
    try {
      setLoadingTreatmentPlans(true);
      const plans = await apiService.getTreatmentPlansByPatient(patientId);
      setPatientTreatmentPlans(plans);
      console.log(`Planos carregados para paciente ${patientId}:`, plans);
    } catch (err) {
      console.error('Erro ao carregar planos de tratamento:', err);
      setPatientTreatmentPlans([]);
    } finally {
      setLoadingTreatmentPlans(false);
    }
  };

  const handleDeleteTreatmentPlan = (planId: string) => {
    setPlanToDelete(planId);
    setShowConfirmDelete(true);
  };

  const confirmDeleteTreatmentPlan = async () => {
    if (!planToDelete || !selectedPatientData) return;
    
    try {
      console.log('Excluindo plano do banco de dados:', planToDelete);
      
      // Chamar a API para excluir do banco de dados
      await apiService.deleteTreatmentPlan(planToDelete);
      
      console.log(`Plano ${planToDelete} excluído com sucesso do banco de dados`);
      
      // Recarregar os planos para atualizar a interface com dados atualizados do BD
      if (selectedPatient) {
        await loadTreatmentPlans(selectedPatient);
      }
      
    } catch (err) {
      console.error('Erro ao excluir plano de tratamento:', err);
      alert('Erro ao excluir plano de tratamento. Tente novamente.');
    } finally {
      setPlanToDelete(null);
      setShowConfirmDelete(false);
    }
  };

  const handleSaveProgress = async (updates: {
    completedSessions: number;
    sessionDescription: string;
    sessionDate: string;
    currentSession: number;
    selectedProcedures: string[];
  }) => {
    if (!selectedPlanForProgress || !selectedPatientData) return;
    
    try {
      console.log('💾 Salvando sessão:', updates);
      
      // Calcular novo progresso baseado na sessão atual
      const totalSessions = selectedPlanForProgress.items?.reduce((total, item) => total + (item.estimatedSessions || 1), 0) || 0;
      const newProgress = Math.round((updates.currentSession / totalSessions) * 100);
      
      // Atualizar o progresso localmente em patientTreatmentPlans
      console.log('🔄 ATUALIZANDO PROGRESSO:', {
        planId: selectedPlanForProgress.id,
        oldProgress: selectedPlanForProgress.progress,
        newProgress: newProgress,
        currentSession: updates.currentSession,
        totalSessions: totalSessions
      });
      
      setPatientTreatmentPlans(prev => {
        const updated = prev.map(plan => 
          plan.id === selectedPlanForProgress.id ? { 
            ...plan, 
            progress: newProgress,
            completedSessions: updates.currentSession 
          } : plan
        );
        console.log('📊 PLANOS ATUALIZADOS:', updated);
        return updated;
      });
      
      // Também atualizar na lista de pacientes se o plano for o mesmo
      setPatientsList(prev => prev.map(patient => {
        if (patient.id === selectedPatientData.id && patient.treatmentPlan && patient.treatmentPlan.id === selectedPlanForProgress.id) {
          return {
            ...patient,
            treatmentPlan: {
              ...patient.treatmentPlan,
              progress: newProgress,
              completedSessions: updates.currentSession
            }
          };
        }
        return patient;
      }));
      
      // Salvar o progresso no banco de dados
      try {
        await apiService.updateTreatmentPlanProgress(selectedPlanForProgress.id, newProgress);
        console.log('💾 Progresso salvo no banco de dados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao salvar progresso no banco:', error);
        // Continuar mesmo com erro na API, pois já salvamos localmente
      }
      
      // Adicionar anotação rica sobre a sessão na timeline
      if (updates.sessionDescription.trim()) {
        // Obter detalhes dos procedimentos SELECIONADOS
        const selectedItems = selectedPlanForProgress.items?.filter(item => 
          updates.selectedProcedures.includes(item.id || `item-${selectedPlanForProgress.items.indexOf(item)}`)
        ) || [];
        
        const proceduresList = selectedItems.length > 0 
          ? selectedItems.map(item => 
              `${item.procedure}${item.tooth ? ` (Dente ${item.tooth})` : ''}`
            ).join(', ')
          : 'Procedimentos não especificados';
        
        const sessionContent = `🦷 **${selectedPlanForProgress.title.toUpperCase()}** - Sessão ${updates.currentSession}/${totalSessions}\n` +
          `📋 **Procedimentos:** ${proceduresList}\n` +
          `📅 **Data:** ${new Date(updates.sessionDate).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}\n` +
          `📊 **Progresso:** ${newProgress}% (${updates.currentSession}/${totalSessions} sessões)\n` +
          `🔄 **Status:** ${updates.currentSession === totalSessions ? '✅ TRATAMENTO FINALIZADO' : '⏳ EM ANDAMENTO'}\n` +
          `💰 **Valor Total:** R$ ${(selectedPlanForProgress.totalCost || 0).toFixed(2)}\n\n` +
          `📝 **Realizado na Sessão:**\n${updates.sessionDescription}`;
        
        await apiService.createAnnotation({
          patient_id: selectedPatientData.id,
          content: sessionContent,
          category: 'tratamento'
        });
        
        // Recarregar anotações para aparecer na timeline
        await loadAnnotations(selectedPatientData.id);
        
        // Atualizar também o estado local das anotações de tratamento
        setTreatmentAnnotations(prev => [{
          id: Date.now(), // ID temporário
          patient_id: selectedPatientData.id,
          content: sessionContent,
          category: 'tratamento',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, ...prev]);
        
        console.log('📝 Anotação da sessão criada na timeline:', sessionContent);
        console.log('🔍 selectedPlanForProgress:', selectedPlanForProgress);
        console.log('🔍 proceduresList:', proceduresList);
      }
      
      console.log('✅ Sessão salva com sucesso!', { 
        session: updates.currentSession, 
        progress: `${newProgress}%`,
        planId: selectedPlanForProgress.id
      });
      
      // Fechar o modal após salvar
      setShowProgressModal(false);
      setSelectedPlanForProgress(null);
      
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw error;
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() && selectedPatientData) {
      try {
        const newAnnotation = await apiService.createAnnotation({
          patient_id: selectedPatientData.id,
          content: newNote,
          category: 'Geral'
        });
        
        setAnnotations(prev => [newAnnotation, ...prev]);
        setNewNote('');
        console.log('Nova anotação adicionada:', newAnnotation);
      } catch (err) {
        console.error('Erro ao adicionar anotação:', err);
        setError('Erro ao salvar anotação');
      }
    }
  };

  const handleAddAnnotationFromAnamnese = async (annotation: { content: string; category: string }) => {
    if (selectedPatientData) {
      try {
        // Extrair o prefixo da anotação (ex: "Diabetes:", "Alergias:", etc.)
        const prefix = annotation.content.split(':')[0] + ':';
        console.log('🔍 Buscando anotação com prefixo:', prefix);
        console.log('📋 Anotações atuais:', annotations);
        
        // Verificar se já existe uma anotação da anamnese with o mesmo prefixo
        const existingAnnotation = annotations.find(ann => 
          ann.category === 'Anamnese' && 
          ann.content.startsWith(prefix)
        );
        
        console.log('🎯 Anotação existente encontrada:', existingAnnotation);
        
        if (existingAnnotation) {
          console.log('🔄 Atualizando anotação existente...');
          // Atualizar anotação existente
          const updatedAnnotation = await apiService.updateAnnotation(existingAnnotation.id, {
            content: annotation.content,
            category: annotation.category
          });
          
          setAnnotations(prev => prev.map(ann => 
            ann.id === existingAnnotation.id ? updatedAnnotation : ann
          ));
          console.log('✅ Anotação da anamnese atualizada:', updatedAnnotation);
        } else {
          console.log('➕ Criando nova anotação...');
          // Criar nova anotação
          const newAnnotation = await apiService.createAnnotation({
            patient_id: selectedPatientData.id,
            content: annotation.content,
            category: annotation.category
          });
          
          setAnnotations(prev => [newAnnotation, ...prev]);
          console.log('✅ Anotação da anamnese adicionada:', newAnnotation);
        }
      } catch (err) {
        console.error('❌ Erro ao processar anotação da anamnese:', err);
      }
    }
  };

  const handleDeleteAnnotation = async (annotationId: number) => {
    try {
      await apiService.deleteAnnotation(annotationId);
      setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
      console.log('Anotação removida:', annotationId);
    } catch (err) {
      console.error('Erro ao remover anotação:', err);
      setError('Erro ao remover anotação');
    }
  };

  const handleOpenAnamnese = async (patientId: number) => {
    try {
      // Buscar anamnese existente do paciente
      const anamneses = await apiService.getAnamneseByPatient(patientId);
      const existingAnamnese = anamneses.length > 0 ? anamneses[0] : undefined;
      
      setSelectedAnamnesePatient(patientId);
      setShowAnamnese(true);
      
      // Passar anamnese existente para o modal
      if (existingAnamnese) {
        // Atualizar o estado do paciente com a anamnese
        setPatientsList(prev => prev.map(patient => 
          patient.id === patientId 
            ? { ...patient, anamnese: existingAnamnese }
            : patient
        ));
      }
    } catch (err) {
      console.error('Erro ao carregar anamnese:', err);
      // Abrir modal mesmo com erro
      setSelectedAnamnesePatient(patientId);
      setShowAnamnese(true);
    }
  };

  const handleSaveAnamnese = (anamneseData: any) => {
    console.log('Anamnese salva:', anamneseData);
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === anamneseData.cliente_id) {
        return {
          ...patient,
          anamnese: anamneseData,
          timeline: [
            {
              id: Date.now().toString(),
              patientId: patient.id,
              type: 'anamnese',
              title: anamneseData.id ? 'Anamnese Atualizada' : 'Anamnese Criada',
              description: 'Formulário de anamnese preenchido e salvo',
              date: new Date().toISOString(),
              professional: 'Dr. Ana Silva'
            },
            ...(patient.timeline || [])
          ]
        };
      }
      return patient;
    }));
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedEditPatient(patient);
    setShowEditPatient(true);
  };

  const handleSaveEditPatient = (updatedPatient: Patient) => {
    setPatientsList(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));
  };

  const handleScheduleReturn = (returnData: any) => {
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === returnData.patientId) {
        return {
          ...patient,
          scheduledReturn: returnData,
          timeline: [
            {
              id: Date.now().toString(),
              patientId: patient.id,
              type: 'retorno',
              title: 'Retorno Agendado',
              description: `Retorno para ${returnData.procedure} agendado para ${new Date(returnData.returnDate).toLocaleDateString('pt-BR')}`,
              date: new Date().toISOString(),
              professional: 'Dr. Ana Silva'
            },
            ...(patient.timeline || [])
          ]
        };
      }
      return patient;
    }));
  };

  const handleSaveTreatmentPlan = async (treatmentPlan: any) => {
    try {
      console.log('Salvando plano de tratamento no Supabase:', treatmentPlan);
      
      // Verificar se é edição (plano tem ID válido do backend) ou criação (novo plano)
      // Para novos planos, o ID deve ser undefined, null, ou um ID temporário
      const hasValidBackendId = treatmentPlan.id && 
        typeof treatmentPlan.id === 'string' && 
        !treatmentPlan.id.includes('plan-') && 
        !treatmentPlan.id.includes('empty-') && 
        !treatmentPlan.id.includes('error-') &&
        !treatmentPlan.id.includes('temp-') &&
        treatmentPlan.id.match(/^[0-9a-f-]+$/i) && // UUID ou número válido
        treatmentPlan.id.length > 10; // IDs do backend são longos
      
      const isEditing = !!hasValidBackendId;
      
              console.log('🔄 Modo:', isEditing ? 'EDITANDO plano existente' : 'CRIANDO novo plano');
        console.log('🆔 ID do plano:', treatmentPlan.id);
        console.log('🔍 Detalhes do ID:', {
          hasId: !!treatmentPlan.id,
          idType: typeof treatmentPlan.id,
          idLength: treatmentPlan.id?.length,
          includesPlan: treatmentPlan.id?.includes('plan-'),
          includesEmpty: treatmentPlan.id?.includes('empty-'),
          includesError: treatmentPlan.id?.includes('error-'),
          includesTemp: treatmentPlan.id?.includes('temp-'),
          isValidBackendId: !!hasValidBackendId,
          isEditing,
          finalDecision: isEditing ? 'EDITAR' : 'CRIAR'
        });
      
      let savedPlan;
      
      if (isEditing) {
        // ATUALIZAR plano existente
        console.log('📝 Atualizando plano existente:', treatmentPlan.id);
        
        // Verificar se items existe antes de mapear
        if (!treatmentPlan.items || !Array.isArray(treatmentPlan.items)) {
          console.log('❌ ERRO: treatmentPlan.items é undefined ou não é um array:', treatmentPlan.items);
          console.log('❌ Dados completos recebidos:', treatmentPlan);
          throw new Error('Dados do plano inválidos - items não encontrado');
        }
        
        // Para atualização, incluir também os itens para que sejam atualizados no backend
        const cleanItems = treatmentPlan.items.map(item => {
          // REMOVER APENAS campos que causam problemas no backend, MAS MANTER sessions
          const {
            completedSessions,
            sessoes_estimadas,
            ...cleanItem
          } = item;
          
          // Criar objeto com campos permitidos pelo backend + sessions limpas
          const allowedItem = {
            id: cleanItem.id || undefined, // Manter ID se existir para identificar o item
            procedure: cleanItem.procedure || '',
            description: cleanItem.description || '', // Garantir que não seja vazio
            tooth: cleanItem.tooth || '',
            priority: cleanItem.priority || 'baixa',
            estimatedCost: cleanItem.estimatedCost || 0,
            estimatedSessions: cleanItem.estimatedSessions || 1,
            status: cleanItem.status || 'planejado',
            notes: cleanItem.notes || '',
            order: cleanItem.order || 1,
            // Limpar sessions - remover campos que o backend não aceita
            sessions: (cleanItem.sessions || []).map(session => ({
              id: session.id,
              session_number: session.session_number || session.sessionNumber,
              sessionNumber: session.sessionNumber || session.session_number,
              date: session.date,
              description: session.description || '',
              completed: session.completed || false
              // REMOVIDO: treatment_item_id, created_at, updated_at
            }))
          };
          
          // Garantir que description não esteja vazio
          if (!allowedItem.description.trim()) {
            allowedItem.description = 'Procedimento sem descrição específica';
          }
          
          // Limpar campos de data vazios ou inválidos
          if (cleanItem.startDate && cleanItem.startDate.trim() !== '' && cleanItem.startDate !== 'Invalid Date') {
            try {
              const date = new Date(cleanItem.startDate);
              if (!isNaN(date.getTime())) {
                allowedItem.startDate = date.toISOString();
              }
            } catch {
              // Ignorar data inválida
            }
          }
          
          if (cleanItem.completionDate && cleanItem.completionDate.trim() !== '' && cleanItem.completionDate !== 'Invalid Date') {
            try {
              const date = new Date(cleanItem.completionDate);
              if (!isNaN(date.getTime())) {
                allowedItem.completionDate = date.toISOString();
              }
            } catch {
              // Ignorar data inválida
            }
          }
          
          return allowedItem;
        });
        
        console.log('📤 Dados LIMPOS que serão enviados para o backend:', {
          title: treatmentPlan.title,
          description: treatmentPlan.description,
          items: cleanItems,
          totalCost: treatmentPlan.totalCost,
          progress: treatmentPlan.progress
        });
        
        console.log('🔍 Verificando cada item individualmente:');
        cleanItems.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`Description válida:`, item.description && item.description.trim().length > 0);
        });
        
        savedPlan = await apiService.updateTreatmentPlan(treatmentPlan.id, {
          title: treatmentPlan.title,
          description: treatmentPlan.description,
          items: cleanItems, // Incluir itens para atualização
          totalCost: treatmentPlan.totalCost,
          progress: treatmentPlan.progress
        });
        
        console.log('✅ Plano atualizado:', savedPlan);
      } else {
        // CRIAR novo plano
        console.log('🆕 Criando novo plano');
        
        // VERIFICAÇÃO EXTRA - garantir que não é um plano existente
        if (treatmentPlan.id && hasValidBackendId) {
          console.error('❌ ERRO: Tentando criar plano com ID válido do backend!');
          throw new Error('Tentativa de criar plano com ID existente');
        }
        
        // Limpar os dados para enviar ao backend (remover propriedades proibidas)
        const cleanItems = treatmentPlan.items.map(item => {
          // REMOVER TODOS os campos que não devem existir no backend
          const {
            id, 
            sessions, 
            completedSessions,
            sessoes_estimadas,
            ...cleanItem
          } = item;
          
          // Criar objeto apenas com campos permitidos pelo backend
          const allowedItem = {
            procedure: cleanItem.procedure || '',
            description: cleanItem.description || '', // Garantir que não seja vazio
            tooth: cleanItem.tooth || '',
            priority: cleanItem.priority || 'baixa',
            estimatedCost: cleanItem.estimatedCost || 0,
            estimatedSessions: cleanItem.estimatedSessions || 1,
            status: cleanItem.status || 'planejado',
            notes: cleanItem.notes || '',
            order: cleanItem.order || 1
          };
          
          // Garantir que description não esteja vazio
          if (!allowedItem.description.trim()) {
            allowedItem.description = 'Procedimento sem descrição específica';
          }
          
          // Limpar campos de data vazios ou inválidos
          if (cleanItem.startDate && cleanItem.startDate.trim() !== '' && cleanItem.startDate !== 'Invalid Date') {
            try {
              const date = new Date(cleanItem.startDate);
              if (!isNaN(date.getTime())) {
                allowedItem.startDate = date.toISOString();
              }
            } catch {
              // Ignorar data inválida
            }
          }
          
          if (cleanItem.completionDate && cleanItem.completionDate.trim() !== '' && cleanItem.completionDate !== 'Invalid Date') {
            try {
              const date = new Date(cleanItem.completionDate);
              if (!isNaN(date.getTime())) {
                allowedItem.completionDate = date.toISOString();
              }
            } catch {
              // Ignorar data inválida
            }
          }
          
          return allowedItem;
        });

        console.log('📤 Dados para criar novo plano:', {
          patientId: Number(treatmentPlan.patientId),
          title: treatmentPlan.title,
          items: cleanItems
        });

        savedPlan = await apiService.createTreatmentPlan({
          patientId: Number(treatmentPlan.patientId),
          title: treatmentPlan.title,
          description: treatmentPlan.description,
          items: cleanItems, // Itens limpos sem id e sessions
          totalCost: treatmentPlan.totalCost,
          progress: treatmentPlan.progress
        });
        
        console.log('✅ Novo plano criado:', savedPlan);
        
              // Recarregar os planos do banco para obter dados completos (incluindo sessões)
      console.log('🔄 Recarregando planos do banco de dados...');
      await loadTreatmentPlans(treatmentPlan.patientId);
      
      // Aguardar um pouco mais para garantir sincronização completa
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Forçar recarregamento adicional
      console.log('🔄 Recarregamento adicional para garantir sincronização...');
      await loadTreatmentPlans(treatmentPlan.patientId);
    }
    
    // Atualizar a lista local de pacientes com o plano atualizado
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === treatmentPlan.patientId) {
        console.log('🔄 Atualizando paciente local:', patient.id, 'com plano:', savedPlan);
        return {
          ...patient,
          treatmentPlan: savedPlan
        };
      }
      return patient;
    }));
    
    // Forçar re-render da lista se o paciente selecionado é o que foi atualizado
    if (selectedPatient === treatmentPlan.patientId) {
      console.log('🔄 Atualizando paciente selecionado na tela');
      // Forçar atualização do estado do paciente selecionado
      setSelectedPatient(null);
      setTimeout(() => setSelectedPatient(treatmentPlan.patientId), 100);
    }
      
      return savedPlan;
    } catch (error) {
      console.error('Erro ao salvar plano de tratamento:', error);
      throw error;
    }
  };

  const handleSessionCompleted = async (sessionData: any) => {
    console.log('🔄 Sessão concluída:', sessionData);
    
    try {
      // SALVAR A SESSÃO NO BACKEND primeiro
      console.log('💾 Salvando sessão no backend:', sessionData);
      
      // Atualizar a sessão no backend
      await apiService.updateSession(sessionData.sessionId, {
        completed: true,
        date: sessionData.date,
        description: sessionData.description
      });
      
      console.log('✅ Sessão salva no backend com sucesso');
      
      // Atualizar o estado local
      setPatientsList(prev => prev.map(patient => {
        if (patient.id === sessionData.patientId) {
          const toothInfo = sessionData.tooth ? ` - Dente ${sessionData.tooth}` : '';
          
          // Atualizar o plano de tratamento com a sessão concluída
          let updatedTreatmentPlan = patient.treatmentPlan;
          if (updatedTreatmentPlan && updatedTreatmentPlan.items) {
            updatedTreatmentPlan = {
              ...updatedTreatmentPlan,
              items: updatedTreatmentPlan.items.map(item => {
                if (item.procedure === sessionData.procedure) {
                  // Atualizar as sessões do item
                  const updatedSessions = item.sessions?.map(session => {
                    if (session.id === sessionData.sessionId) {
                      return {
                        ...session,
                        completed: true,
                        date: sessionData.date,
                        description: sessionData.description
                      };
                    }
                    return session;
                  }) || item.sessions;
                  
                  // Recalcular o progresso do item
                  const completedSessions = updatedSessions?.filter(s => s.completed).length || 0;
                  const totalSessions = item.estimatedSessions || 1;
                  const itemProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
                  
                  return {
                    ...item,
                    sessions: updatedSessions,
                    progress: itemProgress
                  };
                }
                return item;
              })
            };
            
            // Recalcular o progresso geral do plano
            const totalSessions = updatedTreatmentPlan.items.reduce((total, item) => total + (item.estimatedSessions || 1), 0);
            const completedSessions = updatedTreatmentPlan.items.reduce((total, item) => {
              return total + (item.sessions?.filter(s => s.completed).length || 0);
            }, 0);
            const overallProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
            
            console.log('🔄 PROGRESSO RECALCULADO:', {
              totalSessions,
              completedSessions,
              overallProgress,
              oldProgress: updatedTreatmentPlan.progress
            });
            
            updatedTreatmentPlan = {
              ...updatedTreatmentPlan,
              progress: overallProgress
            };
          }
          
          return {
            ...patient,
            treatmentPlan: updatedTreatmentPlan,
            timeline: [
              {
                id: Date.now().toString(),
                patientId: patient.id,
                type: 'procedimento',
                title: `${sessionData.procedure} - Sessão ${sessionData.sessionNumber} Concluída`,
                description: `${sessionData.procedure}${toothInfo}: ${sessionData.description}`,
                date: sessionData.date,
                professional: 'Dr. Ana Silva'
              },
              ...(patient.timeline || [])
            ]
          };
        }
        return patient;
      }));
      
      // Salvar o progresso atualizado no backend usando os dados do plano atualizado
      if (selectedPlanForProgress && selectedPlanForProgress.id) {
        // Aguardar a atualização do estado e então recalcular
        setTimeout(async () => {
          try {
            // Buscar o plano atualizado diretamente do backend
            const updatedPlans = await apiService.getTreatmentPlansByPatient(sessionData.patientId);
            const updatedPlan = updatedPlans.find(p => p.id === selectedPlanForProgress.id);
            
            if (updatedPlan) {
              const totalSessions = updatedPlan.items?.reduce((total, item) => total + (item.estimatedSessions || 1), 0) || 0;
              const completedSessions = updatedPlan.items?.reduce((total, item) => {
                return total + (item.sessions?.filter(s => s.completed).length || 0);
              }, 0) || 0;
              const newProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
              
              console.log('💾 Salvando progresso atualizado no BD (dados frescos):', {
                planId: selectedPlanForProgress.id,
                newProgress,
                totalSessions,
                completedSessions,
                updatedPlan: updatedPlan
              });
              
              await apiService.updateTreatmentPlanProgress(selectedPlanForProgress.id, newProgress);
              console.log('✅ Progresso salvo no BD com sucesso!');
            }
          } catch (error) {
            console.error('❌ Erro ao salvar progresso no BD:', error);
          }
        }, 100);
      }
      
      // Recarregar os planos de tratamento para garantir sincronização
      if (selectedPatient === sessionData.patientId) {
        console.log('🔄 Recarregando planos para sincronização...');
        await loadTreatmentPlans(selectedPatient);
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar sessão no backend:', error);
      alert('Erro ao salvar sessão. Tente novamente.');
    }
  };

  const hasAnamneseNotes = (patientId: number) => {
    const patient = patientsList.find(p => p.id === patientId);
    return patient?.observacoes && patient.observacoes.trim().length > 0;
  };

  const handleNewPatient = (patient: Patient) => {
    setPatientsList(prev => [...prev, patient]);
    setSelectedPatient(patient.id);
    setShowNewPatient(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie os dados dos pacientes</p>
        </div>
        <Button icon={Plus} onClick={() => setShowNewPatient(true)}>
          Novo Paciente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <div className="lg:col-span-1">
          <Card title="Lista de Pacientes" subtitle={`${filteredPatients.length} pacientes`}>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadPatients}
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhum paciente encontrado</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{patient.nome}</h3>
                        <p className="text-sm text-gray-600">{patient.telefone}</p>
                      </div>
                      <StatusBadge status={patient.status || 'ativo'} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Detalhes do Paciente */}
        <div className="lg:col-span-2">
          {selectedPatientData ? (
            <div className="space-y-6">
              {/* Tabs de Navegação */}
              <Card>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { 
                        id: 'info', 
                        label: 'Informações', 
                        icon: User,
                        badge: selectedPatientData?.anamnese ? '✓' : null,
                        badgeColor: 'bg-blue-500'
                      },
                      { id: 'treatment', label: 'Plano de Tratamento', icon: FileText },
                      { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
                      { id: 'files', label: 'Arquivos', icon: Upload },
                      { 
                        id: 'notes', 
                        label: 'Anotações', 
                        icon: StickyNote,
                        badge: annotations.length > 0 ? annotations.length : null,
                        badgeColor: 'bg-red-500'
                      }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.label}
                          {tab.badge && (
                            <span className={`ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white rounded-full ${tab.badgeColor || 'bg-gray-500'}`}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </Card>

              {/* Plano de Tratamento */}
              {activeTab === 'treatment' && (
                <Card title="Plano de Tratamento" subtitle="Gerencie o plano de tratamento do paciente">
                  {selectedPatientData && (
                    <div className="space-y-4">
                      {/* Botão para abrir modal */}
                      <div className="flex justify-end">
                        <Button                         onClick={() => {
                          console.log('=== CLICOU EM CRIAR PLANO ===');
                          console.log('selectedPatientData:', selectedPatientData);
                          console.log('selectedPatientData?.id:', selectedPatientData?.id);
                          console.log('selectedPatientData?.nome:', selectedPatientData?.nome);
                          console.log('================================');
                          setSelectedTreatmentPatient(selectedPatientData); 
                          setSelectedTreatmentPlan(null); // GARANTIR que é null para novo plano
                          setShowTreatmentPlan(true); 
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Criar Planos
                        </Button>
                      </div>

                      {/* Lista de todos os planos */}
                      <div className="space-y-3">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                          Todos os Planos de Tratamento
                        </h4>
                        
                        {/* Loading state */}
                        {loadingTreatmentPlans ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Carregando planos...</p>
                          </div>
                        ) : (
                          /* Lista de planos */
                          <div className="space-y-3">
                            {patientTreatmentPlans && patientTreatmentPlans.length > 0 ? (
                              patientTreatmentPlans.map((plan, index) => (
                                <div 
                                  key={plan.id} 
                                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
                                  onClick={() => {
                                    console.log('🔵 CLICOU NO PLANO PARA PROGRESSO:', plan);
                                    setSelectedPlanForProgress(plan);
                                    setShowProgressModal(true);
                                  }}
                                  title="Clique para editar este plano de tratamento"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {plan.title || `Plano ${index + 1}`}
                                        </h5>
                                        <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                                        {index === 0 && (
                                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                                            Mais Recente
                                          </span>
                                        )}
                                      </div>
                                      
                                      {plan.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                          {plan.description}
                                        </p>
                                      )}
                                      
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            {plan.items?.length || 0} procedimentos
                                          </span>
                                        </div>
                                        <div className="text-center">
                                          <span className="text-green-600 dark:text-green-400 font-medium">
                                            R$ {(plan.totalCost || 0).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="text-center">
                                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                                            {plan.progress || 0}% completo
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Detalhes dos itens do plano com sessões restantes */}
                                      {plan.items && plan.items.length > 0 && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Procedimentos e Sessões:
                                          </h6>
                                          <div className="space-y-2">
                                                                                        {plan.items.map((item, itemIndex) => {
                                              // Calcular sessões completadas e restantes baseado nas sessões REAIS
                                              const totalSessions = item.sessions?.length || item.sessoes_estimadas || item.estimatedSessions || 1;
                                              const completedSessions = item.sessions?.filter(s => s.completed).length || 0;
                                              const remainingSessions = totalSessions - completedSessions;
                                              
                                              // Debug: verificar dados das sessões
                                              console.log(`🔍 Item ${item.procedure}:`, {
                                                totalSessions,
                                                completedSessions,
                                                remainingSessions,
                                                sessionsLength: item.sessions?.length,
                                                sessionsCompleted: item.sessions?.filter(s => s.completed).length,
                                                itemCompletedSessions: item.completedSessions,
                                                itemSessions: item.sessions,
                                                sessoesEstimadas: item.sessoes_estimadas,
                                                itemKeys: Object.keys(item)
                                              });
                                              
                                              // Debug: verificar estrutura completa do item
                                              console.log(`🔍 ESTRUTURA COMPLETA do item ${item.procedure}:`, item);
                                              
                                              
                                              
                                              return (
                                                <div key={itemIndex} className="flex items-center justify-between text-sm">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                      {item.procedure}
                                                    </span>
                                                    {(item.tooth || item.dente) && (
                                                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                                                        Dente {item.tooth || item.dente}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                                                      remainingSessions === 0 
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                        : remainingSessions <= Math.ceil(totalSessions / 2)
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                    }`}>
                                                      {remainingSessions === 0 ? '✅ Concluído' : `${remainingSessions} sessões restantes`}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                      ({completedSessions}/{totalSessions})
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Status mais visível */}
                                      <div className="mt-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          plan.status === 'ativo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                          plan.status === 'concluido' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                          plan.status === 'cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                        }`}>
                                          {plan.status === 'ativo' ? '🟢 Ativo' :
                                           plan.status === 'concluido' ? '🔵 Concluído' :
                                           plan.status === 'cancelado' ? '🔴 Cancelado' :
                                           '⚪ ' + (plan.status || 'Ativo')}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 ml-4">
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Evitar o clique no card
                                          setSelectedTreatmentPatient(selectedPatientData);
                                          setShowTreatmentPlan(true);
                                          setSelectedTreatmentPlan(plan);
                                        }}
                                      >
                                        Editar
                                      </Button>
                                      
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Evitar o clique no card
                                          handleDeleteTreatmentPlan(plan.id);
                                        }}
                                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Nenhum plano de tratamento encontrado</p>
                                <p className="text-sm">Clique em "Gerenciar Planos" para criar um novo</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Informações Básicas */}
              {activeTab === 'info' && (
                <Card title="Informações do Paciente">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <p className="text-gray-900">{selectedPatientData.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <p className="text-gray-900">{selectedPatientData.telefone || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedPatientData.Email || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <p className="text-gray-900">{selectedPatientData.Cpf || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                      <p className="text-gray-900">{selectedPatientData.data_nascimento ? new Date(selectedPatientData.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <p className="text-gray-900">{selectedPatientData.status || 'Ativo'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <p className="text-gray-900">{selectedPatientData.address || 'Não informado'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <p className="text-gray-900">{selectedPatientData.observacoes || 'Nenhuma observação'}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPatient(selectedPatientData)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={FileText}
                      onClick={() => handleOpenAnamnese(selectedPatientData.id)}
                    >
                      {selectedPatientData.anamnese ? 'Editar Anamnese' : 'Anamnese'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={FileText}
                      onClick={() => {
                        console.log('=== CLICOU EM PLANO DE TRATAMENTO ===');
                        console.log('selectedPatientData:', selectedPatientData);
                        console.log('selectedPatientData?.id:', selectedPatientData?.id);
                        console.log('selectedPatientData?.nome:', selectedPatientData?.nome);
                        console.log('================================');
                        setSelectedTreatmentPatient(selectedPatientData);
                        setShowTreatmentPlan(true);
                      }}
                    >
                      Plano de Tratamento
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={Calendar}
                      onClick={() => {
                        setSelectedReturnPatient(selectedPatientData);
                        setShowScheduleReturn(true);
                      }}
                    >
                      Agendar Retorno
                    </Button>
                    <Button variant="outline" size="sm" icon={Upload}>Arquivos</Button>
                  </div>
                </Card>
              )}

              {/* Linha do Tempo */}
              {activeTab === 'timeline' && (
                <Card title="Linha do Tempo do Paciente" subtitle="Histórico completo de atendimentos">
                  <div className="space-y-6">
                    {/* Seção de Sessões de Tratamento */}
                    {treatmentAnnotations.length > 0 && (
                      <div className="mb-8">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                            Sessões de Tratamento
                          </h3>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                          {treatmentAnnotations.map((annotation, index) => (
                            <div key={annotation.id} className="relative flex items-start space-x-4 pb-6">
                              <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-medium">
                                      🦷 Sessão de Tratamento
                                    </span>
                                    {/* Mostrar o nome do tratamento de forma destacada */}
                                    {annotation.content.includes('**') && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
                                          {annotation.content.split('**')[1]?.replace(' - Sessão', '')?.trim() || 'Tratamento'}
                                        </span>
                                        {annotation.content.includes('Sessão') && (
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {annotation.content.match(/Sessão (\d+\/\d+)/)?.[0] || ''}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {/* Para anotações antigas, tentar detectar o nome do plano atual */}
                                    {!annotation.content.includes('**') && annotation.content.includes('Sessão') && (
                                      <div className="flex items-center space-x-2">
                                        {/* Tentar detectar o nome do plano baseado nos planos existentes */}
                                        {(() => {
                                          const currentPlan = patientTreatmentPlans.find(plan => 
                                            annotation.content.includes(`Sessão 1 de ${plan.items?.reduce((total, item) => total + (item.estimatedSessions || 1), 0) || 0}`) ||
                                            annotation.content.includes(`de ${plan.items?.reduce((total, item) => total + (item.estimatedSessions || 1), 0) || 0}`)
                                          );
                                          
                                          if (currentPlan) {
                                            return (
                                              <span className="text-lg font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
                                                {currentPlan.title.toUpperCase()}
                                              </span>
                                            );
                                          }
                                          
                                          return (
                                            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/40 px-3 py-1 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                              ⚠️ Nome do Tratamento Não Disponível
                                            </span>
                                          );
                                        })()}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          (Sessão Antiga)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {annotation.created_at && (
                                    <span className="text-sm text-gray-500">
                                      {new Date(annotation.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                                {/* Resumo visual para sessões com formatação rica */}
                                {annotation.content.includes('**') && (
                                  <div className="mb-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Procedimentos:</span>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                          {annotation.content.match(/Procedimentos:\*\* (.+?)(?:\n|$)/)?.[1] || 'Não especificado'}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Progresso:</span>
                                        <div className="font-medium text-blue-600 dark:text-blue-400">
                                          {annotation.content.match(/Progresso:\*\* (.+?)(?:\n|$)/)?.[1] || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="prose prose-sm max-w-none">
                                  {/* Mostrar conteúdo formatado */}
                                  <div 
                                    className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ 
                                      __html: annotation.content
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-gray-100">$1</strong>')
                                        .replace(/\n/g, '<br>') 
                                    }}
                                  />
                                  
                                  
                                  
                                  {/* Para outras anotações antigas */}
                                  {!annotation.content.includes('**') && !annotation.content.includes('Sessão') && (
                                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                                      <strong>Anotação:</strong> {annotation.content}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Highlight de informações importantes */}
                                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      {annotation.content.includes('Progresso:') && (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                          📊 {annotation.content.match(/Progresso: (.+?)(?:\n|$)/)?.[1]}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      {annotation.content.includes('Valor Total:') && (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                          💰 {annotation.content.match(/Valor Total: (.+?)(?:\n|$)/)?.[1]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline agora só mostra sessões de tratamento */}
                    {treatmentAnnotations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma sessão de tratamento registrada ainda</p>
                        <p className="text-sm">Clique em um plano de tratamento para registrar uma sessão</p>
                      </div>
                    )}

                  </div>
                </Card>
              )}

              {/* Arquivos */}
              {activeTab === 'files' && (
                <Card title="Arquivos do Paciente">
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Funcionalidade de arquivos em desenvolvimento</p>
                  </div>
                </Card>
              )}

              {/* Anotações Internas */}
              {activeTab === 'notes' && (
                <Card title="Anotações Internas" subtitle="Informações privadas da equipe">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Nova Anotação</h4>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Ex: Paciente prefere ser chamado à tarde, tem receio de procedimentos..."
                        rows={3}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex justify-end mt-3">
                        <Button size="sm" onClick={handleAddNote}>
                          Adicionar Anotação
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lista de Anotações */}
                    {loadingAnnotations ? (
                      <div className="text-center py-8">
                        <LoadingSpinner />
                        <p className="text-gray-500 mt-2">Carregando anotações...</p>
                      </div>
                    ) : annotations.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Anotações Existentes</h4>
                        {annotations.map((annotation) => (
                          <div key={annotation.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    {annotation.category}
                                  </span>
                                  {annotation.created_at && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(annotation.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  {annotation.content}
                                </p>
                              </div>
                              <button
                                onClick={() => annotation.id && handleDeleteAnnotation(annotation.id)}
                                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                                title="Excluir anotação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma anotação registrada</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um paciente</h3>
                <p>Escolha um paciente da lista para ver os detalhes</p>
              </div>
            </Card>
          )}
        </div>
      </div>

             {/* Modais */}
       <NewPatientModal
         isOpen={showNewPatient}
         onClose={() => setShowNewPatient(false)}
         onSave={handleNewPatient}
       />

       {console.log('=== RENDERIZANDO MODAL ===')}
       
       {/* TESTE DE CLIQUE SIMPLES */}
       <button 
         onClick={() => {
           console.log('🔴 CLIQUE DE TESTE FUNCIONOU!');
           alert('Clique funcionou!');
         }}
         style={{position: 'fixed', top: '10px', right: '10px', zIndex: 9999, backgroundColor: 'red', color: 'white', padding: '10px'}}
       >
         TESTE CLIQUE
       </button>
       {console.log('selectedTreatmentPatient:', selectedTreatmentPatient)}
       {console.log('showTreatmentPlan:', showTreatmentPlan)}
       {console.log('================================')}
       
       {selectedTreatmentPatient && (
        <TreatmentPlanModal
          isOpen={showTreatmentPlan}
          onClose={() => {
            setShowTreatmentPlan(false);
            setSelectedTreatmentPatient(null);
            setSelectedTreatmentPlan(null);
            // Não precisa recarregar - a atualização local já foi feita
          }}
          patientName={selectedTreatmentPatient.nome}
          patientId={selectedTreatmentPatient.id}
          existingPlan={selectedTreatmentPlan || null}
          onSave={handleSaveTreatmentPlan}
          onSessionCompleted={handleSessionCompleted}
        />
      )}

      {selectedAnamnesePatient && (
        <AnamneseModal
          isOpen={showAnamnese}
          onClose={() => {
            setShowAnamnese(false);
            setSelectedAnamnesePatient(null);
          }}
          patientName={patientsList.find(p => p.id === selectedAnamnesePatient)?.nome || ''}
          patientId={selectedAnamnesePatient}
          existingAnamnese={patientsList.find(p => p.id === selectedAnamnesePatient)?.anamnese}
          onSave={handleSaveAnamnese}
          onAddAnnotation={handleAddAnnotationFromAnamnese}
        />
      )}

      {selectedReturnPatient && (
        <ScheduleReturnModal
          isOpen={showScheduleReturn}
          onClose={() => {
            setShowScheduleReturn(false);
            setSelectedReturnPatient(null);
          }}
          patientName={selectedReturnPatient.nome}
          patientId={selectedReturnPatient.id}
          onSave={handleScheduleReturn}
        />
      )}

      {selectedEditPatient && (
        <EditPatientModal
          isOpen={showEditPatient}
          onClose={() => {
            setShowEditPatient(false);
            setSelectedEditPatient(null);
          }}
          patient={selectedEditPatient}
          onSave={handleSaveEditPatient}
        />
      )}

      {/* Modal de Progresso do Tratamento */}
      {selectedPlanForProgress && (
        <TreatmentProgressModal
          isOpen={showProgressModal}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedPlanForProgress(null);
          }}
          onSave={handleSaveProgress}
          onSessionCompleted={handleSessionCompleted}
          plan={selectedPlanForProgress}
          patientName={selectedPatientData?.nome || ''}
          patientId={selectedPatientData?.id || 0}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setPlanToDelete(null);
        }}
        onConfirm={confirmDeleteTreatmentPlan}
        title="Excluir Plano de Tratamento"
        message="Tem certeza que deseja excluir este plano de tratamento? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}