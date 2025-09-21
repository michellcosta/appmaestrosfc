import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi,
  Star,
  Zap
} from 'lucide-react';
import { useToastHelpers } from '@/components/ui/toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = 'maestros-install-popup-shown';

export default function OneTimeInstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSource, setInstallSource] = useState<'browser' | 'manual'>('browser');
  const { success, error } = useToastHelpers();

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Verificar se está em modo standalone (iOS)
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    // Verificar se o popup já foi mostrado
    const hasBeenShown = localStorage.getItem(STORAGE_KEY);
    
    // Se já foi mostrado ou app já está instalado, não mostrar
    if (hasBeenShown || checkIfInstalled()) {
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallSource('browser');
      
      // Mostrar popup após 3 segundos se não foi mostrado antes
      setTimeout(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setShowPopup(true);
        }
      }, 3000);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPopup(false);
      localStorage.setItem(STORAGE_KEY, 'true');
      success('App instalado!', 'O App Maestros FC foi instalado com sucesso!');
    };

    // Listener para detectar se está em modo standalone
    const handleDisplayModeChange = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowPopup(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    // Fallback: mostrar popup manual após 10 segundos se não houver prompt automático
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !localStorage.getItem(STORAGE_KEY)) {
        setInstallSource('manual');
        setShowPopup(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, isInstalled, success]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Prompt nativo do browser
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          success('Instalando...', 'O app está sendo instalado!');
          localStorage.setItem(STORAGE_KEY, 'true');
        } else {
          error('Instalação cancelada', 'Você pode instalar depois pelo menu do browser');
        }
        
        setDeferredPrompt(null);
        setShowPopup(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (err) {
        console.error('Erro ao instalar:', err);
        error('Erro na instalação', 'Tente novamente pelo menu do browser');
      }
    } else {
      // Instruções manuais
      setShowPopup(false);
      localStorage.setItem(STORAGE_KEY, 'true');
      success('Instruções de instalação', 'Siga as instruções abaixo para instalar o app');
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  // Não mostrar se já está instalado ou se não deve mostrar o popup
  if (isInstalled || !showPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Instalar Maestros FC
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tenha acesso rápido e offline ao app na sua tela inicial
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Acesso instantâneo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Wifi className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Funciona offline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Experiência nativa</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {installSource === 'browser' ? 'Instalar Agora' : 'Ver Instruções'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Instruções para instalação manual */}
          {installSource === 'manual' && (
            <div className="mt-4 space-y-3">
              {/* iOS */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📱 iPhone/iPad:
                </h4>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. Toque no botão de compartilhar (📤)</li>
                  <li>2. Selecione "Adicionar à Tela Inicial"</li>
                  <li>3. Toque em "Adicionar"</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  🤖 Android:
                </h4>
                <ol className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>1. Toque no menu (⋮) do navegador</li>
                  <li>2. Selecione "Instalar app"</li>
                  <li>3. Confirme a instalação</li>
                </ol>
              </div>
            </div>
          )}

          {/* Nota sobre aparecer apenas uma vez */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Esta mensagem aparece apenas uma vez
          </p>
        </CardContent>
      </Card>
    </div>
  );
}