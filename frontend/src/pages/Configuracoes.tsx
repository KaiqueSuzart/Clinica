import React, { useState } from 'react';
import { Settings, Save, User, MessageSquare, Bell, Shield, Clock, Calendar } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { clinicSettings } from '../data/mockData';
import { useBusinessHours } from '../contexts/BusinessHoursContext';

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('clinic');
  const [settings, setSettings] = useState(clinicSettings);
  const { businessHours, setBusinessHours } = useBusinessHours();

  const tabs = [
    { id: 'clinic', label: 'Dados da Clínica', icon: Settings },
    { id: 'schedule', label: 'Horário de Funcionamento', icon: Clock },
    { id: 'messages', label: 'Templates de Mensagens', icon: MessageSquare },
    { id: 'users', label: 'Usuários', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        <Button icon={Save} onClick={() => {
          // Forçar re-renderização
          setBusinessHours({...businessHours});
        }}>Salvar Alterações</Button>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Clínica
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo da Clínica
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">Clique para fazer upload da logo</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'schedule' && (
            <Card title="Horário de Funcionamento" subtitle="Configure os horários individuais para cada dia da semana">
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
            </Card>
          )}

          {activeTab === 'messages' && (
            <Card title="Templates de Mensagens" subtitle="Configure as mensagens automáticas">
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </Card>
          )}

          {activeTab === 'users' && (
            <Card title="Controle de Usuários" subtitle="Gerencie os usuários do sistema">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">Usuários Cadastrados</h4>
                  <Button size="sm" icon={User}>Novo Usuário</Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
                        alt="Dr. Ana Silva"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-gray-900">Dr. Ana Silva</h5>
                        <p className="text-sm text-gray-600">ana@clinica.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Admin
                      </span>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Dr. Pedro Costa</h5>
                        <p className="text-sm text-gray-600">pedro@clinica.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Dentista
                      </span>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Maria Fernandes</h5>
                        <p className="text-sm text-gray-600">maria@clinica.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        Recepcionista
                      </span>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Níveis de Acesso</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Admin:</strong> Acesso completo a todas as funcionalidades</p>
                    <p><strong>Dentista:</strong> Pode ver e editar pacientes, agenda e relatórios</p>
                    <p><strong>Recepcionista:</strong> Pode gerenciar agenda e mensagens</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Configurações de Notificações" subtitle="Configure as notificações do sistema">
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
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}