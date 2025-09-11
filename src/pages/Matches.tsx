import React, { useState } from 'react';
import { ActionSheet } from '@/components/ActionSheet';
import { withinRadius, type LatLng } from '@/services/location';
import { cn } from '@/lib/utils'; // se não tiver, remova o uso de cn

export default function MatchesPage() {
  const [showRouteSheet, setShowRouteSheet] = useState(false);

  const center: LatLng = { lat: -23.55052, lng: -46.633308 }; // exemplo (SP)
  const campo: LatLng = { lat: -23.558, lng: -46.64 };
  const perto = withinRadius(center, campo, 2000); // 2km

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Partidas</h1>

      <div className="text-sm">
        Campo {perto ? 'está' : 'não está'} a até 2km do ponto de referência.
      </div>

      <button className="px-3 py-2 rounded bg-slate-700 text-white" onClick={() => setShowRouteSheet(true)}>
        Ver rotas
      </button>

      <ActionSheet
        open={showRouteSheet}              // <- corrigido (era isOpen)
        onClose={() => setShowRouteSheet(false)}
        title="Rotas"
      >
        <div>Conteúdo do sheet de rotas…</div>
      </ActionSheet>
    </div>
  );
}
