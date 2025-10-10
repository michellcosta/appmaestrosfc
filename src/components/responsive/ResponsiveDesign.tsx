/**
 * Responsive Design Component
 * Sistema avançado de design responsivo com breakpoints dinâmicos
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Tv, 
  Maximize, 
  Minimize,
  RotateCcw,
  Settings,
  Eye,
  MousePointer,
  Touch
} from 'lucide-react';

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth: number;
  icon: React.ReactNode;
  description: string;
}

export interface ResponsiveConfig {
  breakpoints: Breakpoint[];
  currentBreakpoint: string;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  touchSupport: boolean;
  highDPI: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
}

export interface ResponsiveFeatures {
  gridColumns: number;
  cardSize: 'small' | 'medium' | 'large';
  navigationType: 'sidebar' | 'topbar' | 'drawer';
  contentDensity: 'compact' | 'comfortable' | 'spacious';
  interactionMode: 'touch' | 'mouse' | 'keyboard';
}

interface ResponsiveDesignProps {
  config: ResponsiveConfig;
  onConfigChange: (config: ResponsiveConfig) => void;
  children: React.ReactNode;
}

const ResponsiveDesign: React.FC<ResponsiveDesignProps> = ({
  config,
  onConfigChange,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Breakpoints predefinidos
  const defaultBreakpoints: Breakpoint[] = [
    {
      name: 'mobile',
      minWidth: 0,
      maxWidth: 767,
      icon: <Smartphone className="w-4 h-4" />,
      description: 'Dispositivos móveis'
    },
    {
      name: 'tablet',
      minWidth: 768,
      maxWidth: 1023,
      icon: <Tablet className="w-4 h-4" />,
      description: 'Tablets'
    },
    {
      name: 'laptop',
      minWidth: 1024,
      maxWidth: 1439,
      icon: <Laptop className="w-4 h-4" />,
      description: 'Laptops'
    },
    {
      name: 'desktop',
      minWidth: 1440,
      maxWidth: 1919,
      icon: <Monitor className="w-4 h-4" />,
      description: 'Desktops'
    },
    {
      name: 'ultrawide',
      minWidth: 1920,
      maxWidth: Infinity,
      icon: <Tv className="w-4 h-4" />,
      description: 'Monitores ultrawide'
    }
  ];

  // Detectar tamanho da janela
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Detectar breakpoint atual
  useEffect(() => {
    const currentBreakpoint = defaultBreakpoints.find(
      bp => windowSize.width >= bp.minWidth && windowSize.width <= bp.maxWidth
    );

    if (currentBreakpoint) {
      onConfigChange({
        ...config,
        currentBreakpoint: currentBreakpoint.name,
        orientation: windowSize.width > windowSize.height ? 'landscape' : 'portrait',
        deviceType: getDeviceType(windowSize.width),
        touchSupport: 'ontouchstart' in window,
        highDPI: window.devicePixelRatio > 1
      });
    }
  }, [windowSize]);

  // Detectar preferências do usuário
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    onConfigChange({
      ...config,
      reducedMotion: mediaQuery.matches,
      darkMode: darkModeQuery.matches
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      onConfigChange({ ...config, reducedMotion: e.matches });
    };

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      onConfigChange({ ...config, darkMode: e.matches });
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  // Obter tipo de dispositivo baseado na largura
  const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Obter configurações responsivas baseadas no breakpoint
  const getResponsiveFeatures = (): ResponsiveFeatures => {
    const breakpoint = defaultBreakpoints.find(bp => bp.name === config.currentBreakpoint);
    
    if (!breakpoint) {
      return {
        gridColumns: 1,
        cardSize: 'small',
        navigationType: 'drawer',
        contentDensity: 'compact',
        interactionMode: 'touch'
      };
    }

    switch (breakpoint.name) {
      case 'mobile':
        return {
          gridColumns: 1,
          cardSize: 'small',
          navigationType: 'drawer',
          contentDensity: 'compact',
          interactionMode: 'touch'
        };
      case 'tablet':
        return {
          gridColumns: 2,
          cardSize: 'medium',
          navigationType: 'sidebar',
          contentDensity: 'comfortable',
          interactionMode: 'touch'
        };
      case 'laptop':
        return {
          gridColumns: 3,
          cardSize: 'medium',
          navigationType: 'sidebar',
          contentDensity: 'comfortable',
          interactionMode: 'mouse'
        };
      case 'desktop':
        return {
          gridColumns: 4,
          cardSize: 'large',
          navigationType: 'sidebar',
          contentDensity: 'spacious',
          interactionMode: 'mouse'
        };
      case 'ultrawide':
        return {
          gridColumns: 5,
          cardSize: 'large',
          navigationType: 'sidebar',
          contentDensity: 'spacious',
          interactionMode: 'mouse'
        };
      default:
        return {
          gridColumns: 1,
          cardSize: 'small',
          navigationType: 'drawer',
          contentDensity: 'compact',
          interactionMode: 'touch'
        };
    }
  };

  // Aplicar classes CSS responsivas
  useEffect(() => {
    const root = document.documentElement;
    const features = getResponsiveFeatures();
    
    // Remover classes anteriores
    root.classList.remove(
      'mobile', 'tablet', 'laptop', 'desktop', 'ultrawide',
      'portrait', 'landscape',
      'touch', 'mouse', 'keyboard',
      'compact', 'comfortable', 'spacious',
      'sidebar', 'topbar', 'drawer'
    );
    
    // Aplicar novas classes
    root.classList.add(config.currentBreakpoint);
    root.classList.add(config.orientation);
    root.classList.add(features.interactionMode);
    root.classList.add(features.contentDensity);
    root.classList.add(features.navigationType);
    
    // Aplicar variáveis CSS
    root.style.setProperty('--grid-columns', features.gridColumns.toString());
    root.style.setProperty('--card-size', features.cardSize);
    
  }, [config, getResponsiveFeatures]);

  // Obter ícone do breakpoint atual
  const getCurrentBreakpointIcon = () => {
    const breakpoint = defaultBreakpoints.find(bp => bp.name === config.currentBreakpoint);
    return breakpoint?.icon || <Monitor className="w-4 h-4" />;
  };

  // Obter descrição do breakpoint atual
  const getCurrentBreakpointDescription = () => {
    const breakpoint = defaultBreakpoints.find(bp => bp.name === config.currentBreakpoint);
    return breakpoint?.description || 'Desconhecido';
  };

  return (
    <>
      {/* Botão de informações responsivas */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          {getCurrentBreakpointIcon()}
          <span className="hidden sm:inline">
            {config.currentBreakpoint}
          </span>
        </Button>

        {/* Painel de informações responsivas */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4" />
                    <CardTitle className="text-sm">Design Responsivo</CardTitle>
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

              <CardContent className="space-y-4">
                {/* Informações atuais */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Informações Atuais</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      {getCurrentBreakpointIcon()}
                      <div>
                        <p className="text-xs font-medium">Breakpoint</p>
                        <p className="text-xs text-gray-500">{config.currentBreakpoint}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {config.orientation === 'portrait' ? (
                          <div className="w-2 h-3 bg-gray-500 rounded-sm" />
                        ) : (
                          <div className="w-3 h-2 bg-gray-500 rounded-sm" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">Orientação</p>
                        <p className="text-xs text-gray-500">{config.orientation}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {config.deviceType === 'mobile' ? (
                          <Smartphone className="w-3 h-3 text-gray-500" />
                        ) : config.deviceType === 'tablet' ? (
                          <Tablet className="w-3 h-3 text-gray-500" />
                        ) : (
                          <Monitor className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">Dispositivo</p>
                        <p className="text-xs text-gray-500">{config.deviceType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {config.touchSupport ? (
                          <Touch className="w-3 h-3 text-gray-500" />
                        ) : (
                          <MousePointer className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">Interação</p>
                        <p className="text-xs text-gray-500">
                          {config.touchSupport ? 'Touch' : 'Mouse'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dimensões */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Dimensões</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium">Largura</p>
                      <p className="text-xs text-gray-500">{windowSize.width}px</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Altura</p>
                      <p className="text-xs text-gray-500">{windowSize.height}px</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">DPI</p>
                      <p className="text-xs text-gray-500">
                        {window.devicePixelRatio}x
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Resolução</p>
                      <p className="text-xs text-gray-500">
                        {window.screen.width}×{window.screen.height}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configurações responsivas */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Configurações Responsivas</h4>
                  
                  {(() => {
                    const features = getResponsiveFeatures();
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Colunas do Grid</span>
                          <Badge variant="outline" className="text-xs">
                            {features.gridColumns}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Tamanho dos Cards</span>
                          <Badge variant="outline" className="text-xs">
                            {features.cardSize}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Navegação</span>
                          <Badge variant="outline" className="text-xs">
                            {features.navigationType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Densidade</span>
                          <Badge variant="outline" className="text-xs">
                            {features.contentDensity}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Breakpoints disponíveis */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Breakpoints</h4>
                  
                  <div className="space-y-2">
                    {defaultBreakpoints.map(breakpoint => (
                      <div
                        key={breakpoint.name}
                        className={`flex items-center space-x-2 p-2 rounded ${
                          breakpoint.name === config.currentBreakpoint
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        {breakpoint.icon}
                        <div className="flex-1">
                          <p className="text-xs font-medium capitalize">
                            {breakpoint.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {breakpoint.minWidth}px - {breakpoint.maxWidth === Infinity ? '∞' : `${breakpoint.maxWidth}px`}
                          </p>
                        </div>
                        {breakpoint.name === config.currentBreakpoint && (
                          <Badge variant="default" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Conteúdo com classes responsivas aplicadas */}
      <div className={`responsive-content ${config.currentBreakpoint} ${config.orientation}`}>
        {children}
      </div>
    </>
  );
};

export default ResponsiveDesign;



