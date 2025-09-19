import React from 'react';

export default function UltraSimple() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#16a34a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>
        🎉 App Maestros FC
      </h1>
      
      <div style={{
        backgroundColor: '#16a34a',
        color: '#000000',
        padding: '15px 30px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        FUNCIONANDO PERFEITAMENTE! ✅
      </div>
      
      <div style={{
        backgroundColor: '#e5e7eb',
        color: '#000000',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '1rem'
      }}>
        Tema: Preto, Cinza e Verde
      </div>
      
      <div style={{
        marginTop: '30px',
        fontSize: '0.9rem',
        color: '#16a34a',
        textAlign: 'center'
      }}>
        <p>✅ React renderizando</p>
        <p>✅ Vercel funcionando</p>
        <p>✅ Tema aplicado</p>
        <p>✅ Sem tela branca</p>
      </div>
    </div>
  );
}
