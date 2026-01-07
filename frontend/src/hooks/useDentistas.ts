import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useDentistas() {
  const [dentistas, setDentistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDentistas();
  }, []);

  const loadDentistas = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDentistas();
      setDentistas(data);
    } catch (error) {
      console.error('Erro ao carregar dentistas:', error);
      setDentistas([]);
    } finally {
      setLoading(false);
    }
  };

  // Retornar lista formatada para uso em selects (nome do usuário)
  const getDentistasOptions = () => {
    return dentistas.map(dentista => ({
      id: dentista.id,
      nome: dentista.nome,
      value: dentista.nome, // Para compatibilidade com selects existentes
      label: dentista.nome
    }));
  };

  return {
    dentistas,
    loading,
    reload: loadDentistas,
    getDentistasOptions
  };
}



