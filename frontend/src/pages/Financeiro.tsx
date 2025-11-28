import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Filter, Calendar, TrendingUp, CreditCard, Wallet, Smartphone, Building2, Search } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { apiService, Payment, CreatePaymentData, PaymentMethod, FinancialSummary, Patient, Appointment } from '../services/api';
import { usePermissions } from '../contexts/PermissionsContext';
import RegisterPaymentModal from '../components/Payments/RegisterPaymentModal';
import PaymentDetailsModal from '../components/Payments/PaymentDetailsModal';

export default function Financeiro() {
  const permissions = usePermissions();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentToView, setPaymentToView] = useState<Payment | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [filterConfirmed, setFilterConfirmed] = useState<'all' | 'true' | 'false'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, filterDateStart, filterDateEnd, filterPaymentMethod, filterConfirmed]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [paymentsData, summaryData] = await Promise.all([
        apiService.getAllPayments(),
        apiService.getFinancialSummary()
      ]);
      
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.paciente_nome?.toLowerCase().includes(term) ||
        p.descricao?.toLowerCase().includes(term) ||
        p.consulta_procedimento?.toLowerCase().includes(term) ||
        p.valor.toString().includes(term)
      );
    }

    // Filtro de data
    if (filterDateStart) {
      filtered = filtered.filter(p => p.data_pagamento >= filterDateStart);
    }
    if (filterDateEnd) {
      filtered = filtered.filter(p => p.data_pagamento <= filterDateEnd);
    }

    // Filtro de forma de pagamento
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(p => p.forma_pagamento === filterPaymentMethod);
    }

    // Filtro de confirmado
    if (filterConfirmed !== 'all') {
      const isConfirmed = filterConfirmed === 'true';
      filtered = filtered.filter(p => p.confirmado === isConfirmed);
    }

    setFilteredPayments(filtered);
  };

  const handleRegisterPayment = async (data: CreatePaymentData) => {
    try {
      await apiService.createPayment(data);
      await loadData();
      setShowRegisterModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
      throw err;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'dinheiro':
        return <Wallet className="w-4 h-4" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-4 h-4" />;
      case 'pix':
        return <Smartphone className="w-4 h-4" />;
      case 'transferencia':
        return <Building2 className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência',
    };
    return labels[method] || method;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie pagamentos e receitas da clínica
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAppointment(null);
            setShowRegisterModal(true);
          }}
          icon={Plus}
        >
          Registrar Pagamento
        </Button>
      </div>

      {/* Resumo Financeiro */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pagamentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.quantidade}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Por forma de pagamento */}
          {Object.entries(summary.por_forma_pagamento).slice(0, 2).map(([method, value]) => (
            <Card key={method}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getPaymentMethodLabel(method as PaymentMethod)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(value)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  {getPaymentMethodIcon(method as PaymentMethod)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Paciente, procedimento, valor..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value as PaymentMethod | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Todas</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterConfirmed}
              onChange={(e) => setFilterConfirmed(e.target.value as 'all' | 'true' | 'false')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Todos</option>
              <option value="true">Confirmados</option>
              <option value="false">Pendentes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Paciente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Procedimento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Valor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Forma de Pagamento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => {
                      setPaymentToView(payment);
                      setShowPaymentDetails(true);
                    }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {formatDate(payment.data_pagamento)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {payment.paciente_nome || `Paciente ${payment.paciente_id}`}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {payment.consulta_procedimento || payment.descricao || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment.valor)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.forma_pagamento)}
                        <span className="text-gray-900 dark:text-gray-100">
                          {getPaymentMethodLabel(payment.forma_pagamento)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.confirmado
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {payment.confirmado ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Registro de Pagamento */}
      {showRegisterModal && (
        <RegisterPaymentModal
          isOpen={showRegisterModal}
          onClose={() => {
            setShowRegisterModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleRegisterPayment}
          appointment={selectedAppointment}
        />
      )}

      {/* Modal de Detalhes do Pagamento */}
      <PaymentDetailsModal
        isOpen={showPaymentDetails}
        onClose={() => {
          setShowPaymentDetails(false);
          setPaymentToView(null);
        }}
        payment={paymentToView}
      />
    </div>
  );
}

