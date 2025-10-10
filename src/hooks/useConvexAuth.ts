import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getGoogleAuthUrl, isGoogleAuthConfigured } from "@/config/googleAuth";
import { useState, useEffect } from "react";

export function useConvexAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query para obter o usuário atual
  const currentUser = useQuery(api.auth.getCurrentUser);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('� Iniciando Google OAuth...');
      
      // Verificar se o Google OAuth está configurado
      if (!isGoogleAuthConfigured()) {
        throw new Error('Google OAuth não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env');
      }
      
      // Redirecionar para Google OAuth
      const authUrl = getGoogleAuthUrl();
      console.log('� Redirecionando para:', authUrl);
      
      window.location.href = authUrl;
      
    } catch (err: any) {
      console.error('❌ Erro no Google OAuth:', err);
      setError(err.message || 'Erro no login com Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('� Fazendo logout...');
      
      // Limpar dados locais
      localStorage.removeItem('offline_user');
      localStorage.removeItem('user_data');
      
      // Recarregar a página
      window.location.reload();
      
      console.log('✅ Logout realizado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro no logout:', err);
      setError(err.message || 'Erro no logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Detectar quando o usuário faz login com sucesso
  useEffect(() => {
    if (currentUser && !loading) {
      console.log('✅ Usuário logado:', currentUser);
    }
  }, [currentUser, loading]);

  return {
    currentUser,
    handleGoogleSignIn,
    handleSignOut,
    loading,
    error,
    isAuthenticated: !!currentUser
  };
}
