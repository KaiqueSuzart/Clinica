import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar se o PWA pode ser instalado (após alguns segundos)
    const checkInstallability = setTimeout(() => {
      // Se não apareceu o prompt automático, mostrar botão manual
      if (!deferredPrompt && !isInstalled) {
        // Verificar se tem service worker e manifest
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              setShowInstallButton(true);
            }
          });
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(checkInstallability);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Se não tem o prompt, tentar instalação manual
      alert('Para instalar o app:\n\n1. No Chrome/Edge: Clique nos três pontos (⋮) > "Instalar aplicativo"\n2. Ou procure o ícone de instalação na barra de endereços\n3. No mobile: Menu > "Adicionar à tela inicial"');
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    } else {
      console.log('Usuário rejeitou a instalação');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (isInstalled) {
    return null; // Não mostrar nada se já está instalado
  }

  if (!showInstallButton) {
    return null; // Não mostrar se não deve aparecer
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-sm border border-blue-700 animate-fade-in">
      <div className="flex items-center space-x-3">
        <Download className="w-5 h-5 text-white" />
        <div className="flex-1">
          <h3 className="font-semibold text-white">Instalar App</h3>
          <p className="text-sm text-blue-100">Instale o app para acesso rápido</p>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}





