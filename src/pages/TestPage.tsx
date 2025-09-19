import React from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestPage() {
  const { user, loading } = useAuth();

  const handleTestLogin = () => {
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'teste@exemplo.com',
      name: 'Usuário Teste',
      role: 'owner' as const
    };
    
    localStorage.setItem('offline_user', JSON.stringify(testUser));
    window.location.reload();
  };

  const handleClearUser = () => {
    localStorage.removeItem('offline_user');
    window.location.reload();
  };

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <CheckCircle className='w-6 h-6 text-green-500' />
          Página de Teste
        </h1>
        <p className='text-sm text-zinc-500'>Teste simples do sistema de autenticação</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Autenticação</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Loading:</span>
            <Badge variant={loading ? 'destructive' : 'secondary'}>
              {loading ? 'Carregando...' : 'Concluído'}
            </Badge>
          </div>
          
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Usuário:</span>
            {user ? (
              <Badge variant='default' className='bg-green-100 text-green-800'>
                <User className='w-3 h-3 mr-1' />
                {user.email} ({user.role})
              </Badge>
            ) : (
              <Badge variant='outline'>Não logado</Badge>
            )}
          </div>

          <div className='space-y-2'>
            <Button onClick={handleTestLogin} className='w-full'>
              <CheckCircle className='w-4 h-4 mr-2' />
              Fazer Login de Teste
            </Button>
            
            <Button onClick={handleClearUser} variant='outline' className='w-full'>
              <AlertCircle className='w-4 h-4 mr-2' />
              Limpar Usuário
            </Button>
          </div>

          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='text-sm font-semibold text-blue-800 mb-2'>Informações de Debug:</h4>
            <div className='text-xs text-blue-700 space-y-1'>
              <p>• localStorage offline_user: {localStorage.getItem('offline_user') ? 'Presente' : 'Ausente'}</p>
              <p>• User state: {user ? JSON.stringify(user) : 'null'}</p>
              <p>• Loading state: {loading.toString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
