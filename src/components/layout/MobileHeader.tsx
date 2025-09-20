import React from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Crown, Shield, Star, Zap, User } from 'lucide-react';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function MobileHeader({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-role-default' />;
    }
  };

  return (
    <header 
      className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.role && (
            <div className="flex items-center space-x-1 text-sm text-maestros-green">
              {getRoleIcon(user.role)}
              <span className="hidden sm:inline font-medium">
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
