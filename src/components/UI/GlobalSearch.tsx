import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, FileText, X } from 'lucide-react';
import { patients, appointments, budgets } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'budget';
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simular delay de busca
    const searchTimeout = setTimeout(() => {
      const searchResults: SearchResult[] = [];

      // Buscar pacientes
      patients.forEach(patient => {
        if (patient.name.toLowerCase().includes(query.toLowerCase()) ||
            patient.phone.includes(query)) {
          searchResults.push({
            id: patient.id,
            type: 'patient',
            title: patient.name,
            subtitle: patient.phone,
            icon: User,
            path: '/pacientes'
          });
        }
      });

      // Buscar consultas
      appointments.forEach(appointment => {
        if (appointment.patientName.toLowerCase().includes(query.toLowerCase()) ||
            appointment.procedure.toLowerCase().includes(query.toLowerCase())) {
          searchResults.push({
            id: appointment.id,
            type: 'appointment',
            title: `${appointment.patientName} - ${appointment.procedure}`,
            subtitle: `${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.time}`,
            icon: Calendar,
            path: '/agenda'
          });
        }
      });

      // Buscar orçamentos
      budgets.forEach(budget => {
        if (budget.patientName.toLowerCase().includes(query.toLowerCase())) {
          searchResults.push({
            id: budget.id,
            type: 'budget',
            title: `Orçamento - ${budget.patientName}`,
            subtitle: `R$ ${budget.total.toFixed(2)}`,
            icon: FileText,
            path: '/orcamentos'
          });
        }
      });

      setResults(searchResults.slice(0, 8)); // Limitar a 8 resultados
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Buscar pacientes, consultas, orçamentos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Buscando...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Digite para buscar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}