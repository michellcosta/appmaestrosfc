import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, DollarSign, BarChart3, MessageCircle, User, Crown } from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const baseMenuItems = [
    { href: '/', label: 'Jogos', icon: Home },
    { href: '/match', label: 'Partida', icon: Trophy },
    { href: '/finance', label: 'Financeiro', icon: DollarSign },
    { href: '/ranking', label: 'Ranking', icon: BarChart3 },
    { href: '/vote', label: 'Votar', icon: MessageCircle },
    { href: '/perfil', label: 'Perfil', icon: User },
  ];

  // Se for owner, substituir "Perfil" por "Dashboard"
  const menuItems = user?.role === 'owner' 
    ? baseMenuItems.map(item => 
        item.href === '/perfil' 
          ? { href: '/owner-dashboard', label: 'Dashboard', icon: Crown }
          : item
      )
    : baseMenuItems;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-zinc-200"
      aria-label="Navegação inferior"
    >
      <div className="mx-auto max-w-4xl">
        <ul className="grid grid-cols-6 gap-1 p-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={[
                    "flex flex-col items-center justify-center text-xs rounded-lg px-2 py-2 transition-colors",
                    active
                      ? "bg-zinc-100 text-zinc-900 font-semibold"
                      : "text-zinc-600 hover:bg-zinc-50"
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
