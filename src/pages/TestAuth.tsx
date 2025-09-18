import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TestAuth() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('Testando conexão...');
      setError('');
      
      // Testa a conexão básica
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        setError(`Erro na conexão: ${error.message}`);
        setStatus('❌ Falha na conexão');
      } else {
        setStatus('✅ Conexão OK');
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
      setStatus('❌ Erro na conexão');
    }
  };

  const testGoogleAuth = async () => {
    try {
      setStatus('Testando Google Auth...');
      setError('');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      
      if (error) {
        setError(`Erro no Google Auth: ${error.message}`);
        setStatus('❌ Falha no Google Auth');
      } else {
        setStatus('✅ Google Auth iniciado');
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
      setStatus('❌ Erro no Google Auth');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Teste de Autenticação</h1>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold">Status: {status}</h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
          
          <div className="space-y-2">
            <Button onClick={testConnection} className="w-full">
              Testar Conexão Supabase
            </Button>
            <Button onClick={testGoogleAuth} className="w-full">
              Testar Google Auth
            </Button>
          </div>
          
          <div className="text-sm text-zinc-500">
            <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Usando fallback'}</p>
            <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'Usando fallback'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
