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
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pendente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelado':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'realizado':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'aprovado':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'recusado':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'rascunho':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'enviada':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'lida':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'respondida':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'ativo':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inativo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  
  return (
    <span className={getStatusStyles()}>
      {status}
    </span>
  );
}