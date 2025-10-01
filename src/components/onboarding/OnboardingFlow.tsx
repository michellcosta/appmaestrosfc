/**
 * Onboarding Flow Component
 * Sistema completo de onboarding para novos usuários
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Star, Users, Shield, Zap } from 'lucide-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  isCompleted: boolean;
  isOptional: boolean;
  estimatedTime: number; // em segundos
}

export interface OnboardingConfig {
  showProgress: boolean;
  allowSkip: boolean;
  autoAdvance: boolean;
  showEstimatedTime: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
  config?: Partial<OnboardingConfig>;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
  config = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const defaultConfig: OnboardingConfig = {
    showProgress: true,
    allowSkip: true,
    autoAdvance: false,
    showEstimatedTime: true,
    theme: 'auto',
    ...config
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Nexus Play!',
      description: 'Sua plataforma completa para gerenciar times de futebol',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Star className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bem-vindo ao Nexus Play!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Sua plataforma completa para gerenciar times de futebol, organizar jogos e acompanhar o desempenho dos jogadores.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center space-y-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium">Gerencie Jogadores</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium">Segurança Total</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              <span className="text-sm font-medium">Performance</span>
            </div>
          </div>
        </div>
      ),
      isCompleted: false,
      isOptional: false,
      estimatedTime: 30
    },
    {
      id: 'profile-setup',
      title: 'Configure seu Perfil',
      description: 'Vamos configurar seu perfil e preferências',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Configuração do Perfil</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Configure suas informações básicas e preferências
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Nome e email configurados</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Permissões de owner ativadas</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Grupo padrão criado</span>
            </div>
          </div>
        </div>
      ),
      isCompleted: true,
      isOptional: false,
      estimatedTime: 45
    },
    {
      id: 'player-management',
      title: 'Gerenciamento de Jogadores',
      description: 'Aprenda a gerenciar jogadores do seu time',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Gerenciar Jogadores</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Adicione, edite e organize os jogadores do seu time
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Adicionar Jogadores</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Clique em "Adicionar Jogador" para incluir novos membros
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Editar Informações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use o botão "Editar" para modificar dados dos jogadores
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Funções e Cargos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Defina funções: Diarista, Mensalista, Auxiliar
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Posições</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Goleiro, Zagueiro, Meia, Atacante
              </p>
            </div>
          </div>
        </div>
      ),
      isCompleted: false,
      isOptional: false,
      estimatedTime: 60
    },
    {
      id: 'security-features',
      title: 'Recursos de Segurança',
      description: 'Conheça os recursos de segurança implementados',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Segurança Avançada</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Seus dados estão protegidos com as melhores práticas de segurança
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Rate Limiting</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Proteção contra ataques de força bruta
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Validação de Email</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Detecção de emails suspeitos e descartáveis
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Logs de Auditoria</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Rastreamento completo de todas as ações
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Backup Automático</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Backup automático dos seus dados importantes
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      isCompleted: false,
      isOptional: true,
      estimatedTime: 45
    },
    {
      id: 'performance-tips',
      title: 'Dicas de Performance',
      description: 'Otimizações implementadas para melhor experiência',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Performance Otimizada</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aplicação otimizada para máxima velocidade e eficiência
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="font-medium mb-1">Cache Inteligente</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dados carregados instantaneamente
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-green-500 mb-2" />
              <h4 className="font-medium mb-1">Service Worker</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Funciona offline com cache local
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-500 mb-2" />
              <h4 className="font-medium mb-1">CDN Global</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Recursos carregados de servidores próximos
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-medium mb-1">Bundle Otimizado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Código minificado e comprimido
              </p>
            </div>
          </div>
        </div>
      ),
      isCompleted: false,
      isOptional: true,
      estimatedTime: 30
    },
    {
      id: 'completion',
      title: 'Tudo Pronto!',
      description: 'Você está pronto para usar o Nexus Play',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Parabéns! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Você concluiu o onboarding e está pronto para usar todas as funcionalidades do Nexus Play!
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Próximos Passos:
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Adicione seus primeiros jogadores</li>
              <li>• Configure as funções e posições</li>
              <li>• Explore o dashboard principal</li>
              <li>• Personalize suas preferências</li>
            </ul>
          </div>
        </div>
      ),
      isCompleted: false,
      isOptional: false,
      estimatedTime: 15
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const completedCount = completedSteps.size;
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
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
      }, 300);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              Passo {currentStep + 1} de {totalSteps}
            </Badge>
            {defaultConfig.showEstimatedTime && (
              <Badge variant="secondary" className="text-xs">
                ~{currentStepData.estimatedTime}s
              </Badge>
            )}
          </div>
          
          {defaultConfig.showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">{currentStepData.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{currentStepData.description}</p>
            </div>

            <div className="min-h-[300px] flex items-center justify-center">
              {currentStepData.content}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {defaultConfig.allowSkip && currentStep < steps.length - 1 && (
                <Button variant="ghost" onClick={handleSkip}>
                  Pular
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                </span>
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;



