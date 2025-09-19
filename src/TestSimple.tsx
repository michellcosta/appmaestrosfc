import React from 'react';

export default function TestSimple() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000', 
      color: '#16a34a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>🎉 App Maestros FC Funcionando!</h1>
      <p>Se você está vendo isso, o React está renderizando!</p>
      <div style={{
        backgroundColor: '#16a34a',
        color: '#000',
        padding: '10px 20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        Tema: Preto, Cinza e Verde ✅
      </div>
    </div>
  );
}
