/**
 * Accessibility Manager Component
 * Sistema completo de acessibilidade seguindo WCAG 2.1
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  VolumeX, 
  MousePointer, 
  Keyboard, 
  Focus,
  Contrast,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface AccessibilityConfig {
  // Navegação
  keyboardNavigation: boolean;
  focusVisible: boolean;
  skipLinks: boolean;
  tabOrder: 'logical' | 'visual';
  
  // Visual
  highContrast: boolean;
  fontSize: number; // 1.0 = 100%
  lineHeight: number; // 1.0 = 100%
  letterSpacing: number; // 0 = normal
  wordSpacing: number; // 0 = normal
  colorBlindSupport: boolean;
  
  // Motor
  reducedMotion: boolean;
  largeTargets: boolean;
  hoverEffects: boolean;
  
  // Auditivo
  screenReader: boolean;
  audioDescriptions: boolean;
  captions: boolean;
  
  // Cognitivo
  readingMode: boolean;
  simplifiedUI: boolean;
  errorPrevention: boolean;
  
  // Geral
  ariaLabels: boolean;
  semanticHTML: boolean;
  altText: boolean;
}

export interface AccessibilityAudit {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
  compliance: {
    wcagAA: boolean;
    wcagAAA: boolean;
    section508: boolean;
  };
}

export interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'navigation' | 'visual' | 'motor' | 'auditory' | 'cognitive';
  description: string;
  element?: string;
  fix: string;
  wcagCriteria: string[];
}

export interface AccessibilityRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  implementation: string;
  impact: string;
}

interface AccessibilityManagerProps {
  config: AccessibilityConfig;
  onConfigChange: (config: AccessibilityConfig) => void;
  onAuditComplete: (audit: AccessibilityAudit) => void;
}

const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({
  config,
  onConfigChange,
  onAuditComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [auditResults, setAuditResults] = useState<AccessibilityAudit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const skipLinkRef = useRef<HTMLButtonElement>(null);

  // Aplicar configurações de acessibilidade
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar configurações visuais
    root.style.setProperty('--font-size', `${config.fontSize}rem`);
    root.style.setProperty('--line-height', `${config.lineHeight}`);
    root.style.setProperty('--letter-spacing', `${config.letterSpacing}px`);
    root.style.setProperty('--word-spacing', `${config.wordSpacing}px`);
    
    // Aplicar classes de acessibilidade
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (config.largeTargets) {
      root.classList.add('large-targets');
    } else {
      root.classList.remove('large-targets');
    }
    
    if (config.colorBlindSupport) {
      root.classList.add('colorblind-support');
    } else {
      root.classList.remove('colorblind-support');
    }
    
    if (config.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }
    
  }, [config]);

  // Gerenciar foco visível
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };
    
    const handleMouseDown = () => {
      setFocusVisible(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Executar auditoria de acessibilidade
  const runAccessibilityAudit = async () => {
    setIsAuditing(true);
    
    try {
      // Simular auditoria (em produção, integrar com axe-core ou similar)
      const issues: AccessibilityIssue[] = [];
      const recommendations: AccessibilityRecommendation[] = [];
      
      // Verificar problemas comuns
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          id: 'missing-alt-text',
          severity: 'error',
          category: 'visual',
          description: `${imagesWithoutAlt.length} imagens sem texto alternativo`,
          fix: 'Adicionar atributo alt a todas as imagens',
          wcagCriteria: ['1.1.1']
        });
      }
      
      const buttonsWithoutAria = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      if (buttonsWithoutAria.length > 0) {
        issues.push({
          id: 'missing-aria-labels',
          severity: 'warning',
          category: 'navigation',
          description: `${buttonsWithoutAria.length} botões sem rótulos acessíveis`,
          fix: 'Adicionar aria-label ou aria-labelledby aos botões',
          wcagCriteria: ['4.1.2']
        });
      }
      
      const lowContrastElements = document.querySelectorAll('[style*="color"]');
      if (lowContrastElements.length > 0) {
        issues.push({
          id: 'low-contrast',
          severity: 'warning',
          category: 'visual',
          description: 'Possíveis problemas de contraste de cores',
          fix: 'Verificar e ajustar contraste de cores',
          wcagCriteria: ['1.4.3']
        });
      }
      
      // Gerar recomendações
      recommendations.push({
        id: 'keyboard-navigation',
        priority: 'high',
        category: 'navigation',
        description: 'Implementar navegação por teclado completa',
        implementation: 'Adicionar suporte a Tab, Enter, Escape e setas',
        impact: 'Melhora acessibilidade para usuários de teclado'
      });
      
      recommendations.push({
        id: 'focus-management',
        priority: 'high',
        category: 'navigation',
        description: 'Melhorar gerenciamento de foco',
        implementation: 'Implementar focus trap e focus restoration',
        impact: 'Facilita navegação para usuários de leitores de tela'
      });
      
      const audit: AccessibilityAudit = {
        score: Math.max(0, 100 - (issues.length * 10)),
        issues,
        recommendations,
        compliance: {
          wcagAA: issues.filter(i => i.severity === 'error').length === 0,
          wcagAAA: issues.length === 0,
          section508: issues.filter(i => i.severity === 'error').length <= 2
        }
      };
      
      setAuditResults(audit);
      onAuditComplete(audit);
      
    } catch (error) {
      console.error('Erro na auditoria de acessibilidade:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  // Pular para conteúdo principal
  const skipToMain = () => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      (main as HTMLElement).focus();
    }
  };

  // Obter ícone de categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <Keyboard className="w-4 h-4" />;
      case 'visual':
        return <Eye className="w-4 h-4" />;
      case 'motor':
        return <MousePointer className="w-4 h-4" />;
      case 'auditory':
        return <Volume2 className="w-4 h-4" />;
      case 'cognitive':
        return <Focus className="w-4 h-4" />;
      default:
        return <Accessibility className="w-4 h-4" />;
    }
  };

  // Obter cor de severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      {/* Skip Link */}
      {config.skipLinks && (
        <Button
          ref={skipLinkRef}
          variant="outline"
          size="sm"
          onClick={skipToMain}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Pular para conteúdo principal
        </Button>
      )}

      {/* Botão de acessibilidade */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Accessibility className="w-4 h-4" />
          <span className="hidden sm:inline">Acessibilidade</span>
        </Button>

        {/* Painel de configurações */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Accessibility className="w-4 h-4" />
                    <CardTitle className="text-sm">Configurações de Acessibilidade</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 max-h-96 overflow-y-auto">
                {/* Navegação */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <Keyboard className="w-4 h-4" />
                    <span>Navegação</span>
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Navegação por teclado</span>
                    <Switch
                      checked={config.keyboardNavigation}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, keyboardNavigation: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Foco visível</span>
                    <Switch
                      checked={config.focusVisible}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, focusVisible: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Links de salto</span>
                    <Switch
                      checked={config.skipLinks}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, skipLinks: checked })
                      }
                    />
                  </div>
                </div>

                {/* Visual */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Visual</span>
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alto contraste</span>
                    <Switch
                      checked={config.highContrast}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, highContrast: checked })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tamanho da fonte</span>
                      <span className="text-xs text-gray-500">{Math.round(config.fontSize * 100)}%</span>
                    </div>
                    <Slider
                      value={[config.fontSize]}
                      onValueChange={([value]) => 
                        onConfigChange({ ...config, fontSize: value })
                      }
                      min={0.8}
                      max={1.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Altura da linha</span>
                      <span className="text-xs text-gray-500">{Math.round(config.lineHeight * 100)}%</span>
                    </div>
                    <Slider
                      value={[config.lineHeight]}
                      onValueChange={([value]) => 
                        onConfigChange({ ...config, lineHeight: value })
                      }
                      min={1.0}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Suporte a daltonismo</span>
                    <Switch
                      checked={config.colorBlindSupport}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, colorBlindSupport: checked })
                      }
                    />
                  </div>
                </div>

                {/* Motor */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <MousePointer className="w-4 h-4" />
                    <span>Motor</span>
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Movimento reduzido</span>
                    <Switch
                      checked={config.reducedMotion}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, reducedMotion: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alvos grandes</span>
                    <Switch
                      checked={config.largeTargets}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, largeTargets: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efeitos de hover</span>
                    <Switch
                      checked={config.hoverEffects}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, hoverEffects: checked })
                      }
                    />
                  </div>
                </div>

                {/* Cognitivo */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center space-x-2">
                    <Focus className="w-4 h-4" />
                    <span>Cognitivo</span>
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modo de leitura</span>
                    <Switch
                      checked={config.readingMode}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, readingMode: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Interface simplificada</span>
                    <Switch
                      checked={config.simplifiedUI}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, simplifiedUI: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prevenção de erros</span>
                    <Switch
                      checked={config.errorPrevention}
                      onCheckedChange={(checked) => 
                        onConfigChange({ ...config, errorPrevention: checked })
                      }
                    />
                  </div>
                </div>

                {/* Auditoria */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Auditoria de Acessibilidade</h4>
                  
                  <Button
                    onClick={runAccessibilityAudit}
                    disabled={isAuditing}
                    className="w-full"
                  >
                    {isAuditing ? 'Auditando...' : 'Executar Auditoria'}
                  </Button>
                  
                  {auditResults && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pontuação:</span>
                        <Badge variant={auditResults.score >= 80 ? 'default' : 'destructive'}>
                          {auditResults.score}/100
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs">WCAG AA: {auditResults.compliance.wcagAA ? 'Conforme' : 'Não conforme'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs">Section 508: {auditResults.compliance.section508 ? 'Conforme' : 'Não conforme'}</span>
                        </div>
                      </div>
                      
                      {auditResults.issues.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium">Problemas encontrados:</h5>
                          {auditResults.issues.slice(0, 3).map(issue => (
                            <div key={issue.id} className="flex items-start space-x-2 text-xs">
                              <AlertTriangle className={`w-3 h-3 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                              <span>{issue.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default AccessibilityManager;



