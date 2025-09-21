import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function DebugInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const addDebugInfo = (info: string) => {
    console.log('🔍 Debug Install:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Component mounted');

    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      addDebugInfo(`Standalone check: ${isStandalone}, iOS standalone: ${isIOSStandalone}`);
      
      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        addDebugInfo('App is already installed');
        return;
      }
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      addDebugInfo('beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Verificar se foi dispensado
      const dismissed = localStorage.getItem('miniInstallDismissed');
      addDebugInfo(`Dismissed check: ${dismissed}`);
      
      if (!dismissed) {
        setShowPrompt(true);
        addDebugInfo('Showing prompt');
      } else {
        addDebugInfo('Prompt was dismissed, not showing');
      }
    };

    const handleAppInstalled = () => {
      addDebugInfo('App installed event received');
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Forçar mostrar após 3 segundos para debug
    const timer = setTimeout(() => {
      addDebugInfo('Timer triggered - forcing prompt for debug');
      setShowPrompt(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    addDebugInfo('Install button clicked');
    if (deferredPrompt) {
      addDebugInfo('Using deferred prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      addDebugInfo(`Install outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } else {
      addDebugInfo('No deferred prompt available - showing manual instructions');
      // Mostrar instruções manuais
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    addDebugInfo('Dismiss button clicked');
    setShowPrompt(false);
    localStorage.setItem('miniInstallDismissed', 'true');
  };

  const clearDebug = () => {
    localStorage.removeItem('miniInstallDismissed');
    setDebugInfo([]);
    setShowPrompt(false);
    addDebugInfo('Debug cleared');
  };

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-green-100 border border-green-300 rounded-lg p-3">
        <p className="text-green-800 text-sm">✅ App já está instalado!</p>
      </div>
    );
  }

  if (!showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-100 border border-blue-300 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-blue-800 text-sm">🔍 Debug: Prompt não está sendo mostrado</p>
          <Button onClick={clearDebug} size="sm" variant="outline">
            Reset
          </Button>
        </div>
        <div className="mt-2 text-xs text-blue-600 max-h-20 overflow-y-auto">
          {debugInfo.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 flex items-center gap-3">
        <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            🔍 Debug: Instalar App
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Prompt forçado para debug
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
      
      {/* Debug Info */}
      <div className="mt-2 bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs max-h-32 overflow-y-auto">
        <div className="font-semibold mb-1">Debug Info:</div>
        {debugInfo.map((info, i) => (
          <div key={i} className="text-gray-600 dark:text-gray-300">{info}</div>
        ))}
      </div>
      
      {/* Instrucoes manuais quando o evento nativo nao esta disponivel */}
      {showManualInstructions && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
            📱 Como instalar manualmente:
          </h4>
          
          {/* Android Chrome */}
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
            <h5 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
              🤖 Android (Chrome/Edge):
            </h5>
            <ol className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <li>1. Toque no menu (⋮) do navegador</li>
              <li>2. Procure por "Instalar app" ou "Adicionar à tela inicial"</li>
              <li>3. Confirme a instalação</li>
            </ol>
          </div>
          
          {/* iOS Safari */}
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
            <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
              🍎 iPhone/iPad (Safari):
            </h5>
            <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Toque no botão de compartilhar (📤) na barra inferior</li>
              <li>2. Role para baixo e toque em "Adicionar à Tela Inicial"</li>
              <li>3. Toque em "Adicionar" no canto superior direito</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => setShowManualInstructions(false)}
            size="sm" 
            variant="outline"
            className="w-full mt-2"
          >
            Entendi
          </Button>
        </div>
      )}
    </div>
  );
}
