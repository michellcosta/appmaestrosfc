import React from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, Crown, Shield, Star, Zap, User } from 'lucide-react';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
};

export default function MobileHeader({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-purple-600' />;
      case 'admin': return <Shield className='w-4 h-4 text-blue-600' />;
      case 'aux': return <Zap className='w-4 h-4 text-green-600' />;
      case 'mensalista': return <Star className='w-4 h-4 text-purple-600' />;
      case 'diarista': return <Zap className='w-4 h-4 text-orange-600' />;
      default: return <User className='w-4 h-4 text-gray-600' />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.role && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              {getRoleIcon(user.role)}
              <span className="hidden sm:inline">
                {user.role === 'owner' ? 'Dono' : 
                 user.role === 'admin' ? 'Admin' : 
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
