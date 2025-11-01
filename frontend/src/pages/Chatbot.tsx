import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Settings, 
  MessageSquare, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  TestTube,
  Save,
  RefreshCw
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/Toast';

interface ChatbotConfig {
  n8nWebhookUrl: string;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ChatbotStats {
  totalMessages: number;
  activePatients24h: number;
  isEnabled: boolean;
  lastUpdate: string;
}

export default function Chatbot() {
  const [config, setConfig] = useState<ChatbotConfig>({
    n8nWebhookUrl: '',
    isEnabled: false
  });
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showError('Erro ao carregar configurações do chatbot');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/chatbot/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/chatbot/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        showSuccess('Configurações salvas com sucesso!');
        await loadConfig();
        await loadStats();
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showError('Erro ao salvar configurações do chatbot');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await fetch('/api/chatbot/test-connection', {
        method: 'POST',
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        showSuccess('Conexão com n8n estabelecida com sucesso!');
      } else {
        showError(`Erro na conexão: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      showError('Erro ao testar conexão com n8n');
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof ChatbotConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Bot className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            Configuração do Chatbot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure e gerencie a integração com seu chatbot n8n
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={() => {
              loadConfig();
              loadStats();
            }}
          >
            Atualizar
          </Button>
          <Button 
            icon={TestTube} 
            onClick={testConnection}
            loading={testing}
            disabled={!config.n8nWebhookUrl}
          >
            Testar Conexão
          </Button>
        </div>
      </div>

      {/* Status do Chatbot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              config.isEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {config.isEnabled ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
              <p className={`text-lg font-semibold ${
                config.isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {config.isEnabled ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total de Mensagens</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalMessages || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Activity className="w-12 h-12 text-purple-600 dark:text-purple-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pacientes Ativos (24h)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.activePatients24h || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Settings className="w-12 h-12 text-orange-600 dark:text-orange-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Última Atualização</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Configurações do n8n">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL do Webhook n8n
              </label>
              <input
                type="url"
                value={config.n8nWebhookUrl}
                onChange={(e) => handleInputChange('n8nWebhookUrl', e.target.value)}
                placeholder="https://seu-n8n.com/webhook/chatbot"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL do webhook do seu workflow n8n
              </p>
            </div>


            <div className="flex items-center">
              <input
                type="checkbox"
                id="isEnabled"
                checked={config.isEnabled}
                onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Ativar chatbot
              </label>
            </div>

            <Button 
              icon={Save} 
              onClick={saveConfig}
              loading={saving}
              className="w-full"
            >
              Salvar Configurações
            </Button>
          </div>
        </Card>

        {/* Teste de Conexão */}
        <Card title="Teste de Conexão">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Teste a conexão com seu workflow n8n para verificar se está funcionando corretamente.
            </p>

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  )}
                  <span className={`font-medium ${
                    testResult.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResult.message}
                  </span>
                </div>
                {testResult.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {testResult.error}
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Como configurar no n8n:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Crie um webhook no seu workflow n8n</li>
                <li>Copie a URL do webhook</li>
                <li>Cole a URL no campo acima</li>
                <li>Configure a chave da API se necessário</li>
                <li>Teste a conexão</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card title="Informações do Sistema">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Endpoint do Webhook
            </h4>
            <code className="block p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              POST /api/chatbot/webhook
            </code>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use este endpoint no seu n8n para enviar mensagens para o sistema
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Formato da Mensagem
            </h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
{`{
  "patientId": "uuid",
  "content": "texto da mensagem",
  "messageType": "text",
  "sender": "patient",
  "metadata": {}
}`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
