import React, { useState } from 'react';
import { Upload, File, Image, Download, Trash2, Eye, Plus } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingButton from '../components/UI/LoadingButton';
import { patients } from '../data/mockData';

export default function Arquivos() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'document'>('image');
  const [patientsList, setPatientsList] = useState(patients);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const selectedPatientData = patientsList.find(p => p.id === selectedPatient);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || !selectedPatient) {
      alert('Selecione um paciente e um arquivo primeiro');
      return;
    }

    setIsUploading(true);

    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Adicionar arquivos ao paciente
    const newFiles = Array.from(selectedFiles).map((file, index) => ({
      id: (Date.now() + index).toString(),
      patientId: selectedPatient,
      name: file.name,
      type: uploadType,
      url: uploadType === 'image' 
        ? 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=300'
        : '#',
      uploadDate: new Date().toISOString().split('T')[0]
    }));

    // Atualizar lista de pacientes
    setPatientsList(prev => prev.map(patient => {
      if (patient.id === selectedPatient) {
        return {
          ...patient,
          files: [...patient.files, ...newFiles],
          timeline: [
            {
              id: Date.now().toString(),
              patientId: selectedPatient,
              type: 'arquivo',
              title: `${newFiles.length} arquivo(s) adicionado(s)`,
              description: `Upload de ${newFiles.map(f => f.name).join(', ')}`,
              date: new Date().toISOString(),
              professional: 'Dr. Ana Silva',
              attachments: newFiles.map(f => f.name)
            },
            ...patient.timeline
          ]
        };
      }
      return patient;
    }));

    setIsUploading(false);
    setSelectedFiles(null);
    
    // Reset input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    alert(`${newFiles.length} arquivo(s) enviado(s) com sucesso!`);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    setPatientsList(prev => prev.map(patient => {
      if (patient.id === selectedPatient) {
        return {
          ...patient,
          files: patient.files.filter(f => f.id !== fileId)
        };
      }
      return patient;
    }));

    alert('Arquivo excluído com sucesso!');
  };

  const handleViewFile = (file: any) => {
    if (file.type === 'image') {
      window.open(file.url, '_blank');
    } else {
      alert(`Visualizando arquivo: ${file.name}`);
    }
  };

  const handleDownloadFile = (file: any) => {
    alert(`Download iniciado: ${file.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arquivos dos Pacientes</h1>
          <p className="text-gray-600">Gerencie os arquivos e documentos dos pacientes</p>
        </div>
        <Button 
          icon={Upload}
          onClick={handleUpload}
          disabled={!selectedPatient || !selectedFiles}
        >
          Upload de Arquivo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seleção de Paciente */}
        <div className="lg:col-span-1">
          <Card title="Selecionar Paciente">
            <div className="space-y-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Escolha um paciente</option>
                {patientsList.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
              
              {selectedPatientData && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg animate-in fade-in duration-300">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Paciente Selecionado</h4>
                  <p className="text-blue-700 dark:text-blue-200">{selectedPatientData.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{selectedPatientData.phone}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                    {selectedPatientData.files.length} arquivo(s)
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upload de Arquivo */}
          {selectedPatient && (
            <Card title="Upload de Arquivo" className="mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Arquivo
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as 'image' | 'document')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="image">Imagem</option>
                    <option value="document">Documento</option>
                  </select>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept={uploadType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Clique para selecionar ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {uploadType === 'image' ? 'PNG, JPG até 10MB' : 'PDF, DOC até 10MB'}
                  </p>
                  {selectedFiles && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {selectedFiles.length} arquivo(s) selecionado(s):
                      </p>
                      <div className="mt-2 space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <p key={index} className="text-xs text-green-700 dark:text-green-300">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <LoadingButton 
                  className="w-full" 
                  icon={Upload}
                  onClick={handleUpload}
                  loading={isUploading}
                  disabled={!selectedFiles}
                >
                  {isUploading ? 'Enviando...' : 'Fazer Upload'}
                </LoadingButton>
              </div>
            </Card>
          )}
        </div>

        {/* Lista de Arquivos */}
        <div className="lg:col-span-3">
          {selectedPatientData ? (
            <Card title={`Arquivos - ${selectedPatientData.name}`} 
                  subtitle={`${selectedPatientData.files.length} arquivo(s) encontrado(s)`}>
              {selectedPatientData.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {selectedPatientData.files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {file.type === 'image' ? (
                        <div>
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Image className="w-4 h-4 text-blue-600" />
                              <h3 className="font-semibold text-gray-900">{file.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Enviado em {new Date(file.uploadDate).toLocaleDateString('pt-BR')}
                            </p>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                icon={Eye}
                                onClick={() => handleViewFile(file)}
                              >
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                icon={Download}
                                onClick={() => handleDownloadFile(file)}
                              >
                                Baixar
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                icon={Trash2}
                                onClick={() => handleDeleteFile(file.id)}
                              >
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{file.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {new Date(file.uploadDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Download}
                              onClick={() => handleDownloadFile(file)}
                            >
                              Baixar
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              icon={Trash2}
                              onClick={() => handleDeleteFile(file.id)}
                            >
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum arquivo encontrado</h3>
                  <p>Este paciente ainda não possui arquivos enviados</p>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Selecione um paciente</h3>
                <p>Escolha um paciente para visualizar seus arquivos</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Categorias de Arquivos */}
      {selectedPatientData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Image className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Imagens</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedPatientData.files.filter(f => f.type === 'image').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <File className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Documentos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedPatientData.files.filter(f => f.type === 'document').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedPatientData.files.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">MB</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tamanho</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">2.5 MB</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}