import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { getRedirectUri } from '@/utils/googleAuth';
import { useAction } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { createOrUpdateProfile } = useGoogleAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);
  const exchangeCodeAction = useAction(api.googleAuth.exchangeCodeForToken);

  useEffect(() => {
    // Prevenir execução múltipla
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        // Obter o código de autorização da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Erro do Google: ${error}`);
        }

        if (!code) {
          throw new Error('Código de autorização não encontrado');
        }

        console.log('🔄 Processando callback do Google OAuth...');

        // Trocar código por token e obter dados reais do usuário (servidor-side seguro)
        const result = await exchangeCodeAction({
          code,
          redirectUri: getRedirectUri(),
        });

        if (!result.success || !result.userInfo) {
          throw new Error(result.error || 'Falha na autenticação');
        }

        const userInfo = result.userInfo;
        console.log('🔄 Criando perfil para usuário Google:', userInfo);

        // Criar/atualizar perfil no Convex com dados reais
        await createOrUpdateProfile(userInfo.email, userInfo.name, 'owner', userInfo.picture);

        setStatus('success');
        setMessage('✅ Login realizado com sucesso!');

        // Salvar dados do usuário no localStorage para compatibilidade
        const userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar_url: userInfo.picture,
          role: 'owner',
          group_id: `group_${Date.now()}`
        };

        localStorage.setItem('offline_user', JSON.stringify(userData));
        console.log('✅ Usuário salvo no localStorage:', userData);

        // Redirecionar para home após 1 segundo
        setTimeout(() => {
          navigate('/home');
        }, 1000);

      } catch (error: any) {
        console.error('❌ Erro no callback:', error);
        setStatus('error');
        setMessage(`❌ Erro: ${error.message}`);

        // Redirecionar para login após 3 segundos em caso de erro
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, []); // Dependências vazias - executa apenas uma vez

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
            {status === 'loading' && (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Processando login...'}
            {status === 'success' && 'Login realizado!'}
            {status === 'error' && 'Erro no login'}
          </h2>

          <p className="text-gray-600">
            {status === 'loading' && 'Aguarde enquanto processamos seu login com o Google.'}
            {status === 'success' && 'Redirecionando para o app...'}
            {status === 'error' && 'Ocorreu um erro durante o processo de login. Redirecionando...'}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${status === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
