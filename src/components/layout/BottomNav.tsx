import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, DollarSign, BarChart3, MessageCircle, User, Crown } from 'lucide-react';
import { useAuth } from '@/auth/SimpleAuthProvider';

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
      className="fixed inset-x-0 bottom-0 z-40 bg-black border-t-2 border-green-500 shadow-lg"
      aria-label="Navegação inferior"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        borderTop: '2px solid #16a34a'
      }}
    >
      <div className="mx-auto max-w-4xl">
        <ul className="grid grid-cols-6 gap-1 p-3">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={[
                    "flex flex-col items-center justify-center text-xs rounded-xl px-2 py-3 transition-all duration-300 transform",
                    active
                      ? "bg-green-500 text-black font-bold shadow-lg scale-105"
                      : "text-gray-300 hover:bg-gray-800 hover:text-green-400 hover:scale-105"
                  ].join(" ")}
                  style={{
                    boxShadow: active ? '0 4px 15px rgba(34, 197, 94, 0.4)' : 'none'
                  }}
                >
                  <Icon className={`w-5 h-5 mb-1 ${active ? 'animate-pulse' : ''}`} />
                  <span className={active ? 'font-bold' : 'font-medium'}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
