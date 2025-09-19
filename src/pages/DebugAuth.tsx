import React, { useState } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setIsTesting(true);
    addLog('🔍 Testando conexão com Supabase...');
    
    try {
      // Timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout - conexão demorou mais de 10 segundos')), 10000)
      );
      
      const connectionPromise = supabase.from('users').select('count').limit(1);
      
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (result.error) {
        addLog(`❌ Erro na conexão: ${result.error.message}`);
        addLog(`❌ Código do erro: ${result.error.code}`);
        addLog(`❌ Detalhes: ${JSON.stringify(result.error)}`);
      } else {
        addLog('✅ Conexão com Supabase OK');
        addLog(`✅ Dados recebidos: ${JSON.stringify(result.data)}`);
      }
    } catch (err) {
      addLog(`❌ Erro inesperado: ${err}`);
      addLog(`❌ Tipo do erro: ${typeof err}`);
      addLog(`❌ Stack: ${err.stack || 'N/A'}`);
    }
    
    setIsTesting(false);
  };

  const testGoogleAuth = async () => {
    setIsTesting(true);
    addLog('🔍 Testando Google Auth...');
    
    try {
      addLog('📱 Iniciando login com Google...');
      await signInWithGoogle();
      addLog('✅ Login iniciado com sucesso');
    } catch (error: any) {
      addLog(`❌ Erro no login: ${error.message || error}`);
      console.error('Erro detalhado:', error);
    }
    
    setIsTesting(false);
  };

  const checkEnvironment = () => {
    addLog('🔍 Verificando variáveis de ambiente...');
    addLog(`VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}`);
    addLog(`VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}`);
    addLog(`URL atual: ${window.location.origin}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className='p-4 sm:p-6 space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-2'>
            <Button onClick={checkEnvironment} variant="outline">
              Verificar Env
            </Button>
            <Button onClick={testSupabaseConnection} variant="outline" disabled={isTesting}>
              Testar Supabase
            </Button>
            <Button onClick={testGoogleAuth} variant="outline" disabled={isTesting}>
              Testar Google
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Limpar Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Status Atual</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p><strong>Loading:</strong> {loading ? '⏳ Sim' : '✅ Não'}</p>
          <p><strong>Usuário:</strong> {user ? `✅ ${user.name} (${user.role})` : '❌ Não logado'}</p>
          <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 Logs de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto'>
            {logs.length === 0 ? (
              <p className='text-gray-500'>Nenhum log ainda. Clique nos botões acima para testar.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className='mb-1'>{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>🚪 Ações de Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={signOut} variant="destructive" className='w-full'>
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
