import React, { useState } from 'react';
import { MessageSquare, Filter, Send, Clock, CheckCircle, Eye } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import { messages } from '../data/mockData';

export default function Mensagens() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const messageTypes = ['confirmacao', 'lembrete', 'retorno', 'orcamento'];
  const messageStatuses = ['enviada', 'lida', 'respondida'];

  const filteredMessages = messages.filter(message => {
    const typeMatch = selectedType === 'all' || message.type === selectedType;
    const statusMatch = selectedStatus === 'all' || message.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const getMessageIcon = (status: string) => {
    switch (status) {
      case 'enviada':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'lida':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'respondida':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      confirmacao: 'Confirmação',
      lembrete: 'Lembrete',
      retorno: 'Retorno',
      orcamento: 'Orçamento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens WhatsApp</h1>
          <p className="text-gray-600">Log das mensagens automáticas enviadas via n8n</p>
        </div>
        <Button icon={MessageSquare}>Nova Mensagem</Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos os tipos</option>
            {messageTypes.map(type => (
              <option key={type} value={type}>{getTypeLabel(type)}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos os status</option>
            {messageStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Send className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Enviadas</p>
              <p className="text-xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'enviada').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Lidas</p>
              <p className="text-xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'lida').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Respondidas</p>
              <p className="text-xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'respondida').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Mensagens */}
      <Card title="Histórico de Mensagens" subtitle={`${filteredMessages.length} mensagens encontradas`}>
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getMessageIcon(message.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{message.patientName}</h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                        {getTypeLabel(message.type)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(message.sentAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(message.sentAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <StatusBadge status={message.status} type="message" />
                  <Button variant="outline" size="sm">Reenviar</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}