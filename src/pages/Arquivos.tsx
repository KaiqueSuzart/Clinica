import React, { useState } from 'react';
import { Upload, File, Image, Download, Trash2, Eye } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { patients } from '../data/mockData';

export default function Arquivos() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'document'>('image');

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arquivos dos Pacientes</h1>
          <p className="text-gray-600">Gerencie os arquivos e documentos dos pacientes</p>
        </div>
        <Button icon={Upload}>Upload de Arquivo</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seleção de Paciente */}
        <div className="lg:col-span-1">
          <Card title="Selecionar Paciente">
            <div className="space-y-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Escolha um paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
              
              {selectedPatientData && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Paciente Selecionado</h4>
                  <p className="text-blue-700">{selectedPatientData.name}</p>
                  <p className="text-sm text-blue-600">{selectedPatientData.phone}</p>
                  <p className="text-sm text-blue-600 mt-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="image">Imagem</option>
                    <option value="document">Documento</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Clique para selecionar ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    {uploadType === 'image' ? 'PNG, JPG até 10MB' : 'PDF, DOC até 10MB'}
                  </p>
                </div>

                <Button className="w-full" icon={Upload}>
                  Fazer Upload
                </Button>
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
                              <Button variant="outline" size="sm" icon={Eye}>Ver</Button>
                              <Button variant="outline" size="sm" icon={Download}>Baixar</Button>
                              <Button variant="danger" size="sm" icon={Trash2}></Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <File className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{file.name}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(file.uploadDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" icon={Download}>Baixar</Button>
                            <Button variant="danger" size="sm" icon={Trash2}></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
                  <p>Este paciente ainda não possui arquivos enviados</p>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16 text-gray-500">
                <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um paciente</h3>
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
              <Image className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Imagens</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedPatientData.files.filter(f => f.type === 'image').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <File className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Documentos</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedPatientData.files.filter(f => f.type === 'document').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{selectedPatientData.files.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 font-bold text-sm">MB</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamanho</p>
                <p className="text-xl font-bold text-gray-900">2.5 MB</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}