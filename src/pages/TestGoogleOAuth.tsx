import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function TestGoogleOAuth() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGoogleAuth = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      console.log('🔍 Testando Google OAuth...');
      
      // Verificar configuração do Supabase
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('📊 Configuração do Supabase:');
      console.log('URL:', url);
      console.log('Key:', key ? '✅ Definida' : '❌ Não definida');
      
      if (!url || !key) {
        setError('❌ Variáveis de ambiente do Supabase não configuradas');
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
        setError(`❌ Erro no Google OAuth: ${authError.message}`);
        return;
      }

      console.log('✅ Google OAuth iniciado:', data);
      setResult('✅ Google OAuth iniciado com sucesso! Redirecionando...');
      
    } catch (err: any) {
      console.error('❌ Erro geral:', err);
      setError(`❌ Erro geral: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Configuração do Supabase:');
    console.log('URL:', url);
    console.log('Key:', key ? '✅ Definida' : '❌ Não definida');
    
    setResult(`📊 Configuração do Supabase:\nURL: ${url ? '✅' : '❌'}\nKey: ${key ? '✅' : '❌'}`);
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
              <span className='text-sm text-yellow-800'>Passos para configurar:</span>
            </div>
            <ol className='text-xs text-yellow-700 mt-2 space-y-1 list-decimal list-inside'>
              <li>Google Cloud Console: Criar OAuth 2.0 Client ID</li>
              <li>Adicionar Redirect URI: {window.location.origin}/</li>
              <li>Supabase Dashboard: Authentication → Providers</li>
              <li>Habilitar Google e configurar Client ID/Secret</li>
              <li>Testar com este botão</li>
            </ol>
          </div>

          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <ExternalLink className='w-4 h-4 text-blue-600' />
              <span className='text-sm text-blue-800'>Links úteis:</span>
            </div>
            <div className='text-xs text-blue-700 mt-2 space-y-1'>
              <div>• Google Cloud Console: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline" title="Abrir Google Cloud Console em nova aba">console.cloud.google.com</a></div>
              <div>• Supabase Dashboard: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline" title="Abrir Supabase Dashboard em nova aba">supabase.com/dashboard</a></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
