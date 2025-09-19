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
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Tema
      </h3>
      <div className="space-y-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.id;
          
          return (
            <Button
              key={themeOption.id}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start h-10"
              onClick={() => setTheme(themeOption.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{themeOption.label}</span>
              {isSelected && (
                <Check className="w-4 h-4 text-white" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
