import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Crown, Shield, Star, Zap, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export default function MobileHeader({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-purple-600 dark:text-purple-400' />;
      case 'admin': return <Shield className='w-4 h-4 text-blue-600 dark:text-blue-400' />;
      case 'aux': return <Zap className='w-4 h-4 text-green-600 dark:text-green-400' />;
      case 'mensalista': return <Star className='w-4 h-4 text-purple-600 dark:text-purple-400' />;
      case 'diarista': return <Zap className='w-4 h-4 text-orange-600 dark:text-orange-400' />;
      default: return <User className='w-4 h-4 text-gray-600 dark:text-gray-400' />;
    }
  };

  return (
    <header 
      className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-zinc-400">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botão de acesso rápido ao Owner Dashboard */}
          {user?.role === 'owner' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/owner-dashboard')}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              title="Acesso rápido ao Dashboard do Owner"
            >
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </Button>
          )}
          
          {user?.role && user.role !== 'owner' && (
            <div className="flex items-center space-x-1 text-sm text-maestros-green dark:text-green-400">
              {getRoleIcon(user.role)}
              <span className="hidden sm:inline font-medium">
                {user.role === 'admin' ? 'Admin' : 
                 user.role === 'aux' ? 'Auxiliar' : 
                 user.role === 'mensalista' ? 'Mensalista' : 
                 user.role === 'diarista' ? 'Diarista' : 
                 'Usuário'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
