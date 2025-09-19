import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Teste Simples - Funcionando!</h1>
      <p>Se você está vendo isso, o React está funcionando.</p>
      <p>Data/Hora: {new Date().toLocaleString()}</p>
    </div>
  );
}
