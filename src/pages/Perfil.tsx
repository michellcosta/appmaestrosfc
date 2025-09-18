import React from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Mail, Shield } from 'lucide-react';

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
              <p className='text-sm text-zinc-500'>Entre com sua conta Google para acessar todas as funcionalidades</p>
            </div>
            <Button onClick={signInWithGoogle} className='w-full'>
              <Mail className='w-4 h-4 mr-2' />
              Entrar com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4'>
      <h1 className='text-xl font-semibold'>Perfil</h1>
      
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
                <Badge variant="secondary" className='mt-2'>
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Informações da Conta</h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-zinc-500'>ID do Usuário:</span>
              <span className='text-sm font-mono'>{user.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-zinc-500'>E-mail:</span>
              <span className='text-sm'>{user.email || 'Não informado'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-zinc-500'>Nome:</span>
              <span className='text-sm'>{user.name || 'Não informado'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-zinc-500'>Tipo de Acesso:</span>
              <Badge variant="outline">{user.role || 'Não definido'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Estatísticas</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center p-4 bg-zinc-50 rounded-lg'>
              <div className='text-2xl font-bold text-emerald-600'>0</div>
              <div className='text-sm text-zinc-500'>Gols</div>
            </div>
            <div className='text-center p-4 bg-zinc-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>0</div>
              <div className='text-sm text-zinc-500'>Assistências</div>
            </div>
            <div className='text-center p-4 bg-zinc-50 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>0</div>
              <div className='text-sm text-zinc-500'>Partidas</div>
            </div>
            <div className='text-center p-4 bg-zinc-50 rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>0</div>
              <div className='text-sm text-zinc-500'>Votos</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
