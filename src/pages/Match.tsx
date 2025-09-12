import React from 'react';
import { Card } from '@/components/ui/card';

// Versão mínima COM Card (corrigindo a tag fechando corretamente)
export const Matches: React.FC = () => {
  return (
    <div className="p-4">
      <Card className="p-4">
        <h1 className="text-xl font-bold">Partidas</h1>
        <p className="text-muted-foreground text-sm">Versão mínima para isolamento de erro.</p>
      </Card>
    </div>
  );
};
