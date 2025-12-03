/**
 * Formata telefone para exibição, removendo formato WhatsApp
 * @param phone - Telefone no formato 55{numero}@s.whatsapp.net ou número simples
 * @returns Telefone formatado como (11) 99999-9999 ou número limpo
 */
export const formatPhoneDisplay = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remover formato WhatsApp (55{numero}@s.whatsapp.net)
  let cleaned = phone.replace('@s.whatsapp.net', '').replace(/^55/, '');
  
  // Remover tudo que não é número
  cleaned = cleaned.replace(/\D/g, '');
  
  // Formatar como (11) 99999-9999
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return cleaned;
};

/**
 * Gera link do WhatsApp a partir de um telefone
 * @param phone - Telefone no formato 55{numero}@s.whatsapp.net ou número simples
 * @param message - Mensagem opcional para pré-preencher
 * @returns URL do WhatsApp (wa.me/55{numero})
 */
export const getWhatsAppLink = (phone: string | undefined, message?: string): string => {
  if (!phone) return '';
  
  // Remover formato WhatsApp se existir
  let cleaned = phone.replace('@s.whatsapp.net', '');
  
  // Garantir que começa com 55 (código do Brasil)
  if (!cleaned.startsWith('55')) {
    // Remover 55 se existir no início e depois adicionar
    cleaned = cleaned.replace(/^55/, '');
    cleaned = '55' + cleaned;
  }
  
  // Remover tudo que não é número
  cleaned = cleaned.replace(/\D/g, '');
  
  if (!cleaned || cleaned.length < 10) return '';
  
  let url = `https://wa.me/${cleaned}`;
  
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }
  
  return url;
};

/**
 * Gera link de telefone (tel:) a partir de um telefone
 * @param phone - Telefone no formato 55{numero}@s.whatsapp.net ou número simples
 * @returns URL de telefone (tel:+55{numero})
 */
export const getPhoneLink = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remover formato WhatsApp se existir
  let cleaned = phone.replace('@s.whatsapp.net', '');
  
  // Garantir que começa com 55 (código do Brasil)
  if (!cleaned.startsWith('55')) {
    // Remover 55 se existir no início e depois adicionar
    cleaned = cleaned.replace(/^55/, '');
    cleaned = '55' + cleaned;
  }
  
  // Remover tudo que não é número
  cleaned = cleaned.replace(/\D/g, '');
  
  if (!cleaned || cleaned.length < 10) return '';
  
  return `tel:+${cleaned}`;
};


