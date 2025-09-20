import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Home, 
  DollarSign, 
  User,
  Star,
  Zap,
  Crown
} from 'lucide-react';

export default function RestrictedAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-6 h-6 text-purple-600' />;
      case 'admin': return <Shield className='w-6 h-6 text-blue-600' />;
      case 'aux': return <Zap className='w-6 h-6 text-green-600' />;
      case 'mensalista': return <Star className='w-6 h-6 text-purple-600' />;
      case 'diarista': return <Zap className='w-6 h-6 text-orange-600' />;
      default: return <User className='w-6 h-6 text-gray-600' />;
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'owner': return '👑 Dono';
      case 'admin': return '🛡️ Admin';
      case 'aux': return '⚡ Auxiliar';
      case 'mensalista': return '⭐ Mensalista';
      case 'diarista': return '💫 Diarista';
      default: return 'Usuário';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-role-owner/10 text-role-owner border-role-owner/20';
      case 'admin': return 'bg-role-admin/10 text-role-admin border-role-admin/20';
      case 'aux': return 'bg-role-aux/10 text-role-aux border-role-aux/20';
      case 'mensalista': return 'bg-role-mensalista/10 text-role-mensalista border-role-mensalista/20';
      case 'diarista': return 'bg-role-diarista/10 text-role-diarista border-role-diarista/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getAccessiblePages = (role?: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
      case 'aux':
      case 'mensalista':
        return [
          { icon: Home, label: 'Jogos', path: '/' },
          { icon: DollarSign, label: 'Financeiro', path: '/finance' },
          { icon: User, label: 'Perfil', path: '/perfil' },
        ];
      case 'diarista':
        return [
          { icon: Home, label: 'Jogos', path: '/' },
          { icon: DollarSign, label: 'Financeiro', path: '/finance' },
          { icon: User, label: 'Perfil', path: '/perfil' },
        ];
      default:
        return [];
    }
  };

  const accessiblePages = getAccessiblePages(user?.role);

  return (
    <div className='p-4 sm:p-6 space-y-6 pb-20'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Shield className='w-6 h-6 text-red-500' />
          Acesso Restrito
        </h1>
        <p className='text-sm text-zinc-500'>Esta página não está disponível para seu tipo de usuário</p>
      </div>

      <Card>
        <CardContent className='p-6 space-y-4'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto'>
              <Shield className='w-8 h-8 text-red-600' />
            </div>
            
            <div>
              <h2 className='text-lg font-semibold'>Página Não Disponível</h2>
              <p className='text-sm text-zinc-500'>
                Você não tem permissão para acessar esta funcionalidade
              </p>
            </div>

            {user && (
              <div className='flex items-center justify-center gap-2'>
                {getRoleIcon(user.role)}
                <Badge className={getRoleColor(user.role)}>
                  {getRoleName(user.role)}
                </Badge>
              </div>
            )}
          </div>

          <div className='border-t pt-4'>
            <h3 className='text-sm font-semibold text-zinc-700 mb-3'>
              Páginas Disponíveis:
            </h3>
            <div className='grid grid-cols-1 gap-2'>
              {accessiblePages.map((page) => (
                <Button
                  key={page.path}
                  variant="outline"
                  className='w-full justify-start h-12'
                  onClick={() => navigate(page.path)}
                >
                  <page.icon className='w-4 h-4 mr-3' />
                  <span className='font-medium'>{page.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className='pt-4'>
            <Button
              className='w-full'
              onClick={() => navigate('/')}
            >
              <Home className='w-4 h-4 mr-2' />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
