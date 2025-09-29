import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CheckCircle, AlertCircle, ArrowLeft, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Link } from 'react-router-dom';
import { canCreateOwner, getMainOwnerId, PROTECTION_MESSAGES } from '@/utils/ownerProtection';

export default function CreateOwnerWithGoogle() {
  const { signInWithGoogle, user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Verificar se já existe um owner principal
    const mainOwnerId = getMainOwnerId();
    if (mainOwnerId && user?.id !== mainOwnerId) {
      setIsBlocked(true);
      setError(PROTECTION_MESSAGES.CANNOT_CREATE_OWNER);
    }
  }, [user]);

  const handleCreateOwnerWithGoogle = async () => {
    if (!canCreateOwner(user?.id)) {
      setError(PROTECTION_MESSAGES.CANNOT_CREATE_OWNER);
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      console.log('🔍 Iniciando Google OAuth...');
      
      await signInWithGoogle();
      
      console.log('✅ Google OAuth concluído');
      
      // O FixedAuthProvider já cria automaticamente um usuário com role 'owner'
      // quando alguém faz login com Google pela primeira vez
      
    } catch (error: any) {
      console.error('❌ Erro ao criar owner com Google:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro desconhecido ao fazer login com Google';
      
      if (error.message?.includes('popup_closed')) {
        errorMessage = 'Janela do Google foi fechada. Tente novamente.';
      } else if (error.message?.includes('access_denied')) {
        errorMessage = 'Acesso negado pelo Google. Verifique as configurações.';
      } else if (error.message?.includes('goog_oauth')) {
        errorMessage = 'Erro de configuração OAuth. Verifique configurações Supabase.';
      } else {
        errorMessage = error.message || 'Erro ao conectar com Google';
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Se já está logado como owner, mostrar sucesso
  if (user && user.role === 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Owner Criado com Sucesso!
            </CardTitle>
            <CardDescription>
              Sua conta owner foi criada e você já está logado
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Informações da Conta</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nome:</strong> {user.name}</p>
                <p><strong>Role:</strong> <span className="text-purple-600 font-semibold">Owner</span></p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">✅ Agora você pode:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Acessar a carteira digital com saldo real</li>
                <li>• Fazer transações PIX</li>
                <li>• Gerenciar todos os usuários</li>
                <li>• Acessar todas as funcionalidades do sistema</li>
                <li>• Configurar permissões e acessos</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/dashboard">
                  Ir para Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/finance">
                  Ver Carteira Digital
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se a criação está bloqueada, mostrar mensagem de proteção
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">
              Acesso Restrito
            </CardTitle>
            <CardDescription>
              A criação de novos owners está protegida
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Sistema de Proteção Ativo</span>
              </div>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">🔒 Proteções Ativas:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Apenas o owner principal pode criar novos owners</li>
                <li>• O owner principal não pode ser excluído</li>
                <li>• Sistema protegido contra criação não autorizada</li>
                <li>• Controle total de acesso implementado</li>
              </ul>
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao início
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Criar Conta Owner com Google
          </CardTitle>
          <CardDescription>
            Faça login com sua conta Google para criar automaticamente uma conta owner
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Erro ao criar conta</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 Como funciona:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Clique no botão "Criar Owner com Google"</li>
              <li>2. Faça login com sua conta Google</li>
              <li>3. O sistema criará automaticamente uma conta owner</li>
              <li>4. Você terá acesso completo ao sistema</li>
            </ol>
          </div>

          {/* Configuração status debug */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Status da Configuração
            </h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>❓ Se o botão não estiver funcionando:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Verifique se o Supabase está configurado com Google OAuth</li>
                <li>Confirme se o Vercel tem as variáveis corretas carregadas</li>
                <li>Certifique-se que o redirect URL está no Google Console</li>
                <li>Abra o Console do navegador para ver logs de erro</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Vantagens da conta Owner:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Carteira digital com saldo real</li>
              <li>• Transações PIX funcionais</li>
              <li>• Acesso a todas as funcionalidades</li>
              <li>• Gerenciamento completo do sistema</li>
              <li>• Dados salvos no banco de dados</li>
            </ul>
          </div>

          <Button 
            onClick={handleCreateOwnerWithGoogle}
            disabled={isCreating || loading}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Criando conta...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Criar Owner com Google
              </>
            )}
          </Button>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}