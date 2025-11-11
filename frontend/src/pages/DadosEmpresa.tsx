import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Phone, 
  HelpCircle, 
  DollarSign, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/Toast';

interface Procedimento {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
  categoria: string;
  ativo: boolean;
}

interface Horario {
  id: string;
  dia_semana: number;
  abertura: string;
  fechamento: string;
  observacoes: string;
  ativo: boolean;
}

interface Contato {
  id: string;
  tipo: string;
  valor: string;
  principal: boolean;
  ativo: boolean;
}

interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ativo: boolean;
}

export default function DadosEmpresa() {
  const [activeTab, setActiveTab] = useState('procedimentos');
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { showSuccess, showError, ToastContainer } = useToast();

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [procedimentosRes, horariosRes, contatosRes, faqsRes] = await Promise.all([
        fetch('/api/chatbot/data/procedimentos'),
        fetch('/api/chatbot/data/horarios'),
        fetch('/api/chatbot/data/contato'),
        fetch('/api/chatbot/data/faq')
      ]);

      if (procedimentosRes.ok) {
        const data = await procedimentosRes.json();
        setProcedimentos(data.data || []);
      }

      if (horariosRes.ok) {
        const data = await horariosRes.json();
        setHorarios(data.data || []);
      }

      if (contatosRes.ok) {
        const data = await contatosRes.json();
        setContatos(data.data || []);
      }

      if (faqsRes.ok) {
        const data = await faqsRes.json();
        setFaqs(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'procedimentos', label: 'Procedimentos', icon: DollarSign },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'contato', label: 'Contato', icon: Phone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

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
            <Building2 className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            Dados da Empresa
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as informações que o chatbot utiliza para responder aos clientes
          </p>
        </div>
        <Button 
          icon={Plus}
          onClick={() => setShowForm(true)}
        >
          Adicionar
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'procedimentos' && (
        <Card title="Procedimentos e Preços">
          <div className="space-y-4">
            {procedimentos.map((procedimento) => (
              <div key={procedimento.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {procedimento.nome}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {procedimento.descricao}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        R$ {procedimento.preco.toFixed(2)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {procedimento.duracao_minutos} min
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {procedimento.categoria}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" icon={Edit}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" icon={Trash2}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'horarios' && (
        <Card title="Horários de Funcionamento">
          <div className="space-y-4">
            {horarios.map((horario) => (
              <div key={horario.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {diasSemana[horario.dia_semana]}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {horario.abertura} às {horario.fechamento}
                    </p>
                    {horario.observacoes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {horario.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" icon={Edit}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" icon={Trash2}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'contato' && (
        <Card title="Informações de Contato">
          <div className="space-y-4">
            {contatos.map((contato) => (
              <div key={contato.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {contato.tipo}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {contato.valor}
                    </p>
                    {contato.principal && (
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm mt-1">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" icon={Edit}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" icon={Trash2}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'faq' && (
        <Card title="Perguntas Frequentes">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {faq.pergunta}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {faq.resposta}
                    </p>
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm mt-2">
                      {faq.categoria}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" icon={Edit}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" icon={Trash2}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informações para o Chatbot */}
      <Card title="Como o Chatbot Acessa Esses Dados">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Endpoints Disponíveis para o Chatbot:
          </h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><code>GET /api/chatbot/data/procedimentos</code> - Lista todos os procedimentos</p>
            <p><code>GET /api/chatbot/data/horarios</code> - Horários de funcionamento</p>
            <p><code>GET /api/chatbot/data/contato</code> - Informações de contato</p>
            <p><code>GET /api/chatbot/data/faq</code> - Perguntas frequentes</p>
            <p><code>GET /api/chatbot/data/search?query=termo</code> - Buscar informações</p>
            <p><code>GET /api/chatbot/data/empresa</code> - Dados completos da empresa</p>
          </div>
        </div>
      </Card>
    </div>
  );
}









