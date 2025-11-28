import React, { useState, useEffect } from 'react';
import { Upload, File, Image, Download, Trash2, Eye, Plus, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingButton from '../components/UI/LoadingButton';
import { useToast } from '../components/UI/Toast';
import { ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { apiService } from '../services/api';
import { formatPhoneDisplay } from '../utils/phoneFormatter';

interface PatientFile {
  id: string;
  patient_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category: 'image' | 'document' | 'xray' | 'report';
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  public_url?: string;
}

interface PatientFileStats {
  total_files: number;
  total_size: number;
  images: number;
  documents: number;
  xrays: number;
  reports: number;
}

export default function Arquivos() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'document' | 'xray' | 'report'>('image');
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [fileStats, setFileStats] = useState<PatientFileStats | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
    onDownload?: () => void;
  }>({
    isOpen: false,
    imageUrl: '',
    imageName: ''
  });
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  const selectedPatientData = patients.find(p => p.id.toString() === selectedPatient);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientFiles();
      loadPatientStats();
    } else {
      setFiles([]);
      setFileStats(null);
    }
  }, [selectedPatient]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imageModal.isOpen) {
        closeImageModal();
      }
    };

    if (imageModal.isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [imageModal.isOpen]);

  const loadPatients = async () => {
    try {
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setError('Erro ao carregar pacientes');
    }
  };

  const loadPatientFiles = async () => {
    if (!selectedPatient) return;
    
    setIsLoading(true);
    try {
      const filesData = await apiService.getPatientFiles(selectedPatient);
      setFiles(filesData);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setError('Erro ao carregar arquivos do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientStats = async () => {
    if (!selectedPatient) return;
    
    try {
      const stats = await apiService.getPatientFileStats(selectedPatient);
      setFileStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

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
      showError('Selecione um paciente e um arquivo primeiro');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(selectedFiles).map(file => 
        apiService.uploadFile(file, selectedPatient, uploadType, description)
      );

      await Promise.all(uploadPromises);
      
      // Recarregar arquivos e estatísticas
      await loadPatientFiles();
      await loadPatientStats();
      
      // Limpar formulário
      setSelectedFiles(null);
      setDescription('');
      
      // Reset input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      showSuccess(`${selectedFiles.length} arquivo(s) enviado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro no upload:', error);
      showError('Erro ao fazer upload dos arquivos');
      setError('Erro ao fazer upload dos arquivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await apiService.deleteFile(fileId);
      await loadPatientFiles();
      await loadPatientStats();
      showSuccess('Arquivo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      showError('Erro ao excluir arquivo');
      setError('Erro ao excluir arquivo');
    }
  };

  const handleViewFile = (file: PatientFile) => {
    if (!file.public_url) {
      showError('URL do arquivo não disponível');
      return;
    }

    const isImage = file.category === 'image' || file.category === 'xray';
    
    if (isImage) {
      // Resetar zoom e rotação
      setZoom(100);
      setRotation(0);
      // Abrir modal
      setImageModal({
        isOpen: true,
        imageUrl: file.public_url,
        imageName: file.original_filename,
        onDownload: () => handleDownloadFile(file)
      });
    } else {
      // Para documentos, abrir em nova aba
      window.open(file.public_url, '_blank');
    }
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      imageName: ''
    });
    setZoom(100);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleDownloadFile = async (file: PatientFile) => {
    if (!file.public_url) {
      showError('URL do arquivo não disponível para download');
      return;
    }

    try {
      showInfo('Iniciando download...');
      
      // Fazer fetch do arquivo para forçar download
      const response = await fetch(file.public_url);
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Download concluído!');
    } catch (error) {
      console.error('Erro no download:', error);
      showError('Erro ao fazer download do arquivo');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      image: 'Imagem',
      document: 'Documento',
      xray: 'Raio-X',
      report: 'Relatório'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      image: Image,
      document: File,
      xray: Image,
      report: File
    };
    return icons[category as keyof typeof icons] || File;
  };

  return (
    <>
      <ToastContainer />
      
      {/* Modal de Visualização de Imagem */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={closeImageModal}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{imageModal.imageName}</h3>
                  <p className="text-sm text-gray-500">Zoom: {zoom}%</p>
                </div>
                
                {/* Controles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Diminuir zoom"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleRotate}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Rotacionar"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Resetar"
                  >
                    Reset
                  </button>
                  
                  {imageModal.onDownload && (
                    <button
                      onClick={imageModal.onDownload}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={closeImageModal}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Conteúdo da imagem */}
              <div className="relative overflow-auto max-h-[70vh] bg-gray-100">
                <div className="flex items-center justify-center min-h-[400px] p-4">
                  <img
                    src={imageModal.imageUrl}
                    alt={imageModal.imageName}
                    className="max-w-none transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Use os controles acima para ajustar a visualização</span>
                  <span>ESC para fechar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arquivos dos Pacientes</h1>
          <p className="text-gray-600">Gerencie os arquivos e documentos dos pacientes</p>
        </div>
        <Button 
          icon={Upload}
          onClick={handleUpload}
          disabled={!selectedPatient || !selectedFiles || isUploading}
        >
          Upload de Arquivo
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

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
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.nome}</option>
                ))}
              </select>
              
              {selectedPatientData && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg animate-in fade-in duration-300">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Paciente Selecionado</h4>
                  <p className="text-blue-700 dark:text-blue-200">{selectedPatientData.nome}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{formatPhoneDisplay(selectedPatientData.telefone)}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                    {files.length} arquivo(s)
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
                    Categoria
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="image">Imagem</option>
                    <option value="document">Documento</option>
                    <option value="xray">Raio-X</option>
                    <option value="report">Relatório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o arquivo..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
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
                    accept={uploadType === 'image' || uploadType === 'xray' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Clique para selecionar ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {uploadType === 'image' || uploadType === 'xray' ? 'PNG, JPG até 10MB' : 'PDF, DOC até 10MB'}
                  </p>
                  {selectedFiles && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {selectedFiles.length} arquivo(s) selecionado(s):
                      </p>
                      <div className="mt-2 space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <p key={index} className="text-xs text-green-700 dark:text-green-300">
                            {file.name} ({formatFileSize(file.size)})
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
            <Card title={`Arquivos - ${selectedPatientData.nome}`} 
                  subtitle={`${files.length} arquivo(s) encontrado(s)`}>
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Carregando arquivos...</p>
                </div>
              ) : files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {files.map((file) => {
                    const CategoryIcon = getCategoryIcon(file.category);
                    const isImage = file.category === 'image' || file.category === 'xray';
                    
                    return (
                      <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {isImage && file.public_url ? (
                          <div>
                            <img
                              src={file.public_url}
                              alt={file.original_filename}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <CategoryIcon className="w-4 h-4 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{file.original_filename}</h3>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">
                                {getCategoryLabel(file.category)}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {formatFileSize(file.file_size)}
                              </p>
                              <p className="text-sm text-gray-600 mb-3">
                                {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                              </p>
                              {file.description && (
                                <p className="text-sm text-gray-700 mb-3">{file.description}</p>
                              )}
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
                                <CategoryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{file.original_filename}</h3>
                                <p className="text-xs text-gray-500">
                                  {getCategoryLabel(file.category)} • {formatFileSize(file.file_size)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            {file.description && (
                              <p className="text-sm text-gray-700 mb-3">{file.description}</p>
                            )}
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
                    );
                  })}
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

      {/* Estatísticas de Arquivos */}
      {selectedPatientData && fileStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Image className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Imagens</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {fileStats.images}
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
                  {fileStats.documents}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Image className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Raio-X</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {fileStats.xrays}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <File className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Relatórios</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {fileStats.reports}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">MB</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tamanho Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatFileSize(fileStats.total_size)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}