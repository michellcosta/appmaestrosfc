import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, DollarSign, BarChart3, MessageCircle, User, Crown } from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useTheme } from '@/contexts/ThemeContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Não mostrar o BottomNav na página de login
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const menuItems = [
    { href: '/home', label: 'Jogos', icon: Home },
    { href: '/match', label: 'Partida', icon: Trophy },
    { href: '/finance', label: 'Financeiro', icon: DollarSign },
    { href: '/ranking', label: 'Ranking', icon: BarChart3 },
    { href: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-maestros-green shadow-lg"
      aria-label="Navegação inferior"
      style={{
        background: isDark 
          ? 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)' 
          : '#ffffff'
      }}
    >
      <div className="mx-auto max-w-4xl">
        <ul className="grid grid-cols-5 gap-1 p-3">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={[
                    "flex items-center justify-center rounded-xl p-3 transition-all duration-300 transform",
                    active
                      ? "bg-maestros-green text-black font-bold shadow-maestros scale-110"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-maestros-green hover:scale-105"
                  ].join(" ")}
                >
                  <Icon className={`w-6 h-6 ${active ? 'animate-pulse' : ''}`} />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
