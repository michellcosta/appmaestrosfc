import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, DollarSign, BarChart3, MessageCircle, User, Crown } from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { href: '/', label: 'Jogos', icon: Home },
    { href: '/match', label: 'Partida', icon: Trophy },
    { href: '/finance', label: 'Financeiro', icon: DollarSign },
    { href: '/ranking', label: 'Ranking', icon: BarChart3 },
    { href: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-gradient-dark border-t-2 border-maestros-green shadow-lg"
      aria-label="Navegação inferior"
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
                      : "text-gray-300 hover:bg-gray-800 hover:text-maestros-green-light hover:scale-105"
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
