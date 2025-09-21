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
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
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
              className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors"
              title="Acesso rápido ao Dashboard do Owner"
            >
              <Crown className="w-4 h-4 text-purple-600" />
            </Button>
          )}
          
          {user?.role && user.role !== 'owner' && (
            <div className="flex items-center space-x-1 text-sm text-maestros-green">
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
