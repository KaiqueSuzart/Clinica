import React, { useState, useEffect } from 'react';
import { Settings, Save, User, MessageSquare, Bell, Shield, Clock, Calendar, Users, Upload, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { clinicSettings } from '../data/mockData';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../components/Auth/AuthProvider';
import { apiService } from '../services/api';

export default function Configuracoes() {
  const [settings, setSettings] = useState(clinicSettings);
  const [empresaData, setEmpresaData] = useState({
    nome: '',
    email_empresa: '',
    telefone: '',
    endereco: '',
    cnpj: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showNovoUsuarioModal, setShowNovoUsuarioModal] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    cargo: 'Recepcionista',
    telefone: '',
    password: ''
  });
  const { businessHours, setBusinessHours } = useBusinessHours();
  const { user, canView, canEdit } = useUser();
  const { empresa, updateEmpresaData } = useAuth();

  // Filtrar abas baseado nas permissões do usuário
  const allTabs = [
    { id: 'clinic', label: 'Dados da Clínica', icon: Settings, permission: 'configuracoes', requiresAdmin: true },
    { id: 'schedule', label: 'Horário de Funcionamento', icon: Clock, permission: 'configuracoes', requiresAdmin: true },
    { id: 'users', label: 'Usuários', icon: User, permission: 'configuracoes', requiresAdmin: true },
    { id: 'messages', label: 'Templates de Mensagens', icon: MessageSquare, permission: 'mensagens', requiresAdmin: false },
    { id: 'notifications', label: 'Notificações', icon: Bell, permission: 'configuracoes', requiresAdmin: false }
  ];

  const tabs = allTabs.filter(tab => {
    if (!canView(tab.permission)) return false;
    // Se a aba requer admin, verificar se o usuário é admin
    if (tab.requiresAdmin && user?.role !== 'admin') return false;
    return true;
  });

  // Definir aba ativa baseada no usuário
  const getDefaultActiveTab = () => {
    if (user?.role === 'admin') return 'clinic';
    // Recepcionista começa na primeira aba disponível (geralmente mensagens ou notificações)
    return tabs[0]?.id || 'messages';
  };

  const [activeTab, setActiveTab] = useState(getDefaultActiveTab());

  // Carregar dados da empresa e usuários
  useEffect(() => {
    loadEmpresaData();
    loadUsuarios();
  }, []);

  // Atualizar aba ativa quando o usuário mudar
  useEffect(() => {
    setActiveTab(getDefaultActiveTab());
  }, [user]);

  const loadEmpresaData = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/empresas/dados');
      console.log('Dados carregados do backend:', data);
      
      // Garantir que todos os campos tenham valores string vazios se forem null/undefined
      const empresaDataFormatted = {
        nome: data.nome || '',
        email_empresa: data.email_empresa || '',
        telefone: data.telefone || '',
        endereco: data.endereco || '',
        cnpj: data.cnpj || ''
      };
      
      console.log('Dados formatados:', empresaDataFormatted);
      setEmpresaData(empresaDataFormatted);
      
      // Atualizar o contexto de autenticação com todos os dados (incluindo logo_url)
      const empresaDataCompleto = {
        ...empresaDataFormatted,
        logo_url: data.logo_url || ''
      };
      console.log('Atualizando contexto com:', empresaDataCompleto);
      updateEmpresaData(empresaDataCompleto);
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEmpresaData = async () => {
    try {
      setSaving(true);
      
      // Separar logo_url dos dados para evitar payload muito grande
      const { logo_url, ...dadosParaSalvar } = empresaData;
      
      const response = await apiService.put('/empresas/dados', dadosParaSalvar);
      alert('Dados da clínica salvos com sucesso!');
      
      // Recarregar dados do backend para garantir sincronização
      await loadEmpresaData();
      
      // Atualizar o contexto de autenticação com os dados atualizados
      updateEmpresaData(empresaData);
    } catch (error) {
      console.error('Erro ao salvar dados da empresa:', error);
      alert('Erro ao salvar dados da clínica');
    } finally {
      setSaving(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await apiService.getAllUsuarios();
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleCriarUsuario = async () => {
    try {
      setSaving(true);
      const response = await apiService.createUsuario({
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
        telefone: novoUsuario.telefone || undefined,
        password: novoUsuario.password || undefined,
        ativo: true
      });

      if (response.success) {
        if (response.password_temporaria) {
          alert(`Usuário criado com sucesso!\nSenha temporária: ${response.password_temporaria}\n\nIMPORTANTE: Anote esta senha e compartilhe com o usuário.`);
        } else {
          alert('Usuário criado com sucesso com a senha fornecida!');
        }
        setShowNovoUsuarioModal(false);
        setNovoUsuario({ nome: '', email: '', cargo: 'Recepcionista', telefone: '', password: '' });
        await loadUsuarios();
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (cargo: string) => {
    const cargoLower = cargo?.toLowerCase() || '';
    if (cargoLower === 'admin' || cargoLower === 'administrador') {
      return 'bg-blue-100 text-blue-800';
    } else if (cargoLower === 'dentista') {
      return 'bg-green-100 text-green-800';
    } else if (cargoLower === 'recepcionista') {
      return 'bg-purple-100 text-purple-800';
    } else if (cargoLower === 'financeiro') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        
        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP');
          return;
        }

        // Validar tamanho (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert('Arquivo muito grande. Tamanho máximo: 5MB');
          return;
        }

        // Criar FormData para upload
        const formData = new FormData();
        formData.append('file', file);

        // Fazer upload para o backend
        const response = await apiService.post('/empresas/upload-logo', formData);
        
        if (response.success) {
          // Atualizar apenas o contexto de autenticação com a nova logo
          updateEmpresaData({ logo_url: response.logo_url });
          
          // Recarregar dados para sincronizar
          await loadEmpresaData();
          
          alert('Logo enviada com sucesso!');
        } else {
          alert('Erro ao enviar logo');
        }
      } catch (error) {
        console.error('Erro ao fazer upload da logo:', error);
        alert('Erro ao enviar logo');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        <Button 
          icon={Save} 
          onClick={saveEmpresaData}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu de Abas */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Conteúdo das Abas */}
        <div className="lg:col-span-3">
          {activeTab === 'clinic' && (
            <Card title="Dados da Clínica" subtitle="Informações básicas da clínica">
              {!canView('configuracoes') ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">Você não tem permissão para visualizar as configurações da clínica.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Carregando dados da clínica...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome da Clínica
                          </label>
                          <input
                            type="text"
                            value={empresaData.nome}
                            onChange={(e) => setEmpresaData({...empresaData, nome: e.target.value})}
                            disabled={!canEdit('configuracoes')}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Telefone
                          </label>
                          <input
                            type="text"
                            value={empresaData.telefone}
                            onChange={(e) => setEmpresaData({...empresaData, telefone: e.target.value})}
                            disabled={!canEdit('configuracoes')}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={empresaData.email_empresa}
                          onChange={(e) => setEmpresaData({...empresaData, email_empresa: e.target.value})}
                          disabled={!canEdit('configuracoes')}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={empresaData.endereco}
                          onChange={(e) => setEmpresaData({...empresaData, endereco: e.target.value})}
                          disabled={!canEdit('configuracoes')}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={empresaData.cnpj}
                          onChange={(e) => setEmpresaData({...empresaData, cnpj: e.target.value})}
                          disabled={!canEdit('configuracoes')}
                          placeholder="00.000.000/0000-00"
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>


                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Logo da Clínica
                        </label>
                        <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${
                          !canEdit('configuracoes') ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'
                        }`}>
                          {empresa?.logo_url ? (
                            <div className="space-y-4">
                              <img 
                                src={empresa.logo_url} 
                                alt="Logo da clínica" 
                                className="h-20 w-20 mx-auto object-contain"
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Logo atual
                              </p>
                              {canEdit('configuracoes') && (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="logo-upload"
                                />
                              )}
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {canEdit('configuracoes') ? 'Clique para fazer upload da logo' : 'Acesso restrito'}
                              </p>
                              {canEdit('configuracoes') && (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="logo-upload"
                                />
                              )}
                            </div>
                          )}
                          {canEdit('configuracoes') && (
                            <label 
                              htmlFor="logo-upload" 
                              className="block mt-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              {empresa?.logo_url ? 'Alterar logo' : 'Selecionar arquivo'}
                            </label>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'schedule' && (
            <Card title="Horário de Funcionamento" subtitle="Configure os horários individuais para cada dia da semana">
              {!canView('configuracoes') ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">Você não tem permissão para visualizar as configurações de horário.</p>
                </div>
              ) : (
                <div className="space-y-6">
                {/* Configurações por Dia */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Configurações por Dia da Semana
                  </h4>
                  
                  <div className="space-y-6">
                    {[
                      { key: 'monday', label: 'Segunda-feira' },
                      { key: 'tuesday', label: 'Terça-feira' },
                      { key: 'wednesday', label: 'Quarta-feira' },
                      { key: 'thursday', label: 'Quinta-feira' },
                      { key: 'friday', label: 'Sexta-feira' },
                      { key: 'saturday', label: 'Sábado' },
                      { key: 'sunday', label: 'Domingo' }
                    ].map((day) => {
                      const daySchedule = businessHours[day.key as keyof typeof businessHours] || {
                        isWorking: true,
                        startTime: '08:00',
                        endTime: '18:00',
                        lunchBreak: {
                          enabled: true,
                          startTime: '12:00',
                          endTime: '13:00'
                        }
                      };
                      
                      return (
                        <div key={day.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">{day.label}</h5>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={daySchedule.isWorking}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day.key]: {
                                    ...daySchedule,
                                    isWorking: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Funciona</span>
                            </label>
                          </div>
                          
                          {daySchedule.isWorking && (
                            <div className="space-y-4">
                              {/* Horários de Funcionamento */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Horário de Abertura
                                  </label>
                                  <input
                                    type="time"
                                    value={daySchedule.startTime}
                                    onChange={(e) => setBusinessHours({
                                      ...businessHours,
                                      [day.key]: {
                                        ...daySchedule,
                                        startTime: e.target.value
                                      }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Horário de Fechamento
                                  </label>
                                  <input
                                    type="time"
                                    value={daySchedule.endTime}
                                    onChange={(e) => setBusinessHours({
                                      ...businessHours,
                                      [day.key]: {
                                        ...daySchedule,
                                        endTime: e.target.value
                                      }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              
                              {/* Horário de Almoço */}
                              <div>
                                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                                  <input
                                    type="checkbox"
                                    checked={daySchedule.lunchBreak.enabled}
                                    onChange={(e) => setBusinessHours({
                                      ...businessHours,
                                      [day.key]: {
                                        ...daySchedule,
                                        lunchBreak: {
                                          ...daySchedule.lunchBreak,
                                          enabled: e.target.checked
                                        }
                                      }
                                    })}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Ativar horário de almoço</span>
                                </label>
                                
                                {daySchedule.lunchBreak.enabled && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Início do Almoço
                                      </label>
                                      <input
                                        type="time"
                                        value={daySchedule.lunchBreak.startTime}
                                        onChange={(e) => setBusinessHours({
                                          ...businessHours,
                                          [day.key]: {
                                            ...daySchedule,
                                            lunchBreak: {
                                              ...daySchedule.lunchBreak,
                                              startTime: e.target.value
                                            }
                                          }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fim do Almoço
                                      </label>
                                      <input
                                        type="time"
                                        value={daySchedule.lunchBreak.endTime}
                                        onChange={(e) => setBusinessHours({
                                          ...businessHours,
                                          [day.key]: {
                                            ...daySchedule,
                                            lunchBreak: {
                                              ...daySchedule.lunchBreak,
                                              endTime: e.target.value
                                            }
                                          }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview dos Horários */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Preview dos Horários</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    {Object.entries(businessHours).map(([dayKey, schedule]) => {
                      const dayNames = {
                        monday: 'Segunda-feira',
                        tuesday: 'Terça-feira',
                        wednesday: 'Quarta-feira',
                        thursday: 'Quinta-feira',
                        friday: 'Sexta-feira',
                        saturday: 'Sábado',
                        sunday: 'Domingo'
                      };
                      
                      return (
                        <div key={dayKey} className="flex justify-between items-center">
                          <span className="font-medium">{dayNames[dayKey as keyof typeof dayNames]}:</span>
                          <span>
                            {schedule.isWorking ? (
                              <>
                                {schedule.startTime} às {schedule.endTime}
                                {schedule.lunchBreak.enabled && (
                                  <span className="text-gray-600"> (Almoço: {schedule.lunchBreak.startTime} às {schedule.lunchBreak.endTime})</span>
                                )}
                              </>
                            ) : (
                              <span className="text-red-600">Fechado</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'messages' && (
            <Card title="Templates de Mensagens" subtitle="Configure as mensagens automáticas">
              {!canView('mensagens') ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">Você não tem permissão para visualizar os templates de mensagens.</p>
                </div>
              ) : (
                <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem de Boas-vindas
                  </label>
                  <textarea
                    value={settings.messageTemplates.welcome}
                    onChange={(e) => setSettings({
                      ...settings,
                      messageTemplates: {...settings.messageTemplates, welcome: e.target.value}
                    })}
                    disabled={!canEdit('mensagens')}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !canEdit('mensagens') ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Use {nome} para incluir o nome do paciente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmação de Consulta
                  </label>
                  <textarea
                    value={settings.messageTemplates.confirmation}
                    onChange={(e) => setSettings({
                      ...settings,
                      messageTemplates: {...settings.messageTemplates, confirmation: e.target.value}
                    })}
                    disabled={!canEdit('mensagens')}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !canEdit('mensagens') ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Use {nome}, {data}, {horario} para personalizar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lembrete de Retorno
                  </label>
                  <textarea
                    value={settings.messageTemplates.return}
                    onChange={(e) => setSettings({
                      ...settings,
                      messageTemplates: {...settings.messageTemplates, return: e.target.value}
                    })}
                    disabled={!canEdit('mensagens')}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !canEdit('mensagens') ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Envio de Orçamento
                  </label>
                  <textarea
                    value={settings.messageTemplates.budget}
                    onChange={(e) => setSettings({
                      ...settings,
                      messageTemplates: {...settings.messageTemplates, budget: e.target.value}
                    })}
                    disabled={!canEdit('mensagens')}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !canEdit('mensagens') ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Use {nome}, {link} para personalizar"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Variáveis Disponíveis</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{nome}'}</code> - Nome do paciente</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{data}'}</code> - Data da consulta</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{horario}'}</code> - Horário da consulta</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{link}'}</code> - Link do orçamento</p>
                  </div>
                </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'users' && (
            <Card title="Controle de Usuários" subtitle="Gerencie os usuários do sistema">
              {!canView('configuracoes') ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">Você não tem permissão para visualizar o controle de usuários.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Usuários Cadastrados</h4>
                    {canEdit('configuracoes') && (
                      <Button 
                        size="sm" 
                        icon={User}
                        onClick={() => setShowNovoUsuarioModal(true)}
                      >
                        Novo Usuário
                      </Button>
                    )}
                  </div>

                {loadingUsuarios ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando usuários...</p>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum usuário cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {usuario.avatar_url ? (
                            <img
                              src={usuario.avatar_url}
                              alt={usuario.nome}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <h5 className="font-semibold text-gray-900">{usuario.nome}</h5>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                            {usuario.telefone && (
                              <p className="text-xs text-gray-500">{usuario.telefone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(usuario.cargo)}`}>
                            {usuario.cargo}
                          </span>
                          {!usuario.ativo && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                              Inativo
                            </span>
                          )}
                          {canEdit('configuracoes') && (
                            <Button variant="outline" size="sm">Editar</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Níveis de Acesso</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Admin:</strong> Acesso completo a todas as funcionalidades</p>
                    <p><strong>Dentista:</strong> Pode ver e editar pacientes, agenda e relatórios</p>
                    <p><strong>Recepcionista:</strong> Pode gerenciar agenda e mensagens</p>
                  </div>
                </div>
                </div>
              )}
            </Card>
          )}


          {activeTab === 'notifications' && (
            <Card title="Configurações de Notificações" subtitle="Configure as notificações do sistema">
              {!canView('configuracoes') ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">Você não tem permissão para visualizar as configurações de notificações.</p>
                </div>
              ) : (
                <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Confirmações de Consulta</h4>
                      <p className="text-sm text-gray-600">Notificar quando uma consulta for confirmada</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Novos Pacientes</h4>
                      <p className="text-sm text-gray-600">Notificar quando um novo paciente for cadastrado</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Retornos Pendentes</h4>
                      <p className="text-sm text-gray-600">Lembrar sobre retornos que precisam ser agendados</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Mensagens do WhatsApp</h4>
                      <p className="text-sm text-gray-600">Notificar sobre status das mensagens enviadas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Horários de Notificação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início das Notificações
                      </label>
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim das Notificações
                      </label>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Modal Novo Usuário */}
      {showNovoUsuarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Novo Usuário</h2>
              <button
                onClick={() => setShowNovoUsuarioModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <select
                  value={novoUsuario.cargo}
                  onChange={(e) => setNovoUsuario({...novoUsuario, cargo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Admin">Admin</option>
                  <option value="Dentista">Dentista</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Auxiliar">Auxiliar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={novoUsuario.telefone}
                  onChange={(e) => setNovoUsuario({...novoUsuario, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={novoUsuario.password}
                  onChange={(e) => setNovoUsuario({...novoUsuario, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deixe em branco para gerar senha automática"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se deixar em branco, uma senha temporária será gerada automaticamente
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNovoUsuarioModal(false);
                  setNovoUsuario({ nome: '', email: '', cargo: 'Recepcionista', telefone: '', password: '' });
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarUsuario}
                disabled={saving || !novoUsuario.nome || !novoUsuario.email}
              >
                {saving ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}