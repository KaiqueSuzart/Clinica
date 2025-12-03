import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useProcedimentos() {
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcedimentos();
  }, []);

  const loadProcedimentos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProcedures(undefined, true); // Buscar apenas procedimentos ativos
      setProcedimentos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
      setProcedimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getProcedimentosOptions = () => {
    // Agrupar por categoria
    const categorias: { [key: string]: any[] } = {};
    const semCategoria: any[] = [];

    procedimentos.forEach(proc => {
      if (proc.categoria) {
        if (!categorias[proc.categoria]) {
          categorias[proc.categoria] = [];
        }
        categorias[proc.categoria].push(proc);
      } else {
        semCategoria.push(proc);
      }
    });

    // Retornar lista de opções com categorias
    const options: any[] = [];
    
    // Adicionar procedimentos padrão (sem categoria ou categoria padrão)
    if (categorias['Padrão'] || semCategoria.length > 0) {
      const padrao = categorias['Padrão'] || semCategoria;
      padrao.forEach(proc => {
        options.push({
          id: proc.id,
          nome: proc.nome,
          value: proc.nome,
          label: proc.nome,
          categoria: 'Padrão'
        });
      });
    }

    // Adicionar outras categorias
    Object.keys(categorias).forEach(categoria => {
      if (categoria !== 'Padrão') {
        categorias[categoria].forEach(proc => {
          options.push({
            id: proc.id,
            nome: proc.nome,
            value: proc.nome,
            label: proc.nome,
            categoria: categoria
          });
        });
      }
    });

    return options;
  };

  const getProcedimentosPorCategoria = () => {
    const categorias: { [key: string]: any[] } = {};
    const semCategoria: any[] = [];

    procedimentos.forEach(proc => {
      if (proc.categoria) {
        if (!categorias[proc.categoria]) {
          categorias[proc.categoria] = [];
        }
        categorias[proc.categoria].push(proc);
      } else {
        semCategoria.push(proc);
      }
    });

    return { categorias, semCategoria };
  };

  return {
    procedimentos,
    loading,
    reload: loadProcedimentos,
    getProcedimentosOptions,
    getProcedimentosPorCategoria
  };
}

