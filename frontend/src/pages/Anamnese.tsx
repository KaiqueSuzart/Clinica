import React, { useState, useEffect } from 'react';
import { ClipboardList, FileText, Save, Download, Search, User, MessageSquare, StickyNote, AlertTriangle, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import AnamneseModal from '../components/Patients/AnamneseModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/Toast';
import { apiService, Patient, AnamneseData, Annotation } from '../services/api';

export default function Anamnese() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnamnese, setShowAnamnese] = useState(false);
  const [selectedAnamnesePatient, setSelectedAnamnesePatient] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);
  const [patientAnamneses, setPatientAnamneses] = useState<AnamneseData[]>([]);
  const [loadingAnamneses, setLoadingAnamneses] = useState(false);
  
  const { ToastContainer } = useToast();

  // Carregar pacientes
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const patients = await apiService.getPatients();
        setPatientsList(patients);
      } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        setError('Erro ao carregar pacientes');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Carregar anotações e anamneses quando um paciente é selecionado
  useEffect(() => {
    if (selectedPatient) {
      loadAnnotations(selectedPatient);
      loadPatientAnamneses(selectedPatient);
    }
  }, [selectedPatient]);

  const loadAnnotations = async (patientId: number) => {
    try {
      setLoadingAnnotations(true);
      const patientAnnotations = await apiService.getAnnotations(patientId);
      setAnnotations(patientAnnotations);
    } catch (err) {
      console.error('Erro ao carregar anotações:', err);
    } finally {
      setLoadingAnnotations(false);
    }
  };

  const loadPatientAnamneses = async (patientId: number) => {
    try {
      setLoadingAnamneses(true);
      const anamneses = await apiService.getAnamneseByPatient(patientId);
      setPatientAnamneses(anamneses);
      console.log('Anamneses carregadas:', anamneses);
    } catch (err) {
      console.error('Erro ao carregar anamneses:', err);
    } finally {
      setLoadingAnamneses(false);
    }
  };

  const filteredPatients = patientsList.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefone.includes(searchTerm)
  );

  const selectedPatientData = patientsList.find(p => p.id === selectedPatient);

  const handlePatientSelect = (patientId: number) => {
    setSelectedPatient(patientId);
  };

  const handleOpenAnamnese = async (patientId: number, anamneseId?: number) => {
    try {
      setSelectedAnamnesePatient(patientId);
      setShowAnamnese(true);
      
      // Se não especificou anamneseId, vai criar uma nova
      if (!anamneseId) {
        return;
      }
      
      // Buscar anamnese específica para edição
      const anamneses = await apiService.getAnamneseByPatient(patientId);
      const existingAnamnese = anamneses.find(a => a.id === anamneseId);
      
      if (existingAnamnese) {
        // Atualizar o estado do paciente com a anamnese específica
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

  const handleSaveAnamnese = async (anamneseData: AnamneseData) => {
    console.log('Anamnese salva:', anamneseData);
    
    // Recarregar a anamnese do banco para garantir que temos os dados mais recentes
    try {
      const updatedAnamneses = await apiService.getAnamneseByPatient(anamneseData.cliente_id);
      const latestAnamnese = updatedAnamneses.length > 0 ? updatedAnamneses[0] : anamneseData;
      
      // Atualizar a lista de pacientes com a anamnese mais recente
      setPatientsList(prev => prev.map(patient => {
        if (patient.id === anamneseData.cliente_id) {
          console.log('Atualizando paciente com anamnese:', patient.nome, latestAnamnese);
          return {
            ...patient,
            anamnese: latestAnamnese,
            timeline: [
              {
                id: Date.now().toString(),
                patientId: patient.id,
                type: 'anamnese',
                title: latestAnamnese.id ? 'Anamnese Atualizada' : 'Anamnese Criada',
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

      // Recarregar anotações e anamneses se for o paciente selecionado
      if (selectedPatient === anamneseData.cliente_id) {
        loadAnnotations(anamneseData.cliente_id);
        loadPatientAnamneses(anamneseData.cliente_id);
      }
    } catch (err) {
      console.error('Erro ao recarregar anamnese:', err);
      // Fallback: usar os dados que recebemos
      setPatientsList(prev => prev.map(patient => {
        if (patient.id === anamneseData.cliente_id) {
          return {
            ...patient,
            anamnese: anamneseData
          };
        }
        return patient;
      }));
    }
  };

  const handleAddAnnotationFromAnamnese = async (annotation: { content: string; category: string }) => {
    if (!selectedPatient) {
      console.error('Nenhum paciente selecionado para criar anotação');
      return;
    }

    try {
      console.log('Criando anotação:', annotation);
      const newAnnotation = await apiService.createAnnotation({
        patient_id: selectedPatient,
        content: annotation.content,
        category: annotation.category,
        is_private: true
      });

      console.log('Anotação criada com sucesso:', newAnnotation);
      setAnnotations(prev => [newAnnotation, ...prev]);
    } catch (err) {
      console.error('Erro ao criar anotação:', err);
      // O sistema de toast já mostra os erros automaticamente
    }
  };

  const handleGeneratePDF = () => {
    if (!selectedPatient) {
      console.log('Nenhum paciente selecionado para gerar PDF');
      return;
    }
    
    console.log(`PDF da anamnese de ${selectedPatientData?.nome} será gerado`);
    // TODO: Implementar geração de PDF
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anamnese e Consentimento</h1>
          <p className="text-gray-600 dark:text-gray-400">Formulário de anamnese digital para pacientes</p>
        </div>
        <div className="flex space-x-3">
          {selectedPatient && (
            <>
              <Button variant="outline" icon={Download} onClick={handleGeneratePDF}>
                Gerar PDF
              </Button>
              <Button icon={ClipboardList} onClick={() => handleOpenAnamnese(selectedPatient)}>
                Abrir Anamnese
              </Button>
            </>
          )}
        </div>
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPatient === patient.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{patient.nome}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.telefone}</p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                  {patient.anamnese && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                      <ClipboardList className="w-3 h-3 mr-1" />
                      Anamnese preenchida
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Histórico de Anamneses */}
          {selectedPatientData && (
            <Card title="Anamneses Anteriores" className="mt-6">
              <div className="space-y-3">
                {loadingAnamneses ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : patientAnamneses.length > 0 ? (
                  <div className="space-y-2">
                    {patientAnamneses.map((anamnese, index) => (
                      <div key={anamnese.id || index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Anamnese #{index + 1}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {anamnese.data_consentimento ? 
                              new Date(anamnese.data_consentimento).toLocaleDateString('pt-BR') : 
                              'Data não informada'
                            }
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            icon={FileText}
                            onClick={() => handleOpenAnamnese(selectedPatient, anamnese.id)}
                          >
                            Ver/Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleOpenAnamnese(selectedPatient)}
                      >
                        + Nova Anamnese
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Nenhuma anamnese encontrada</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleOpenAnamnese(selectedPatient)}
                    >
                      Criar Anamnese
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Anotações do Paciente */}
          {selectedPatientData && (
            <Card title="Anotações Importantes" className="mt-6">
              {loadingAnnotations ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : annotations.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {annotations.map((annotation) => (
                    <div key={annotation.id} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            {annotation.category}:
                          </span>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                            {annotation.content}
                          </p>
                        </div>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          {new Date(annotation.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">Nenhuma anotação encontrada</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Área Principal */}
        <div className="lg:col-span-2">
          {selectedPatientData ? (
            <Card title={`Paciente Selecionado - ${selectedPatientData.nome}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Informações do Paciente</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nome:</span> {selectedPatientData.nome}</p>
                      <p><span className="font-medium">Telefone:</span> {selectedPatientData.telefone}</p>
                      <p><span className="font-medium">Email:</span> {selectedPatientData.email || 'Não informado'}</p>
                      <p><span className="font-medium">Status:</span> 
                        <StatusBadge status={selectedPatientData.status} className="ml-2" />
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Status da Anamnese</h4>
                    <div className="space-y-2">
                      {patientAnamneses.length > 0 ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <ClipboardList className="w-4 h-4 mr-2" />
                          <span className="text-sm">{patientAnamneses.length} anamnese(s) preenchida(s)</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Anamnese pendente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <Button 
                      icon={ClipboardList} 
                      onClick={() => handleOpenAnamnese(selectedPatient)}
                      className="flex-1"
                    >
                      {patientAnamneses.length > 0 ? 'Nova Anamnese' : 'Criar Anamnese'}
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={Download} 
                      onClick={handleGeneratePDF}
                    >
                      Gerar PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Selecione um paciente</h3>
                <p>Escolha um paciente da lista para gerenciar a anamnese</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Anamnese */}
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

      <ToastContainer />
    </div>
  );
}