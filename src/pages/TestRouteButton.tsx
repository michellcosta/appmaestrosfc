import React from 'react';
import { RouteButton } from '@/components/RouteButton';

export default function TestRouteButton() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teste das 5 Variações do RouteButton
        </h1>
        
        <div className="grid gap-8">
          {/* Teste 1: Botões Flutuantes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">1. Botões Flutuantes Animados</h2>
            <RouteButton 
              address="Rua das Flores, 123 - São Paulo, SP"
              mode="floating"
            />
          </div>

          {/* Teste 2: Expansível Horizontal */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">2. Botão Expansível Horizontal</h2>
            <RouteButton 
              address="Av. Paulista, 1000 - São Paulo, SP"
              mode="horizontal"
            />
          </div>

          {/* Teste 3: Bottom Sheet Mobile */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">3. Bottom Sheet para Mobile</h2>
            <RouteButton 
              address="Rua Augusta, 500 - São Paulo, SP"
              mode="mobile"
            />
          </div>

          {/* Teste 4: Tooltip Interativo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">4. Tooltip Interativo</h2>
            <RouteButton 
              address="Rua Oscar Freire, 200 - São Paulo, SP"
              mode="tooltip"
            />
          </div>

          {/* Teste 5: Morphing Animation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">5. Animação de Morphing ✨</h2>
            <RouteButton 
              address="Rua da Consolação, 300 - São Paulo, SP"
              mode="morphing"
            />
          </div>
        </div>
      </div>
    </div>
  );
}