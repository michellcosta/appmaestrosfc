import React from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LogOut, User, Mail, Shield, Trophy, Target, Calendar, Star } from 'lucide-react';

export default function PerfilPage() {
  const { user, loading, signOut, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className='p-4 sm:p-6'>
        <h1 className='text-xl font-semibold'>Perfil</h1>
        <p className='text-sm text-zinc-500'>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-4 sm:p-6 space-y-4'>
        <h1 className='text-xl font-semibold'>Perfil</h1>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <User className='w-12 h-12 mx-auto text-zinc-400' />
            <div>
              <h3 className='text-lg font-semibold'>Faça login para continuar</h3>
              <p className='text-sm text-zinc-500'>Use o login offline para acessar todas as funcionalidades</p>
            </div>
            <div className='space-y-2'>
              <Button 
                onClick={() => window.location.href = '/offline-auth'} 
                className='w-full'
              >
                <User className='w-4 h-4 mr-2' />
                Login Offline
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Erro no login:', error);
                    alert('Erro ao fazer login. Use o login offline.');
                  }
                }} 
                variant="outline"
                className='w-full'
              >
                <Mail className='w-4 h-4 mr-2' />
                Entrar com Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <div>
        <h1 className='text-xl font-semibold'>Perfil</h1>
        <p className='text-sm text-zinc-500'>Dados do jogador, posição e estrelas</p>
      </div>
      
      {/* Informações do Usuário */}
      <Card>
        <CardContent className='p-6 space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center'>
              <User className='w-8 h-8 text-zinc-600' />
            </div>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold'>{user.name || 'Usuário'}</h2>
              <p className='text-sm text-zinc-500'>{user.email || 'E-mail não disponível'}</p>
              {user.role && (
                <Badge 
                  variant="secondary" 
                  className={`mt-2 ${
                    user.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role === 'owner' ? '👑 Dono' : 
                   user.role === 'admin' ? '🛡️ Admin' : 
                   user.role === 'mensalista' ? '⭐ Mensalista' : 
                   user.role === 'diarista' ? '💫 Diarista' : 
                   user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Navegação */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Estatísticas do Jogador</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-emerald-50 rounded-lg'>
                  <Trophy className='w-6 h-6 text-emerald-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-emerald-600'>12</div>
                  <div className='text-sm text-zinc-500'>Gols</div>
                </div>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <Target className='w-6 h-6 text-blue-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-blue-600'>8</div>
                  <div className='text-sm text-zinc-500'>Assistências</div>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded-lg'>
                  <Calendar className='w-6 h-6 text-purple-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-purple-600'>24</div>
                  <div className='text-sm text-zinc-500'>Partidas</div>
                </div>
                <div className='text-center p-4 bg-orange-50 rounded-lg'>
                  <Star className='w-6 h-6 text-orange-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-orange-600'>4.8</div>
                  <div className='text-sm text-zinc-500'>Avaliação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Conquistas</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg'>
                  <Trophy className='w-5 h-5 text-yellow-600' />
                  <div>
                    <p className='font-medium'>Artilheiro do Mês</p>
                    <p className='text-sm text-zinc-500'>Setembro 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                  <Star className='w-5 h-5 text-green-600' />
                  <div>
                    <p className='font-medium'>Jogador Mais Votado</p>
                    <p className='text-sm text-zinc-500'>Agosto 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                  <div>
                    <p className='font-medium'>Presença Perfeita</p>
                    <p className='text-sm text-zinc-500'>Últimos 3 meses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Configurações da Conta</h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>ID do Usuário:</span>
                  <span className='text-sm font-mono'>{user.id}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>E-mail:</span>
                  <span className='text-sm'>{user.email || 'Não informado'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>Nome:</span>
                  <span className='text-sm'>{user.name || 'Não informado'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>Tipo de Acesso:</span>
                  <Badge variant="outline">{user.role || 'Não definido'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades especiais para Owner */}
          {user.role === 'owner' && (
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <Shield className='w-5 h-5 mr-2 text-purple-600' />
                  Funcionalidades de Dono
                </h3>
                <div className='space-y-3'>
                  <div className='p-3 bg-purple-50 rounded-lg'>
                    <p className='font-medium text-purple-900'>👑 Acesso Total</p>
                    <p className='text-sm text-purple-700'>Você tem acesso completo a todas as funcionalidades do sistema</p>
                  </div>
                  <div className='p-3 bg-blue-50 rounded-lg'>
                    <p className='font-medium text-blue-900'>🛡️ Gerenciamento</p>
                    <p className='text-sm text-blue-700'>Pode gerenciar usuários, convites e configurações</p>
                  </div>
                  <div className='p-3 bg-green-50 rounded-lg'>
                    <p className='font-medium text-green-900'>📊 Relatórios</p>
                    <p className='text-sm text-green-700'>Acesso a relatórios e estatísticas completas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className='pt-4'>
        <Button 
          onClick={signOut} 
          variant="outline" 
          className='w-full'
        >
          <LogOut className='w-4 h-4 mr-2' />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}
