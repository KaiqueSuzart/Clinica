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


