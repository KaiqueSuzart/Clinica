import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Calendar, Plus, FileText, Upload, Clock, MessageSquare, StickyNote, AlertCircle, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewPatientModal from '../components/Patients/NewPatientModal';
import AnamneseModal from '../components/Patients/AnamneseModal';
import EditPatientModal from '../components/Patients/EditPatientModal';
import TreatmentPlanModal from '../components/Patients/TreatmentPlanModal';
import ScheduleReturnModal from '../components/Patients/ScheduleReturnModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
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

  // Carregar anotações quando o paciente selecionado mudar
  useEffect(() => {
    if (selectedPatient) {
      loadAnnotations(selectedPatient);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patients = await apiService.getPatients();
      setPatientsList(patients);
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0].id);
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
      const patientAnnotations = await apiService.getAnnotations(patientId);
      setAnnotations(patientAnnotations);
    } catch (err) {
      console.error('Erro ao carregar anotações:', err);
      // Se não conseguir carregar, usar array vazio
      setAnnotations([]);
    } finally {
      setLoadingAnnotations(false);
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
        const newAnnotation = await apiService.createAnnotation({
          patient_id: selectedPatientData.id,
          content: annotation.content,
          category: annotation.category
        });
        
        setAnnotations(prev => [newAnnotation, ...prev]);
        console.log('Anotação da anamnese adicionada:', newAnnotation);
      } catch (err) {
        console.error('Erro ao adicionar anotação da anamnese:', err);
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

  const handleSaveTreatmentPlan = (treatmentPlan: any) => {
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === treatmentPlan.patientId) {
        return {
          ...patient,
          treatmentPlan: treatmentPlan,
          timeline: [
            {
              id: Date.now().toString(),
              patientId: patient.id,
              type: 'procedimento',
              title: 'Plano de Tratamento Atualizado',
              description: `Plano "${treatmentPlan.title}" foi ${patient.treatmentPlan ? 'atualizado' : 'criado'}`,
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

  const handleSessionCompleted = (sessionData: any) => {
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === parseInt(sessionData.patientId)) {
        const toothInfo = sessionData.tooth ? ` - Dente ${sessionData.tooth}` : '';
        return {
          ...patient,
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
                  {selectedPatientData.treatmentPlan ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedPatientData.treatmentPlan.title}</h3>
                          <p className="text-gray-600">{selectedPatientData.treatmentPlan.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { setSelectedTreatmentPatient(selectedPatientData); setShowTreatmentPlan(true); }}
                        >
                          Editar Plano
                        </Button>
                      </div>
                      {/* Lista de itens (se existir) */}
                      {selectedPatientData.treatmentPlan.items && selectedPatientData.treatmentPlan.items.length > 0 ? (
                        <div className="divide-y divide-gray-200 border rounded-md">
                          {selectedPatientData.treatmentPlan.items.map((item: any) => (
                            <div key={item.id} className="p-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{item.procedure}</p>
                                <p className="text-sm text-gray-600">{item.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-700">Sessões: {item.estimatedSessions}</p>
                                <p className="text-sm text-gray-700">Custo: {typeof item.estimatedCost === 'number' ? item.estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : item.estimatedCost}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nenhum item no plano.</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-4">Nenhum plano de tratamento</p>
                      <Button onClick={() => { setSelectedTreatmentPatient(selectedPatientData); setShowTreatmentPlan(true); }}>
                        Criar Plano de Tratamento
                      </Button>
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
                    {selectedPatientData.timeline && selectedPatientData.timeline.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        {selectedPatientData.timeline.map((event, index) => (
                          <div key={event.id} className="relative flex items-start space-x-4 pb-6">
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                              event.type === 'consulta' ? 'bg-blue-100 text-blue-600' :
                              event.type === 'procedimento' ? 'bg-green-100 text-green-600' :
                              event.type === 'arquivo' ? 'bg-purple-100 text-purple-600' :
                              event.type === 'nota' ? 'bg-yellow-100 text-yellow-600' :
                              event.type === 'retorno' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {event.type === 'consulta' && <Calendar className="w-4 h-4" />}
                              {event.type === 'procedimento' && <FileText className="w-4 h-4" />}
                              {event.type === 'arquivo' && <Upload className="w-4 h-4" />}
                              {event.type === 'nota' && <MessageSquare className="w-4 h-4" />}
                              {event.type === 'retorno' && <Clock className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(event.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{event.description}</p>
                              {event.professional && (
                                <p className="text-sm text-gray-600">
                                  Profissional: {event.professional}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum evento registrado ainda</p>
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

       {selectedTreatmentPatient && (
        <TreatmentPlanModal
          isOpen={showTreatmentPlan}
          onClose={() => {
            setShowTreatmentPlan(false);
            setSelectedTreatmentPatient(null);
          }}
          patientName={selectedTreatmentPatient.nome}
          patientId={selectedTreatmentPatient.id}
          existingPlan={selectedTreatmentPatient.treatmentPlan}
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
    </div>
  );
}