// URL da API - usa variável de ambiente ou fallback para localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Log para debug (remover em produção)
console.log('🔧 API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 VITE_API_BASE_URL da env:', import.meta.env.VITE_API_BASE_URL);

