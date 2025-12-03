import { useEffect, useState } from 'react';
import { Download, CheckCircle, Info, X } from 'lucide-react';
import Button from '../UI/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPromptCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSimpleDialog, setShowSimpleDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [pwaStatus, setPwaStatus] = useState<{
    serviceWorker: boolean;
    manifest: boolean;
    icons: boolean;
    installable: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    console.log('🔍 InstallPromptCard: Iniciando verificação...');
    
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App já está instalado');
      setIsInstalled(true);
      return;
    }

    // Verificar status completo do PWA
    const checkPWAStatus = async () => {
      const status = {
        serviceWorker: false,
        manifest: false,
        icons: false,
        installable: false,
        reason: ''
      };

      // Verificar Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          status.serviceWorker = !!registration;
          console.log('🔧 Service Worker:', registration ? 'Registrado' : 'Não registrado');
          setHasServiceWorker(!!registration);
        } catch (error) {
          console.error('❌ Erro ao verificar service worker:', error);
          status.reason = 'Erro ao verificar service worker';
        }
      } else {
        status.reason = 'Service Worker não suportado neste navegador';
      }

      // Verificar Manifest
      try {
        const manifestResponse = await fetch('/manifest.webmanifest');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          status.manifest = true;
          status.icons = !!(manifest.icons && manifest.icons.length > 0);
          console.log('📄 Manifest:', 'OK', { icons: status.icons });
        } else {
          status.reason = 'Manifest não encontrado';
          console.error('❌ Manifest não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar manifest:', error);
        status.reason = 'Erro ao carregar manifest';
      }

      // Verificar se é instalável
      status.installable = status.serviceWorker && status.manifest && status.icons;
      
      if (!status.installable && !status.reason) {
        if (!status.serviceWorker) status.reason = 'Service Worker não registrado';
        else if (!status.manifest) status.reason = 'Manifest não encontrado';
        else if (!status.icons) status.reason = 'Ícones não configurados';
      }

      setPwaStatus(status);
      console.log('📊 Status do PWA:', status);

      // Mostrar botão se tiver service worker ou após alguns segundos
      if (status.serviceWorker) {
        console.log('✅ Service Worker encontrado, mostrando botão');
        setShowInstallButton(true);
      } else {
        console.log('⚠️ Service Worker não encontrado ainda');
        setTimeout(() => {
          setShowInstallButton(true);
        }, 2000);
      }
    };

    checkPWAStatus();

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 Evento beforeinstallprompt disparado!');
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

    // Verificar novamente após alguns segundos
    const checkInstallability = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        checkPWAStatus();
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(checkInstallability);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    console.log('🔘 Botão clicado!', { deferredPrompt: !!deferredPrompt });
    
    // Se tiver o prompt automático, usar ele (isso vai abrir o prompt do navegador)
    if (deferredPrompt) {
      try {
        console.log('🎯 Mostrando prompt de instalação do navegador...');
        // Mostrar o prompt de instalação - isso abre o diálogo nativo do navegador
        await deferredPrompt.prompt();

        // Aguardar a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ Usuário aceitou a instalação');
          setIsInstalled(true);
        } else {
          console.log('❌ Usuário rejeitou a instalação');
        }
        
        setDeferredPrompt(null);
        return;
      } catch (error) {
        console.error('❌ Erro ao mostrar prompt de instalação:', error);
        // Se der erro, mostrar diálogo
        setDialogMessage('Não foi possível abrir o prompt de instalação automaticamente.\n\nPor favor, procure o ícone de instalação (⬇️) na barra de endereços do navegador ou use o menu (três pontos → Instalar aplicativo).');
        setShowSimpleDialog(true);
      }
    }

    // Se não tiver prompt automático, o navegador não permite instalação programática
    // Mostrar diálogo simples
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      setDialogMessage('Para instalar no celular:\n\n1. Toque nos três pontos (⋮) no menu do navegador\n2. Selecione "Adicionar à tela inicial"\n3. Confirme a instalação');
    } else {
      setDialogMessage('O navegador não permitiu a instalação automática.\n\n✅ SOLUÇÃO RÁPIDA:\n\n1. Procure o ícone de instalação (⬇️) na barra de endereços (ao lado da URL)\n2. OU clique nos três pontos (⋮) → "Instalar aplicativo"\n\nO aplicativo está pronto para instalação!');
    }
    setShowSimpleDialog(true);
  };

  if (isInstalled) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">App Instalado</h3>
            <p className="text-sm text-green-700 dark:text-green-300">O aplicativo já está instalado no seu dispositivo.</p>
          </div>
        </div>
      </div>
    );
  }

  // Sempre mostrar o card, mesmo se não tiver o prompt ainda
  const isDev = window.location.hostname === 'localhost' && 
               (window.location.port === '5173' || window.location.port === '');
  
  return (
    <>
      {/* Diálogo Simples */}
      {showSimpleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  📱 Como Instalar
                </h3>
                <button
                  onClick={() => setShowSimpleDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
                {dialogMessage}
              </p>
              <Button
                onClick={() => setShowSimpleDialog(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Instruções */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Info className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Como Instalar o Aplicativo
                </h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isDev ? (
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                    <p className="font-bold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ Instalação não disponível em modo desenvolvimento
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      Na porta 5173 (modo dev), o navegador <strong>não permite instalação</strong> por segurança.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        ✅ Para instalar o aplicativo:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Abra o terminal na pasta <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono">Clinica/frontend</code></li>
                        <li>Execute: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">npm run build</code></li>
                        <li>Execute: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">npm run preview</code></li>
                        <li>Acesse <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">http://localhost:4173</code></li>
                        <li>Na porta 4173, o botão de instalação funcionará normalmente</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      📍 Procure o ícone de instalação na barra de endereços (⬇️)
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      O ícone aparece ao lado da URL quando o app pode ser instalado.
                    </p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">📋 Como instalar:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Procure o <strong>ícone de instalação (⬇️)</strong> na <strong>barra de endereços</strong></li>
                    <li>OU clique nos <strong>três pontos (⋮)</strong> → <strong>"Instalar aplicativo"</strong></li>
                    <li>No mobile: Menu → <strong>"Adicionar à tela inicial"</strong></li>
                  </ol>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Entendi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instalar Aplicativo</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Instale o aplicativo no seu dispositivo para acesso rápido e funcionamento offline.
            </p>
            
            {/* Aviso importante para modo dev */}
            {isDev && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ Instalação não disponível em modo desenvolvimento
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      Na porta 5173 (modo dev), o navegador <strong>não permite instalação</strong> por segurança. 
                      Esta é uma limitação do navegador, não do aplicativo.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        ✅ Para instalar o aplicativo:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-2">
                        <li>Abra o terminal na pasta do projeto</li>
                        <li>Execute: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run build</code></li>
                        <li>Execute: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run preview</code></li>
                        <li>Acesse <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:4173</code></li>
                        <li>Na porta 4173, o botão de instalação funcionará normalmente</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de instalação - sempre mostrar */}
            <Button
              onClick={handleInstallClick}
              icon={Download}
              className="bg-blue-600 hover:bg-blue-700 text-white mb-3"
            >
              {deferredPrompt ? 'Instalar Agora' : 'Instalar Aplicativo'}
            </Button>
            
            {/* Mensagem informativa */}
            {!deferredPrompt && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  <strong>Por que não funciona automaticamente?</strong>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  O navegador tem critérios rígidos para mostrar o prompt automático (tempo de uso, engajamento, etc.). Isso é uma <strong>decisão do navegador</strong>, não um problema técnico.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>✅ Solução:</strong> Procure o ícone de instalação (⬇️) na barra de endereços ou use o menu (⋮) → "Instalar aplicativo". O PWA está pronto para instalação!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Status do PWA</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Service Worker:</span>
            <span className={hasServiceWorker ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {hasServiceWorker ? '✓ Ativo' : '✗ Inativo'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Manifest:</span>
            <span className={pwaStatus?.manifest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {pwaStatus?.manifest ? '✓ OK' : '✗ Erro'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ícones:</span>
            <span className={pwaStatus?.icons ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {pwaStatus?.icons ? '✓ OK' : '✗ Erro'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Instalável:</span>
            <span className={pwaStatus?.installable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {pwaStatus?.installable ? '✓ Sim' : '✗ Não'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Instalado:</span>
            <span className={isInstalled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {isInstalled ? '✓ Sim' : 'Não'}
            </span>
          </div>
          {pwaStatus?.reason && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200">
              <strong>Motivo:</strong> {pwaStatus.reason}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>💡 Dica:</strong> Se não aparecer o botão de instalação:
          </p>
          <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1 ml-2">
            <li>Abra DevTools (F12) → Application → Manifest</li>
            <li>Procure o botão "Add to homescreen" ou "Instalar"</li>
            <li>OU procure o ícone (⬇️) na barra de endereços</li>
            <li>Limpe o cache do navegador e recarregue</li>
          </ol>
        </div>
      </div>
    </div>
    </>
  );
}

