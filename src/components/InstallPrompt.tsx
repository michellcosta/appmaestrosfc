import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

export default function InstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou o prompt antes
    const hasSeenInstallPrompt = localStorage.getItem('maestros-install-prompt-seen');
    
    // Verificar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!hasSeenInstallPrompt && isMobile) {
      // Aguardar um pouco para carregar a página
      setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    }
  }, []);

  const handleInstall = () => {
    setIsOpen(false);
    localStorage.setItem('maestros-install-prompt-seen', 'true');
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('maestros-install-prompt-seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-green-600">
              📱 Instalar App
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Instale o Maestros FC no seu dispositivo para uma experiência ainda melhor!
          </p>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">📱 Como instalar no celular:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Chrome:</strong> Menu (3 pontos) → "Instalar aplicativo"</p>
              <p><strong>Safari:</strong> Compartilhar → "Adicionar à Tela Inicial"</p>
              <p><strong>Edge:</strong> Menu → "Aplicativos" → "Instalar"</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Acesso Rápido</p>
                <p className="text-xs text-gray-600">Abra direto da tela inicial</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Funciona Offline</p>
                <p className="text-xs text-gray-600">Use mesmo sem internet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Atualizações Automáticas</p>
                <p className="text-xs text-gray-600">Sempre a versão mais recente</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="w-full"
            >
              Agora Não
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500">
            💡 Procure pelo ícone de instalação no seu navegador!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
