import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  X, 
  RefreshCw,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';

export default function UpdateNotification() {
  const { updateAvailable, isUpdating, updateApp, dismissUpdate } = useAppUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in-right">
      <Card className="bg-gradient-primary text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Nova versão disponível!</h3>
                <p className="text-sm opacity-90">
                  Atualize para ter acesso às últimas funcionalidades
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={updateApp}
                disabled={isUpdating}
                className="bg-white text-blue-600 hover:bg-white/90"
                size="sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Atualizar
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissUpdate}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
