import React from 'react';

function AppRouterSimple() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>Teste Simples - App Funcionando!</h1>
      <p>Se você está vendo esta mensagem, o React está carregando corretamente.</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Status:</h2>
        <ul>
          <li>✅ React carregado</li>
          <li>✅ Vite funcionando</li>
          <li>✅ Componente renderizado</li>
        </ul>
      </div>
    </div>
  );
}

export default AppRouterSimple;