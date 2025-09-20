import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Home, 
  Trophy, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  Crown,
  Settings,
  LogOut,
  User,
  Shield,
  Star,
  Zap,
  Menu,
  Palette
} from 'lucide-react';

import { usePermissions } from '@/hooks/usePermissions';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileDrawer({ isOpen, onClose }: DrawerProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    canSeeRanking, 
    canSeeVote, 
    canSeeDashboard, 
    canRequestToPlay, 
    canPayDaily 
  } = usePermissions();

  const handleLogout = async () => {
    try {
      await signOut();
      alert('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-gray-600' />;
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

  const menuItems = [
    { icon: Home, label: 'Jogos', path: '/', show: true },
    { icon: Trophy, label: 'Partidas', path: '/match', show: true },
    { icon: DollarSign, label: 'Financeiro', path: '/finance', show: true },
    { icon: BarChart3, label: 'Ranking', path: '/ranking', show: canSeeRanking() },
    { icon: Crown, label: 'Dashboard', path: '/owner-dashboard', show: canSeeDashboard() },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in-left">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-maestros text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">App Maestros FC</h2>
                <p className="text-sm opacity-90">Sistema de Gestão</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-maestros rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name || 'Usuário'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.email || 'email@exemplo.com'}
                </p>
                {user?.role && (
                  <Badge className={`mt-1 text-xs ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1">{getRoleName(user.role)}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-2">
              {menuItems.map((item) => {
                if (!item.show) return null;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start h-12 mb-1 text-gray-700 dark:text-gray-200 hover:bg-maestros-green/10 hover:text-maestros-green dark:hover:bg-maestros-green/20 dark:hover:text-maestros-green transition-colors"
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 border-maestros-green/20">
            <div className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-gray-700 dark:text-gray-200 hover:bg-maestros-green/10 hover:text-maestros-green dark:hover:bg-maestros-green/20 dark:hover:text-maestros-green transition-colors"
                  onClick={() => {
                    navigate('/perfil');
                    onClose();
                  }}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="font-medium">Configurações</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-medium">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook para controlar o drawer
export function useMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
}
