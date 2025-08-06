import React, { useState } from 'react';
import { Search, User, Phone, Calendar, Plus, FileText, Upload, Clock, MessageSquare, StickyNote } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import NewPatientModal from '../components/Patients/NewPatientModal';
import AnamneseModal from '../components/Patients/AnamneseModal';
import EditPatientModal from '../components/Patients/EditPatientModal';
import { patients } from '../data/mockData';

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'files' | 'notes'>('info');
  const [newNote, setNewNote] = useState('');
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [patientsList, setPatientsList] = useState(patients);
  const [showAnamnese, setShowAnamnese] = useState(false);
  const [selectedAnamnesePatient, setSelectedAnamnesePatient] = useState<string | null>(null);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [selectedEditPatient, setSelectedEditPatient] = useState<any>(null);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [selectedTreatmentPatient, setSelectedTreatmentPatient] = useState<any>(null);

  const filteredPatients = patientsList.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const selectedPatientData = patientsList.find(p => p.id === selectedPatient);

  const handleAddNote = () => {
    if (newNote.trim() && selectedPatientData) {
      // Em uma aplicação real, isso seria uma chamada à API
      console.log('Nova nota adicionada:', newNote);
      setNewNote('');
    }
  };

  const handleNewPatient = (newPatient: any) => {
    setPatientsList(prev => [...prev, newPatient]);
    setSelectedPatient(newPatient.id);
  };

  const handleOpenAnamnese = (patientId: string) => {
    setSelectedAnamnesePatient(patientId);
    setShowAnamnese(true);
  };

  const handleSaveAnamnese = (anamneseData: any) => {
    // Em uma aplicação real, isso seria salvo no backend
    console.log('Anamnese salva:', anamneseData);
    
    // Adicionar à timeline do paciente
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === anamneseData.patientId) {
        return {
          ...patient,
          timeline: [
            {
              id: Date.now().toString(),
              patientId: patient.id,
              type: 'anamnese',
              title: 'Anamnese Atualizada',
              description: 'Formulário de anamnese preenchido e salvo',
              date: new Date().toISOString(),
              professional: 'Dr. Ana Silva'
            },
            ...patient.timeline
          ]
        };
      }
      return patient;
    }));
  };

  const handleEditPatient = (patient: any) => {
    setSelectedEditPatient(patient);
    setShowEditPatient(true);
  };

  const handleSaveEditPatient = (updatedPatient: any) => {
    setPatientsList(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));
  };

  const hasAnamneseNotes = (patientId: string) => {
    // Verificar se há anotações na anamnese
    // Simular que o paciente 1 tem anotações
    return patientId === '1';
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
              {filteredPatients.map((patient) => (
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
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.phone}</p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                </div>
              ))}
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
                      { id: 'info', label: 'Informações', icon: User },
                     { id: 'treatment', label: 'Plano de Tratamento', icon: FileText },
                      { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
                      { id: 'files', label: 'Arquivos', icon: Upload },
                      { id: 'notes', label: 'Anotações', icon: StickyNote }
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
                         {tab.id === 'treatment' && selectedPatientData?.treatmentPlan && (
                           <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                         )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </Card>

              {/* Informações Básicas */}
              {activeTab === 'info' && (
                <Card title="Informações do Paciente">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-gray-900">{selectedPatientData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <p className="text-gray-900">{selectedPatientData.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedPatientData.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <p className="text-gray-900">{new Date(selectedPatientData.birthDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <p className="text-gray-900">{selectedPatientData.address}</p>
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
                    Anamnese
                    {hasAnamneseNotes(selectedPatientData.id) && (
                      <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" icon={Upload}>Arquivos</Button>
                </div>
              </Card>
              )}

             {/* Plano de Tratamento */}
             {activeTab === 'treatment' && (
               <Card title="Plano de Tratamento" subtitle="Gerencie o plano de tratamento do paciente">
                 {selectedPatientData?.treatmentPlan ? (
                   <div className="space-y-6">
                     {/* Resumo do Plano */}
                     <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                       <div className="flex items-center justify-between mb-4">
                         <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                           {selectedPatientData.treatmentPlan.title}
                         </h4>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => {
                             setSelectedTreatmentPatient(selectedPatientData);
                             setShowTreatmentPlan(true);
                           }}
                         >
                           Editar Plano
                         </Button>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                         <div className="text-center">
                           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                             {selectedPatientData.treatmentPlan.items?.length || 0}
                           </div>
                           <p className="text-sm text-blue-800 dark:text-blue-200">Procedimentos</p>
                         </div>
                         <div className="text-center">
                           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                             R$ {selectedPatientData.treatmentPlan.totalCost?.toFixed(2) || '0.00'}
                           </div>
                           <p className="text-sm text-green-800 dark:text-green-200">Custo Total</p>
                         </div>
                         <div className="text-center">
                           <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                             {selectedPatientData.treatmentPlan.progress || 0}%
                           </div>
                           <p className="text-sm text-purple-800 dark:text-purple-200">Progresso</p>
                         </div>
                       </div>
                       
                       <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-4">
                         <div 
                           className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                           style={{ width: `${selectedPatientData.treatmentPlan.progress || 0}%` }}
                         />
                       </div>
                       
                       {selectedPatientData.treatmentPlan.description && (
                         <p className="text-blue-800 dark:text-blue-200 text-sm">
                           {selectedPatientData.treatmentPlan.description}
                         </p>
                       )}
                     </div>

                     {/* Lista de Procedimentos */}
                     <div>
                       <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                         Procedimentos do Plano
                       </h5>
                       <div className="space-y-3">
                         {selectedPatientData.treatmentPlan.items?.map((item: any) => (
                           <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                             <div className="flex items-start justify-between">
                               <div className="flex-1">
                                 <div className="flex items-center space-x-3 mb-2">
                                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                     #{item.order}
                                   </span>
                                   <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                                     {item.procedure}
                                     {item.tooth && <span className="text-blue-600 dark:text-blue-400"> - Dente {item.tooth}</span>}
                                   </h6>
                                   <span className={`px-2 py-1 text-xs rounded-full border ${
                                     item.priority === 'alta' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700' :
                                     item.priority === 'media' ? 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700' :
                                     'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700'
                                   }`}>
                                     {item.priority}
                                   </span>
                                 </div>
                                 
                                 <p className="text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
                                 
                                 <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                   <span>R$ {item.estimatedCost?.toFixed(2)}</span>
                                   <span>{item.estimatedSessions} sessão(ões)</span>
                                   {item.startDate && (
                                     <span>Iniciado: {new Date(item.startDate).toLocaleDateString('pt-BR')}</span>
                                   )}
                                   {item.completionDate && (
                                     <span>Concluído: {new Date(item.completionDate).toLocaleDateString('pt-BR')}</span>
                                   )}
                                 </div>
                               </div>
                               
                               <div className="ml-4">
                                 <StatusBadge status={item.status} />
                               </div>
                             </div>
                           </div>
                         )) || []}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                     <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                       Nenhum plano de tratamento
                     </h4>
                     <p className="text-gray-600 dark:text-gray-400 mb-6">
                       Crie um plano de tratamento para organizar os procedimentos
                     </p>
                     <Button 
                       onClick={() => {
                         setSelectedTreatmentPatient(selectedPatientData);
                         setShowTreatmentPlan(true);
                       }}
                       icon={Plus}
                     >
                       Criar Plano de Tratamento
                     </Button>
                   </div>
                 )}
               </Card>
             )}
              {/* Linha do Tempo */}
              {activeTab === 'timeline' && (
                <Card title="Linha do Tempo do Paciente" subtitle="Histórico completo de atendimentos">
                  <div className="space-y-6">
                    {selectedPatientData.timeline.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        {selectedPatientData.timeline.map((event, index) => (
                          <div key={event.id} className="relative flex items-start space-x-4 pb-6">
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                              event.type === 'consulta' ? 'bg-blue-100 text-blue-600' :
                              event.type === 'procedimento' ? 'bg-green-100 text-green-600' :
                              event.type === 'arquivo' ? 'bg-purple-100 text-purple-600' :
                              event.type === 'nota' ? 'bg-yellow-100 text-yellow-600' :
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
                              {event.attachments && event.attachments.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600 mb-1">Anexos:</p>
                                  <div className="flex space-x-2">
                                    {event.attachments.map((attachment, i) => (
                                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {attachment}
                                      </span>
                                    ))}
                                  </div>
                                </div>
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
                {selectedPatientData.files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPatientData.files.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{file.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(file.uploadDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {file.type === 'image' && (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="mt-3 w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum arquivo enviado</p>
                  </div>
                )}
              </Card>
              )}

              {/* Anotações Internas */}
              {activeTab === 'notes' && (
                <Card title="Anotações Internas" subtitle="Informações privadas da equipe">
                  <div className="space-y-4">
                    {/* Nova Anotação */}
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
                    {selectedPatientData.notes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatientData.notes.map((note) => (
                          <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-gray-800 mb-2">{note.content}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Por: {note.createdBy}</span>
                                  <span>•</span>
                                  <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                                  {note.isPrivate && (
                                    <>
                                      <span>•</span>
                                      <span className="text-red-600 font-medium">Privado</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <StickyNote className="w-5 h-5 text-yellow-600 ml-3" />
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

              {/* Histórico de Consultas - Mantido para compatibilidade */}
              {activeTab === 'info' && (
                <Card title="Histórico de Consultas">
                {selectedPatientData.procedures.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatientData.procedures.map((procedure) => (
                      <div key={procedure.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{procedure.name}</h4>
                          <p className="text-sm text-gray-600">{procedure.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(procedure.date).toLocaleDateString('pt-BR')} - {procedure.professional}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={procedure.status} />
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            R$ {procedure.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum procedimento realizado</p>
                  </div>
                )}
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
        patientName={selectedTreatmentPatient.name}
        patientId={selectedTreatmentPatient.id}
        existingPlan={selectedTreatmentPatient.treatmentPlan}
        onSave={handleSaveTreatmentPlan}
      />
    )}
      {selectedAnamnesePatient && (
        <AnamneseModal
          isOpen={showAnamnese}
          onClose={() => {
            setShowAnamnese(false);
            setSelectedAnamnesePatient(null);
          }}
          patientName={patientsList.find(p => p.id === selectedAnamnesePatient)?.name || ''}
          patientId={selectedAnamnesePatient}
          onSave={handleSaveAnamnese}
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