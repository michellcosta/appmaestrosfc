import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Check 
} from 'lucide-react';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'auto', label: 'Automático', icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">Tema:</span>
      <div className="flex space-x-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.id;
          
          return (
            <Button
              key={themeOption.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setTheme(themeOption.id)}
              title={themeOption.label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
