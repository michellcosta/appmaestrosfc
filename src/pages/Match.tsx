import React from 'react';

// Versão mínima SEM Card (zero dependências internas)
export const Matches: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Partidas</h1>
      <p className="text-muted-foreground text-sm">Versão mínima para isolamento de erro.</p>
    </div>
  );
};
