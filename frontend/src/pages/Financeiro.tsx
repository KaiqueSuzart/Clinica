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
  const [paymentsSummary, setPaymentsSummary] = useState<{
    total: number;
    quantidade: number;
    por_forma_pagamento: Record<string, number>;
    periodo: {
      inicio: string | null;
      fim: string | null;
    };
  } | null>(null);
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

  // Recarregar resumo de pagamentos quando os filtros de data mudarem
  useEffect(() => {
    const reloadPaymentsSummary = async () => {
      try {
        const summaryData = await apiService.getPaymentsSummary(
          filterDateStart || undefined, 
          filterDateEnd || undefined
        );
        setPaymentsSummary(summaryData);
      } catch (err) {
        console.error('Erro ao recarregar resumo de pagamentos:', err);
      }
    };
    reloadPaymentsSummary();
  }, [filterDateStart, filterDateEnd]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [paymentsData, summaryData, paymentsSummaryData] = await Promise.all([
        apiService.getAllPayments(),
        apiService.getFinancialSummary(),
        apiService.getPaymentsSummary(filterDateStart || undefined, filterDateEnd || undefined)
      ]);
      
      setPayments(paymentsData);
      setSummary(summaryData);
      setPaymentsSummary(paymentsSummaryData);
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Gerencie pagamentos e receitas da clínica
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAppointment(null);
            setShowRegisterModal(true);
          }}
          icon={Plus}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Registrar Pagamento</span>
          <span className="sm:hidden">Registrar</span>
        </Button>
      </div>

      {/* Resumo Financeiro */}
      {paymentsSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Recebido</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {formatCurrency(paymentsSummary?.total || 0)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total de Pagamentos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {paymentsSummary?.quantidade || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Por forma de pagamento */}
          {paymentsSummary?.por_forma_pagamento && typeof paymentsSummary.por_forma_pagamento === 'object' 
            ? Object.entries(paymentsSummary.por_forma_pagamento).slice(0, 2).map(([method, value]) => (
                <Card key={method}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getPaymentMethodLabel(method as PaymentMethod)}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {formatCurrency(value as number)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                      {getPaymentMethodIcon(method as PaymentMethod)}
                    </div>
                  </div>
                </Card>
              ))
            : null}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Paciente, procedimento, valor..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value as PaymentMethod | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterConfirmed}
              onChange={(e) => setFilterConfirmed(e.target.value as 'all' | 'true' | 'false')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:px-0">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Data</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Paciente</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Procedimento</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Forma de Pagamento</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatDate(payment.data_pagamento)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm">
                          <div className="min-w-0">
                            <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
                              {payment.paciente_nome || `Paciente ${payment.paciente_id}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1 truncate">
                              {payment.consulta_procedimento || payment.descricao || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hidden sm:table-cell truncate">
                          {payment.consulta_procedimento || payment.descricao || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatCurrency(payment.valor)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(payment.forma_pagamento)}
                            <span className="text-gray-900 dark:text-gray-100">
                              {getPaymentMethodLabel(payment.forma_pagamento)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
          </div>
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

