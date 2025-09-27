import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Crown, Target, Shield, Sparkles } from 'lucide-react';
import { type Figurinha } from '@/utils/figurinhas';
import { rarityConfig } from '@/utils/figurinhas';

interface AchievementUnlockAnimationProps {
  figurinha: Figurinha;
  onComplete: () => void;
  isVisible: boolean;
}

export function AchievementUnlockAnimation({ 
  figurinha, 
  onComplete, 
  isVisible 
}: AchievementUnlockAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'celebration' | 'exit'>('entrance');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Fase de entrada
      setAnimationPhase('entrance');
      
      // Criar partículas
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000
      }));
      setParticles(newParticles);

      // Transição para celebração
      setTimeout(() => {
        setAnimationPhase('celebration');
      }, 1000);

      // Finalizar animação
      setTimeout(() => {
        setAnimationPhase('exit');
        setTimeout(onComplete, 500);
      }, 4000);
    }
  }, [isVisible, onComplete]);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-8 w-8 text-green-400" />;
      case 'rare': return <Zap className="h-8 w-8 text-blue-400" />;
      case 'epic': return <Trophy className="h-8 w-8 text-purple-400" />;
      case 'legendary': return <Crown className="h-8 w-8 text-yellow-400" />;
      case 'mythic': return <Target className="h-8 w-8 text-pink-400" />;
      case 'unique': return <Shield className="h-8 w-8 text-yellow-300" />;
      default: return <Star className="h-8 w-8" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className={`
        relative transform transition-all duration-1000
        ${animationPhase === 'entrance' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        ${animationPhase === 'exit' ? 'scale-75 opacity-0' : ''}
      `}>
        {/* Card principal */}
        <div className={`
          relative p-8 rounded-2xl shadow-2xl border-4
          bg-gradient-to-br ${figurinha.color} ${rarityConfig[figurinha.rarity].bgColor}
          border-${figurinha.rarity === 'unique' ? 'yellow' : 'current'}-300
          dark:border-${figurinha.rarity === 'unique' ? 'yellow' : 'current'}-600
          ${animationPhase === 'celebration' ? 'animate-pulse' : ''}
        `}>
          {/* Efeito de brilho */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Conteúdo */}
          <div className="relative z-10 text-center space-y-6">
            {/* Ícone da figurinha */}
            <div className="text-8xl">
              {figurinha.emoji}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                {figurinha.name}
              </h2>
              <p className="text-white/90 text-lg">
                {figurinha.description}
              </p>
            </div>

            {/* Raridade */}
            <div className="flex items-center justify-center gap-2">
              {getRarityIcon(figurinha.rarity)}
              <span className="text-white font-semibold text-lg">
                {rarityConfig[figurinha.rarity].name}
              </span>
            </div>

            {/* Mensagem de conquista */}
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-300">
                🎉 CONQUISTA DESBLOQUEADA! 🎉
              </div>
              <div className="text-white/80">
                Parabéns! Você desbloqueou uma nova figurinha!
              </div>
            </div>
          </div>

          {/* Efeitos especiais removidos para evitar problemas de animação */}
        </div>

        {/* Efeito de explosão removido para evitar problemas de animação */}
      </div>
    </div>
  );
}

// Componente para múltiplas animações
interface AchievementUnlockQueueProps {
  queue: Figurinha[];
  onComplete: () => void;
}

export function AchievementUnlockQueue({ queue, onComplete }: AchievementUnlockQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      setIsAnimating(true);
    }
  }, [queue, isAnimating]);

  const handleComplete = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsAnimating(false);
      onComplete();
    }
  };

  if (queue.length === 0 || !isAnimating) return null;

  return (
    <AchievementUnlockAnimation
      figurinha={queue[currentIndex]}
      onComplete={handleComplete}
      isVisible={true}
    />
  );
}
