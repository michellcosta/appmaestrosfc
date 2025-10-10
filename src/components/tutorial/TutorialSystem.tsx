/**
 * Tutorial System Component
 * Sistema de tutorial interativo com spotlight e tooltips
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle,
  Target,
  Eye,
  MousePointer
} from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content: React.ReactNode;
  action?: 'click' | 'hover' | 'focus' | 'none';
  highlight?: boolean;
  skipable?: boolean;
  autoAdvance?: boolean;
  delay?: number; // em ms
}

export interface TutorialConfig {
  theme: 'light' | 'dark' | 'auto';
  showProgress: boolean;
  allowSkip: boolean;
  autoPlay: boolean;
  showSpotlight: boolean;
  showOverlay: boolean;
  animationDuration: number;
}

interface TutorialSystemProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  config?: Partial<TutorialConfig>;
  isOpen: boolean;
  onClose: () => void;
}

const TutorialSystem: React.FC<TutorialSystemProps> = ({
  steps,
  onComplete,
  onSkip,
  config = {},
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const defaultConfig: TutorialConfig = {
    theme: 'auto',
    showProgress: true,
    allowSkip: true,
    autoPlay: false,
    showSpotlight: true,
    showOverlay: true,
    animationDuration: 300,
    ...config
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Encontrar elemento alvo
  useEffect(() => {
    if (isOpen && currentStepData) {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
        
        // Scroll para o elemento se necessário
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      } else {
        console.warn(`Elemento não encontrado: ${currentStepData.target}`);
      }
    }
  }, [isOpen, currentStep, currentStepData]);

  // Auto-advance
  useEffect(() => {
    if (isPlaying && currentStepData?.autoAdvance && currentStepData.delay) {
      const timer = setTimeout(() => {
        handleNext();
      }, currentStepData.delay);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, currentStepData]);

  // Posicionar tooltip
  useEffect(() => {
    if (targetElement && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = targetElement.getBoundingClientRect();
      
      // Calcular posição baseada na configuração
      let top = 0;
      let left = 0;
      
      switch (currentStepData.position) {
        case 'top':
          top = rect.top - tooltip.offsetHeight - 10;
          left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
          left = rect.left - tooltip.offsetWidth - 10;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
          left = rect.right + 10;
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltip.offsetHeight / 2;
          left = window.innerWidth / 2 - tooltip.offsetWidth / 2;
          break;
      }
      
      // Ajustar posição se sair da tela
      if (top < 0) top = 10;
      if (left < 0) left = 10;
      if (top + tooltip.offsetHeight > window.innerHeight) {
        top = window.innerHeight - tooltip.offsetHeight - 10;
      }
      if (left + tooltip.offsetWidth > window.innerWidth) {
        left = window.innerWidth - tooltip.offsetWidth - 10;
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }
  }, [targetElement, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, defaultConfig.animationDuration);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, defaultConfig.animationDuration);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsPlaying(false);
    onSkip();
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!isOpen || !currentStepData) return null;

  return (
    <>
      {/* Overlay com spotlight */}
      {defaultConfig.showOverlay && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          style={{
            background: targetElement && defaultConfig.showSpotlight
              ? `radial-gradient(circle at ${targetRect?.left + (targetRect?.width || 0) / 2}px ${targetRect?.top + (targetRect?.height || 0) / 2}px, transparent 0px, transparent 100px, rgba(0,0,0,0.5) 120px, rgba(0,0,0,0.8) 100%)`
              : 'rgba(0,0,0,0.8)'
          }}
        />
      )}

      {/* Highlight do elemento alvo */}
      {targetElement && currentStepData.highlight && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetRect?.top,
            left: targetRect?.left,
            width: targetRect?.width,
            height: targetRect?.height,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border transition-all duration-${defaultConfig.animationDuration} ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}
        style={{
          zIndex: 60
        }}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500" />
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} de {steps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {defaultConfig.showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">{currentStepData.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {currentStepData.description}
              </p>
            </div>

            {currentStepData.content && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {currentStepData.content}
              </div>
            )}

            {currentStepData.action && currentStepData.action !== 'none' && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                {currentStepData.action === 'click' && <MousePointer className="w-4 h-4" />}
                {currentStepData.action === 'hover' && <Eye className="w-4 h-4" />}
                {currentStepData.action === 'focus' && <Target className="w-4 h-4" />}
                <span className="capitalize">
                  {currentStepData.action === 'click' && 'Clique no elemento destacado'}
                  {currentStepData.action === 'hover' && 'Passe o mouse sobre o elemento'}
                  {currentStepData.action === 'focus' && 'Foque no elemento destacado'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlay}
                  className="flex items-center space-x-1"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reiniciar</span>
                </Button>
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Anterior</span>
                  </Button>
                )}
                
                {defaultConfig.allowSkip && currentStepData.skipable !== false && (
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Pular
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center space-x-1"
                >
                  <span>
                    {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                  </span>
                  {currentStep < steps.length - 1 && <ArrowRight className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

export default TutorialSystem;



