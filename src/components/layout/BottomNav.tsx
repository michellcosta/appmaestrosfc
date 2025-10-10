import { useAuth } from '@/auth/OfflineAuthProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart3, Home, Trophy, User } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Sistema de navegação otimizado

  // Não mostrar o BottomNav na página de login
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const menuItems = [
    { href: '/home', label: 'Jogos', icon: Home },
    { href: '/match', label: 'Partida', icon: Trophy },
    // { href: '/finance', label: 'Financeiro', icon: DollarSign }, // DESABILITADO - Sistema financeiro removido
    { href: '/ranking', label: 'Ranking', icon: BarChart3 },
    { href: '/perfil', label: 'Perfil', icon: User },
  ];

  const handleNavigation = (href: string, label: string) => {
    try {
      // Navegação com React Router
      navigate(href);
    } catch (error) {
      console.error('Erro na navegação:', error);
      // Fallback para navegação direta
      try {
        window.location.href = href;
      } catch (directError) {
        console.error('Erro na navegação direta:', directError);
      }
    }
  };

  // Verificar se há algum item ativo
  const hasActiveItem = menuItems.some(item => pathname === item.href);

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t shadow-xl transition-colors duration-300
      ${isDark
        ? "bg-black/95 border-green-500"
        : "bg-white/95 border-green-500"
      }
    `}>
      <div className="max-w-4xl mx-auto px-3">
        <div className={`flex items-center py-3 ${hasActiveItem ? 'justify-center' : 'justify-around'}`}>
          {menuItems.map((item, index) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href, item.label)}
                className={`
                  group relative flex items-center transition-all duration-500 ease-out
                  ${active
                    ? "bg-green-500 text-white rounded-xl px-4 py-3 shadow-lg"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-800 rounded-full p-3 mx-1"
                      : "text-gray-600 hover:bg-gray-100 rounded-full p-3 mx-1"
                  }
                  transform hover:scale-105 active:scale-95
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  width: active ? 'auto' : '48px',
                  minWidth: active ? '120px' : '48px'
                }}
              >
                {/* Efeito de brilho para item ativo */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl opacity-90 animate-pulse"></div>
                )}

                {/* Conteúdo com z-index para ficar acima do brilho */}
                <div className="relative z-10 flex items-center">
                  <Icon className={`
                    transition-all duration-500 ease-out flex-shrink-0
                    ${active
                      ? "w-6 h-6 text-white"
                      : isDark
                        ? "w-6 h-6 text-gray-300 group-hover:text-green-400"
                        : "w-6 h-6 text-gray-600 group-hover:text-green-500"
                    }
                  `} />

                  <span className={`
                    font-medium transition-all duration-500 ease-out overflow-hidden
                    ${active
                      ? "ml-3 opacity-100 max-w-xs"
                      : "ml-0 opacity-0 max-w-0"
                    }
                    whitespace-nowrap
                  `}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
