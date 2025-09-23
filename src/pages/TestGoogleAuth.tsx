import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGoogleAuth = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      console.log('🔍 Testando Google OAuth...');
      
      // Testar configuração do Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📊 Sessão atual:', session);
      
      if (sessionError) {
        console.error('❌ Erro na sessão:', sessionError);
        setError(`Erro na sessão: ${sessionError.message}`);
        return;
      }

      // Tentar login com Google
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (authError) {
        console.error('❌ Erro no Google OAuth:', authError);
        setError(`Erro no Google OAuth: ${authError.message}`);
        return;
      }

      console.log('✅ Google OAuth iniciado:', data);
      setResult('Google OAuth iniciado com sucesso! Redirecionando...');
      
    } catch (err: any) {
      console.error('❌ Erro geral:', err);
      setError(`Erro geral: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 Configuração do Supabase:');
    console.log('URL:', url);
    console.log('Key:', key ? '✅ Definida' : '❌ Não definida');
    
    setResult(`URL: ${url ? '✅' : '❌'}\nKey: ${key ? '✅' : '❌'}`);
  };

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <div>
        <h1 className='text-xl font-semibold'>Teste Google OAuth</h1>
        <p className='text-sm text-zinc-500'>Verificar configuração do Google OAuth</p>
      </div>

      <Card>
        <CardContent className='p-6 space-y-4'>
          <div className='space-y-2'>
            <Button 
              onClick={checkSupabaseConfig}
              variant="outline"
              className='w-full'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Verificar Configuração
            </Button>
            
            <Button 
              onClick={testGoogleAuth}
              disabled={loading}
              className='w-full'
            >
              <Mail className='w-4 h-4 mr-2' />
              {loading ? 'Testando...' : 'Testar Google OAuth'}
            </Button>
          </div>

          {result && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <CheckCircle className='w-4 h-4 text-green-600' />
                <span className='text-sm text-green-800'>Resultado:</span>
              </div>
              <pre className='text-xs text-green-700 mt-1 whitespace-pre-wrap'>{result}</pre>
            </div>
          )}

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <XCircle className='w-4 h-4 text-red-600' />
                <span className='text-sm text-red-800'>Erro:</span>
              </div>
              <pre className='text-xs text-red-700 mt-1 whitespace-pre-wrap'>{error}</pre>
            </div>
          )}

          <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-4 h-4 text-yellow-600' />
              <span className='text-sm text-yellow-800'>Verificações necessárias:</span>
            </div>
            <ul className='text-xs text-yellow-700 mt-1 space-y-1'>
              <li>• Google OAuth habilitado no Supabase</li>
              <li>• Client ID e Secret configurados</li>
              <li>• Redirect URI: {window.location.origin}/</li>
              <li>• Domínio autorizado no Google Console</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
