/**
 * Theme Toggle Component
 * Sistema completo de alternância entre dark/light mode
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Eye,
  Settings,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeToggleProps {
  config: ThemeConfig;
  onConfigChange: (config: ThemeConfig) => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  config,
  onConfigChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detectar tema do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    
    onConfigChange({
      ...config,
      systemTheme
    });

    // Escutar mudanças no tema do sistema
    const handleChange = (e: MediaQueryListEvent) => {
      onConfigChange({
        ...config,
        systemTheme: e.matches ? 'dark' : 'light'
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    const root = document.documentElement;
    const currentTheme = config.theme === 'auto' ? config.systemTheme : config.theme;
    
    // Remover classes anteriores
    root.classList.remove('light', 'dark');
    
    // Aplicar nova classe
    root.classList.add(currentTheme);
    
    // Aplicar configurações customizadas
    if (config.customColors) {
      Object.entries(config.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
    
    // Aplicar configurações de acessibilidade
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Aplicar tamanho da fonte
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(`text-${config.fontSize}`);
    
  }, [config, mounted]);

  // Obter ícone do tema atual
  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'auto':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  // Obter label do tema
  const getThemeLabel = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'auto':
        return 'Automático';
      default:
        return 'Claro';
    }
  };

  // Obter descrição do tema
  const getThemeDescription = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return 'Tema claro para ambientes bem iluminados';
      case 'dark':
        return 'Tema escuro para ambientes com pouca luz';
      case 'auto':
        return 'Segue o tema do sistema operacional';
      default:
        return '';
    }
  };

  // Cores predefinidas
  const predefinedColors = [
    {
      name: 'Padrão',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        foreground: '#0f172a'
      }
    },
    {
      name: 'Azul',
      colors: {
        primary: '#2563eb',
        secondary: '#475569',
        accent: '#0ea5e9',
        background: '#ffffff',
        foreground: '#1e293b'
      }
    },
    {
      name: 'Verde',
      colors: {
        primary: '#059669',
        secondary: '#4b5563',
        accent: '#10b981',
        background: '#ffffff',
        foreground: '#111827'
      }
    },
    {
      name: 'Roxo',
      colors: {
        primary: '#7c3aed',
        secondary: '#6b7280',
        accent: '#a855f7',
        background: '#ffffff',
        foreground: '#1f2937'
      }
    },
    {
      name: 'Rosa',
      colors: {
        primary: '#db2777',
        secondary: '#6b7280',
        accent: '#ec4899',
        background: '#ffffff',
        foreground: '#1f2937'
      }
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão de alternância rápida */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const themes: Theme[] = ['light', 'dark', 'auto'];
          const currentIndex = themes.indexOf(config.theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          onConfigChange({ ...config, theme: themes[nextIndex] });
        }}
        className="flex items-center space-x-2"
      >
        {getThemeIcon(config.theme)}
        <span className="hidden sm:inline">{getThemeLabel(config.theme)}</span>
      </Button>

      {/* Configurações avançadas */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <CardTitle className="text-sm">Configurações de Tema</CardTitle>
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

            <CardContent className="space-y-6">
              {/* Seleção de tema */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Tema</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'auto'] as Theme[]).map(theme => (
                    <Button
                      key={theme}
                      variant={config.theme === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onConfigChange({ ...config, theme })}
                      className="flex flex-col items-center space-y-1 h-auto py-3"
                    >
                      {getThemeIcon(theme)}
                      <span className="text-xs">{getThemeLabel(theme)}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getThemeDescription(config.theme)}
                </p>
              </div>

              {/* Cores predefinidas */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Cores</h4>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedColors.map(colorSet => (
                    <Button
                      key={colorSet.name}
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigChange({ 
                        ...config, 
                        customColors: colorSet.colors 
                      })}
                      className="flex items-center space-x-2 h-auto py-2"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colorSet.colors.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colorSet.colors.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colorSet.colors.accent }}
                        />
                      </div>
                      <span className="text-xs">{colorSet.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Configurações de acessibilidade */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Acessibilidade</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Alto Contraste</span>
                  </div>
                  <Switch
                    checked={config.highContrast}
                    onCheckedChange={(checked) => 
                      onConfigChange({ ...config, highContrast: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Animações</span>
                  </div>
                  <Switch
                    checked={config.animations}
                    onCheckedChange={(checked) => 
                      onConfigChange({ ...config, animations: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Movimento Reduzido</span>
                  </div>
                  <Switch
                    checked={config.reducedMotion}
                    onCheckedChange={(checked) => 
                      onConfigChange({ ...config, reducedMotion: checked })
                    }
                  />
                </div>
              </div>

              {/* Tamanho da fonte */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Tamanho da Fonte</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <Button
                      key={size}
                      variant={config.fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onConfigChange({ ...config, fontSize: size })}
                      className="text-xs"
                    >
                      {size === 'small' && 'Pequeno'}
                      {size === 'medium' && 'Médio'}
                      {size === 'large' && 'Grande'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status atual */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tema Atual:</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {getThemeIcon(config.theme)}
                    <span>{getThemeLabel(config.theme)}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;



