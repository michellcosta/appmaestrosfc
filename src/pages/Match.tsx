import React from 'react';

// Versão ultra básica do /matches para isolar erro de runtime.
// Sem imports internos (Card, i18n, utils, ícones).
// Mantém o mesmo tipo de export (named) que o App.tsx espera.
export const Matches: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 24, fontWeight: 700 }}>
        Partidas
      </h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
        Tela mínima para diagnosticar o erro. Se ainda quebrar, o problema não está neste arquivo.
      </p>
    </div>
  );
};
