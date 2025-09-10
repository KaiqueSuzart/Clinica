import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'appointment' | 'message' | 'budget' | 'return';
}

export default function StatusBadge({ status, type = 'appointment' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status.toLowerCase()) {
      case 'confirmado':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'pendente':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case 'cancelado':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'realizado':
        return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      case 'aprovado':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'recusado':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'rascunho':
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
      case 'enviada':
        return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      case 'lida':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'respondida':
        return `${baseClasses} bg-purple-500/20 text-purple-400 border border-purple-500/30`;
      case 'ativo':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'inativo':
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
  };
  
  return (
    <span className={getStatusStyles()}>
      {status}
    </span>
  );
}