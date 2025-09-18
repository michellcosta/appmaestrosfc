import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Trophy, Users, DollarSign, BarChart3 } from 'lucide-react';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou o popup antes
    const hasSeenWelcome = localStorage.getItem('maestros-welcome-seen');
    
    if (!hasSeenWelcome) {
      // Aguardar um pouco para carregar a página
      setTimeout(() => {
        setIsOpen(true);
      }, 2000);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('maestros-welcome-seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-green-600">
              🏆 Bem-vindo ao Maestros FC!
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
            Organize suas peladas com facilidade e controle total!
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Jogos</span>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Times</span>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Financeiro</span>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Ranking</span>
            </div>
          </div>
          
          <div className="text-center">
            <Button onClick={handleClose} className="w-full">
              Começar a Usar! 🚀
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500">
            💡 Dica: Instale o app no seu celular para uma experiência ainda melhor!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
