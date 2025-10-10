/**
 * UX Manager Component
 * Gerenciador principal de UX/UI que integra todas as funcionalidades
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Accessibility, 
  Smartphone, 
  Bell, 
  HelpCircle, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Users,
  Zap
} from 'lucide-react';

// Importar componentes de UX
import OnboardingFlow from '../onboarding/OnboardingFlow';
import TutorialSystem from '../tutorial/TutorialSystem';
import NotificationSystem from '../notifications/NotificationSystem';
import ThemeToggle from '../theme/ThemeToggle';
import AccessibilityManager from '../accessibility/AccessibilityManager';
import ResponsiveDesign from '../responsive/ResponsiveDesign';

export interface UXConfig {
  // Onboarding
  onboarding: {
    enabled: boolean;
    showOnFirstVisit: boolean;
    skipAllowed: boolean;
  };
  
  // Tutorial
  tutorial: {
    enabled: boolean;
    autoStart: boolean;
    steps: any[];
  };
  
  // Notificações
  notifications: {
    enabled: boolean;
    push: boolean;
    inApp: boolean;
    sound: boolean;
  };
  
  // Tema
  theme: {
    mode: 'light' | 'dark' | 'auto';
    customColors: boolean;
    animations: boolean;
  };
  
  // Acessibilidade
  accessibility: {
    enabled: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
  
  // Responsivo
  responsive: {
    enabled: boolean;
    breakpoints: string[];
    currentBreakpoint: string;
  };
}

export interface UXMetrics {
  onboarding: {
    completed: boolean;
    completionRate: number;
    timeSpent: number;
  };
  tutorial: {
    completed: boolean;
    stepsCompleted: number;
    totalSteps: number;
  };
  notifications: {
    totalSent: number;
    readRate: number;
    clickRate: number;
  };
  accessibility: {
    score: number;
    issues: number;
    compliance: boolean;
  };
  responsive: {
    breakpoint: string;
    deviceType: string;
    orientation: string;
  };
}

interface UXManagerProps {
  config: UXConfig;
  onConfigChange: (config: UXConfig) => void;
  onMetricsUpdate: (metrics: UXMetrics) => void;
  children: React.ReactNode;
}

const UXManager: React.FC<UXManagerProps> = ({
  config,
  onConfigChange,
  onMetricsUpdate,
  children
}) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [metrics, setMetrics] = useState<UXMetrics>({
    onboarding: { completed: false, completionRate: 0, timeSpent: 0 },
    tutorial: { completed: false, stepsCompleted: 0, totalSteps: 0 },
    notifications: { totalSent: 0, readRate: 0, clickRate: 0 },
    accessibility: { score: 0, issues: 0, compliance: false },
    responsive: { breakpoint: 'desktop', deviceType: 'desktop', orientation: 'landscape' }
  });

  // Verificar se é primeira visita
  useEffect(() => {
    const hasVisited = localStorage.getItem('nexus-play-visited');
    if (!hasVisited && config.onboarding.showOnFirstVisit) {
      setIsOnboardingOpen(true);
    }
  }, [config.onboarding.showOnFirstVisit]);

  // Atualizar métricas
  const updateMetrics = (newMetrics: Partial<UXMetrics>) => {
    const updatedMetrics = { ...metrics, ...newMetrics };
    setMetrics(updatedMetrics);
    onMetricsUpdate(updatedMetrics);
  };

  // Handlers
  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('nexus-play-visited', 'true');
    updateMetrics({
      onboarding: { ...metrics.onboarding, completed: true, completionRate: 100 }
    });
  };

  const handleOnboardingSkip = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('nexus-play-visited', 'true');
    updateMetrics({
      onboarding: { ...metrics.onboarding, completed: false, completionRate: 0 }
    });
  };

  const handleTutorialComplete = () => {
    setIsTutorialOpen(false);
    updateMetrics({
      tutorial: { ...metrics.tutorial, completed: true, stepsCompleted: config.tutorial.steps.length }
    });
  };

  const handleTutorialSkip = () => {
    setIsTutorialOpen(false);
    updateMetrics({
      tutorial: { ...metrics.tutorial, completed: false, stepsCompleted: 0 }
    });
  };

  // Obter status geral
  const getOverallStatus = () => {
    const statuses = [
      metrics.onboarding.completed,
      metrics.tutorial.completed,
      metrics.accessibility.compliance,
      metrics.responsive.breakpoint !== 'unknown'
    ];
    
    const completed = statuses.filter(Boolean).length;
    const total = statuses.length;
    
    return {
      score: Math.round((completed / total) * 100),
      completed,
      total
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <>
      {/* Onboarding */}
      {isOnboardingOpen && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          config={{
            showProgress: true,
            allowSkip: config.onboarding.skipAllowed,
            autoAdvance: false,
            showEstimatedTime: true,
            theme: 'auto'
          }}
        />
      )}

      {/* Tutorial */}
      {isTutorialOpen && (
        <TutorialSystem
          steps={config.tutorial.steps}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          config={{
            theme: 'auto',
            showProgress: true,
            allowSkip: true,
            autoPlay: false,
            showSpotlight: true,
            showOverlay: true,
            animationDuration: 300
          }}
        />
      )}

      {/* Configurações de UX */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <CardTitle>Configurações de UX/UI</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                  <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                  <TabsTrigger value="notifications">Notificações</TabsTrigger>
                  <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Onboarding</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Completado</span>
                            <Badge variant={metrics.onboarding.completed ? 'default' : 'secondary'}>
                              {metrics.onboarding.completed ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Taxa: {metrics.onboarding.completionRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Tutorial</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Completado</span>
                            <Badge variant={metrics.tutorial.completed ? 'default' : 'secondary'}>
                              {metrics.tutorial.completed ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              {metrics.tutorial.stepsCompleted}/{metrics.tutorial.totalSteps} passos
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Notificações</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Enviadas</span>
                            <Badge variant="outline">{metrics.notifications.totalSent}</Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              Taxa de leitura: {metrics.notifications.readRate}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Accessibility className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">Acessibilidade</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Score</span>
                            <Badge variant={metrics.accessibility.score >= 80 ? 'default' : 'destructive'}>
                              {metrics.accessibility.score}/100
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              {metrics.accessibility.issues} problemas
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">Status Geral</span>
                        </div>
                        <Badge variant={overallStatus.score >= 80 ? 'default' : 'secondary'}>
                          {overallStatus.score}/100
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Completado: {overallStatus.completed}/{overallStatus.total}</span>
                          <span className="text-gray-500">
                            {overallStatus.score >= 80 ? 'Excelente' : 
                             overallStatus.score >= 60 ? 'Bom' : 
                             overallStatus.score >= 40 ? 'Regular' : 'Precisa melhorar'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="onboarding" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Onboarding habilitado</span>
                      <input
                        type="checkbox"
                        checked={config.onboarding.enabled}
                        onChange={(e) => onConfigChange({
                          ...config,
                          onboarding: { ...config.onboarding, enabled: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mostrar na primeira visita</span>
                      <input
                        type="checkbox"
                        checked={config.onboarding.showOnFirstVisit}
                        onChange={(e) => onConfigChange({
                          ...config,
                          onboarding: { ...config.onboarding, showOnFirstVisit: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Permitir pular</span>
                      <input
                        type="checkbox"
                        checked={config.onboarding.skipAllowed}
                        onChange={(e) => onConfigChange({
                          ...config,
                          onboarding: { ...config.onboarding, skipAllowed: e.target.checked }
                        })}
                      />
                    </div>
                    <Button
                      onClick={() => setIsOnboardingOpen(true)}
                      className="w-full"
                    >
                      Iniciar Onboarding
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="tutorial" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tutorial habilitado</span>
                      <input
                        type="checkbox"
                        checked={config.tutorial.enabled}
                        onChange={(e) => onConfigChange({
                          ...config,
                          tutorial: { ...config.tutorial, enabled: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Iniciar automaticamente</span>
                      <input
                        type="checkbox"
                        checked={config.tutorial.autoStart}
                        onChange={(e) => onConfigChange({
                          ...config,
                          tutorial: { ...config.tutorial, autoStart: e.target.checked }
                        })}
                      />
                    </div>
                    <Button
                      onClick={() => setIsTutorialOpen(true)}
                      className="w-full"
                    >
                      Iniciar Tutorial
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notificações habilitadas</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.enabled}
                        onChange={(e) => onConfigChange({
                          ...config,
                          notifications: { ...config.notifications, enabled: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Push notifications</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.push}
                        onChange={(e) => onConfigChange({
                          ...config,
                          notifications: { ...config.notifications, push: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notificações in-app</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.inApp}
                        onChange={(e) => onConfigChange({
                          ...config,
                          notifications: { ...config.notifications, inApp: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Som</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.sound}
                        onChange={(e) => onConfigChange({
                          ...config,
                          notifications: { ...config.notifications, sound: e.target.checked }
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="accessibility" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Acessibilidade habilitada</span>
                      <input
                        type="checkbox"
                        checked={config.accessibility.enabled}
                        onChange={(e) => onConfigChange({
                          ...config,
                          accessibility: { ...config.accessibility, enabled: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Alto contraste</span>
                      <input
                        type="checkbox"
                        checked={config.accessibility.highContrast}
                        onChange={(e) => onConfigChange({
                          ...config,
                          accessibility: { ...config.accessibility, highContrast: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Movimento reduzido</span>
                      <input
                        type="checkbox"
                        checked={config.accessibility.reducedMotion}
                        onChange={(e) => onConfigChange({
                          ...config,
                          accessibility: { ...config.accessibility, reducedMotion: e.target.checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Texto grande</span>
                      <input
                        type="checkbox"
                        checked={config.accessibility.largeText}
                        onChange={(e) => onConfigChange({
                          ...config,
                          accessibility: { ...config.accessibility, largeText: e.target.checked }
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão de configurações de UX */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-40"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Conteúdo principal com ResponsiveDesign */}
      <ResponsiveDesign
        config={{
          breakpoints: ['mobile', 'tablet', 'laptop', 'desktop', 'ultrawide'],
          currentBreakpoint: metrics.responsive.breakpoint,
          orientation: metrics.responsive.orientation as 'portrait' | 'landscape',
          deviceType: metrics.responsive.deviceType as 'mobile' | 'tablet' | 'desktop',
          touchSupport: true,
          highDPI: window.devicePixelRatio > 1,
          reducedMotion: config.accessibility.reducedMotion,
          darkMode: config.theme.mode === 'dark'
        }}
        onConfigChange={(newConfig) => {
          updateMetrics({
            responsive: {
              ...metrics.responsive,
              breakpoint: newConfig.currentBreakpoint,
              deviceType: newConfig.deviceType,
              orientation: newConfig.orientation
            }
          });
        }}
      >
        {children}
      </ResponsiveDesign>
    </>
  );
};

export default UXManager;



