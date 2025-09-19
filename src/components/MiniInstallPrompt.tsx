import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function MiniInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Verificar se foi dispensado nesta sessão
      const sessionDismissed = sessionStorage.getItem('miniInstallDismissed');
      const permanentlyDismissed = localStorage.getItem('miniInstallDismissed');
      
      if (!sessionDismissed && !permanentlyDismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Só dispensar para esta sessão, não permanentemente
    sessionStorage.setItem('miniInstallDismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 flex items-center gap-3">
        <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Instalar App
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Acesso rápido e offline
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
