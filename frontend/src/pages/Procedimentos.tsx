import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Clock, DollarSign, Tag, Filter, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/Toast';
import { apiService, Procedure, CreateProcedureData } from '../services/api';

interface ProcedureFormData {
  nome: string;
  descricao: string;
  categoria: string;
  preco_estimado: string;
  tempo_estimado_min: string;
  ativo: boolean;
  observacoes: string;
}

export default function Procedimentos() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState<ProcedureFormData>({
    nome: '',
    descricao: '',
    categoria: '',
    preco_estimado: '',
    tempo_estimado_min: '',
    ativo: true,
    observacoes: ''
  });

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadProcedures();
    loadCategorias();
  }, [showActiveOnly]);

  useEffect(() => {
    filterProcedures();
  }, [searchTerm, selectedCategoria, procedures]);

  const loadProcedures = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getProcedures(undefined, showActiveOnly ? true : undefined);
      setProcedures(response.data);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
      showError('Erro ao carregar procedimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await apiService.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const filterProcedures = () => {
    let filtered = procedures;

    if (searchTerm) {
      filtered = filtered.filter(proc =>
        proc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter(proc => proc.categoria === selectedCategoria);
    }

    setFilteredProcedures(filtered);
  };

  const handleOpenModal = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setFormData({
        nome: procedure.nome,
        descricao: procedure.descricao || '',
        categoria: procedure.categoria || '',
        preco_estimado: procedure.preco_estimado?.toString() || '',
        tempo_estimado_min: procedure.tempo_estimado_min?.toString() || '',
        ativo: procedure.ativo !== false,
        observacoes: procedure.observacoes || ''
      });
    } else {
      setEditingProcedure(null);
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        preco_estimado: '',
        tempo_estimado_min: '',
        ativo: true,
        observacoes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcedure(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: CreateProcedureData = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        categoria: formData.categoria || undefined,
        preco_estimado: formData.preco_estimado ? parseFloat(formData.preco_estimado) : undefined,
        tempo_estimado_min: formData.tempo_estimado_min ? parseInt(formData.tempo_estimado_min) : undefined,
        ativo: formData.ativo,
        observacoes: formData.observacoes || undefined
      };

      if (editingProcedure) {
        await apiService.updateProcedure(editingProcedure.id, data);
        showSuccess('Procedimento atualizado com sucesso!');
      } else {
        await apiService.createProcedure(data);
        showSuccess('Procedimento criado com sucesso!');
      }

      handleCloseModal();
      loadProcedures();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
      showError('Erro ao salvar procedimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente desativar este procedimento?')) {
      return;
    }

    try {
      await apiService.deleteProcedure(id);
      showSuccess('Procedimento desativado com sucesso!');
      loadProcedures();
    } catch (error) {
      console.error('Erro ao deletar procedimento:', error);
      showError('Erro ao desativar procedimento');
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Procedimentos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie o catálogo de procedimentos da clínica
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Procedimento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filtro por Categoria */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Toggle Ativos */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Apenas ativos
                </span>
              </label>
            </div>
          </div>

          {/* Info de Filtros Ativos */}
          {(searchTerm || selectedCategoria) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Filtros ativos:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  "{searchTerm}"
                </span>
              )}
              {selectedCategoria && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {selectedCategoria}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-2"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Procedimentos */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredProcedures.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {procedures.length === 0
                ? 'Nenhum procedimento cadastrado'
                : 'Nenhum procedimento encontrado com os filtros aplicados'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcedures.map((procedure) => (
            <Card key={procedure.id}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {procedure.nome}
                    </h3>
                    {procedure.categoria && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {procedure.categoria}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(procedure)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(procedure.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {procedure.descricao && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {procedure.descricao}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">{formatCurrency(procedure.preco_estimado)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(procedure.tempo_estimado_min)}</span>
                  </div>
                </div>

                {!procedure.ativo && (
                  <div className="mt-3 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded text-center">
                    Inativo
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Procedimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Limpeza, Extração, etc."
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    list="categorias-list"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Preventivo, Estético, Cirúrgico, etc."
                  />
                  <datalist id="categorias-list">
                    {categorias.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Descrição detalhada do procedimento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Valor Estimado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor Estimado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.preco_estimado}
                      onChange={(e) => setFormData({ ...formData, preco_estimado: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Tempo Estimado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tempo Estimado (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tempo_estimado_min}
                      onChange={(e) => setFormData({ ...formData, tempo_estimado_min: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="60"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>

                {/* Ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Procedimento ativo
                  </label>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProcedure ? 'Salvar Alterações' : 'Criar Procedimento'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

