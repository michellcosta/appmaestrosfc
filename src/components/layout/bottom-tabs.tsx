import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Trophy, DollarSign, BarChart3, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pt } from '@/i18n/pt';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const BottomTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      id: 'matches',
      label: pt.navigation.matches,
      icon: <Calendar className="w-5 h-5" />,
      path: '/',
    },
    {
      id: 'match',
      label: pt.navigation.match,
      icon: <Trophy className="w-5 h-5" />,
      path: '/match',
    },
    {
      id: 'financial',
      label: pt.navigation.financial,
      icon: <DollarSign className="w-5 h-5" />,
      path: '/financial',
    },
    {
      id: 'ranking',
      label: pt.navigation.ranking,
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/ranking',
    },
    {
      id: 'chat',
      label: pt.navigation.chat,
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/chat',
    },
    {
      id: 'profile',
      label: pt.navigation.profile,
      icon: <User className="w-5 h-5" />,
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-tabbar border-t border-border shadow-xl">
      <div className="flex h-tabbar">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200",
                "hover:bg-accent/50 active:scale-95",
                isActive && "text-tabbar-active"
              )}
            >
              <div className={cn(
                "transition-transform duration-200",
                isActive && "scale-110"
              )}>
                {tab.icon}
              </div>
              <span className={cn(
                "text-xs font-medium",
                !isActive && "text-tabbar-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};