import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, Zap, Crown, Target, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rarityConfig, type Figurinha } from '@/utils/figurinhas';

interface AchievementNotificationProps {
  figurinha: Figurinha;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AchievementNotification({ 
  figurinha, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'mythic': return <Target className="h-4 w-4" />;
      case 'unique': return <Shield className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transition-all duration-300 transform
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${isAnimating ? 'scale-95 opacity-0' : 'scale-100'}
    `}>
      <Card className={`
        w-80 shadow-2xl border-2
        bg-gradient-to-br ${figurinha.color} ${rarityConfig[figurinha.rarity].bgColor}
        border-${figurinha.rarity === 'unique' ? 'yellow' : 'current'}-300
        dark:border-${figurinha.rarity === 'unique' ? 'yellow' : 'current'}-600
      `}>
        <CardContent className="p-4 relative">
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Conteúdo da notificação */}
          <div className="space-y-3">
            {/* Header com ícone e raridade */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {figurinha.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-white drop-shadow-lg">
                    {figurinha.name}
                  </h3>
                  {getRarityIcon(figurinha.rarity)}
                </div>
                <Badge 
                  className={`
                    bg-gradient-to-r ${figurinha.color} text-white text-xs
                    shadow-lg border-white/30
                  `}
                >
                  {rarityConfig[figurinha.rarity].name}
                </Badge>
              </div>
            </div>

            {/* Descrição */}
            <p className="text-white/90 text-sm drop-shadow-md">
              {figurinha.description}
            </p>

            {/* Efeito de conquista */}
            <div className="flex items-center gap-2 text-yellow-300">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-semibold">
                🎉 CONQUISTA DESBLOQUEADA! 🎉
              </span>
            </div>

            {/* Efeitos visuais removidos para evitar problemas de animação */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para múltiplas notificações
interface AchievementNotificationListProps {
  notifications: Array<{
    id: string;
    figurinha: Figurinha;
    timestamp: number;
    isNew: boolean;
  }>;
  onClose: (id: string) => void;
  maxVisible?: number;
}

export function AchievementNotificationList({ 
  notifications, 
  onClose, 
  maxVisible = 3 
}: AchievementNotificationListProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <AchievementNotification
            figurinha={notification.figurinha}
            onClose={() => onClose(notification.id)}
            autoClose={true}
            duration={6000}
          />
        </div>
      ))}
    </div>
  );
}
