import { useEffect, useState } from 'react';

export default function UpdatePrompt() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;

      // Detectar quando o service worker assume controle (após atualização automática)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        setIsUpdating(true);
        // Recarregar automaticamente após atualização
        setTimeout(() => {
          window.location.reload();
        }, 500);
      });

      // Verificar atualizações periodicamente
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            // Verificar atualizações - com autoUpdate, isso vai baixar e aplicar automaticamente
            await registration.update();
          }
        } catch (error) {
          console.error('Erro ao verificar atualizações:', error);
        }
      };

      // Verificar imediatamente ao carregar
      checkForUpdates();

      // Verificar a cada 5 minutos para detectar atualizações rapidamente
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Mostrar notificação apenas durante o processo de atualização
  if (isUpdating) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-sm border border-blue-700 animate-in slide-in-from-bottom-5">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <div>
            <h3 className="font-semibold text-white">Atualizando...</h3>
            <p className="text-sm text-blue-100">Aplicando nova versão automaticamente</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
