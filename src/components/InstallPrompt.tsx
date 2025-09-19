import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi,
  CheckCircle,
  ArrowDown
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

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSource, setInstallSource] = useState<'browser' | 'manual'>('browser');
  const { success, error } = useToastHelpers();

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Verificar se está em modo standalone (iOS)
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Só mostrar se não foi dispensado recentemente
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
        setInstallSource('browser');
      }
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      success('App instalado!', 'O App Maestros FC foi instalado com sucesso!');
    };

    // Listener para detectar se está em modo standalone
    const handleDisplayModeChange = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    // Mostrar prompt manual após 10 segundos se não houver prompt automático
    // e se não foi dispensado recentemente
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('installPromptDismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const now = Date.now();
      const hoursSinceDismissed = dismissedTime ? (now - dismissedTime) / (1000 * 60 * 60) : 24;
      
      if (!deferredPrompt && !isInstalled && hoursSinceDismissed >= 24) {
        setShowInstallPrompt(true);
        setInstallSource('manual');
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled, success]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Prompt nativo do browser
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        success('Instalando...', 'O app está sendo instalado!');
      } else {
        error('Instalação cancelada', 'Você pode instalar depois pelo menu do browser');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // Instruções manuais
      setShowInstallPrompt(false);
      success('Instruções enviadas', 'Verifique as instruções de instalação');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Mostrar novamente em 24 horas
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Verificar se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
      
      if (hoursSinceDismissed < 24) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Instalar App Maestros FC</h3>
                <p className="text-sm text-zinc-500">Acesse mais rápido e fácil</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Acesso direto pela tela inicial</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <span className="text-sm">Funciona offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Experiência nativa</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              {installSource === 'browser' ? 'Instalar Agora' : 'Ver Instruções'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-4"
            >
              Depois
            </Button>
          </div>

          {/* Instruções para iOS */}
          {installSource === 'manual' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📱 Para iPhone/iPad:
              </h4>
              <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>1. Toque no botão de compartilhar (📤) na barra inferior</li>
                <li>2. Role para baixo e toque em "Adicionar à Tela Inicial"</li>
                <li>3. Toque em "Adicionar" no canto superior direito</li>
                <li>4. O app aparecerá na sua tela inicial!</li>
              </ol>
            </div>
          )}

          {/* Instruções para Android */}
          {installSource === 'manual' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                🤖 Para Android:
              </h4>
              <ol className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>1. Toque no menu (⋮) no canto superior direito</li>
                <li>2. Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                <li>3. Confirme a instalação</li>
                <li>4. O app aparecerá na sua tela inicial!</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
