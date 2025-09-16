import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Shield, Save, Edit3, Camera, CreditCard } from 'lucide-react';
import { useAuth } from '../components/Auth/AuthProvider';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import SubscriptionCard from '../components/Subscription/SubscriptionCard';
import { apiService } from '../services/api';

export default function Perfil() {
  const { user, empresa, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cargo: user?.cargo || '',
    bio: user?.bio || '',
  });

  // Carregar dados do perfil quando o componente monta
  useEffect(() => {
    loadPerfilData();
  }, []);

  const loadPerfilData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPerfilUsuario();
      
      if (response) {
        setFormData({
          nome: response.nome || '',
          email: response.email || '',
          telefone: response.telefone || '',
          cargo: response.cargo || '',
          bio: response.bio || '',
        });
        
        // Atualizar o contexto do usuário
        if (updateUser) {
          updateUser(response);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback para dados do contexto de auth
      setFormData({
        nome: user?.nome || '',
        email: user?.email || '',
        telefone: user?.telefone || '',
        cargo: user?.cargo || '',
        bio: user?.bio || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        nome: formData.nome,
        telefone: formData.telefone,
      };

      const response = await apiService.updatePerfilUsuario(updateData);
      if (response.success) {
        // Atualizar o contexto do usuário
        if (updateUser) {
          updateUser(response.data);
        }
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      cargo: user?.cargo || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          icon={isEditing ? Save : Edit3}
          disabled={loading}
        >
          {isEditing ? 'Cancelar' : 'Editar Perfil'}
        </Button>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Informações Pessoais
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscription'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Assinatura e Pagamentos
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto e informações básicas */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold text-gray-700 dark:text-gray-200">
                  {user?.nome?.charAt(0) || 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {user?.nome || 'Usuário'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.cargo || 'Funcionário'}</p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'dentista' ? 'Dentista' : 
                   user?.role === 'recepcionista' ? 'Recepcionista' : 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações detalhadas */}
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{user?.nome || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{user?.email || 'Não informado'}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{formData.telefone || 'Não informado'}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>


            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  onClick={handleSave} 
                  icon={Save}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Informações da empresa */}
        <Card>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Informações da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Empresa
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{empresa?.nome || 'Não informado'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email da Empresa
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{empresa?.email_empresa || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        </div>
      ) : (
        <SubscriptionCard />
      )}
    </div>
  );
}
