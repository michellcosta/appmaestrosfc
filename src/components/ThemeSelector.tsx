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
    <div className="flex items-center space-x-3">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tema:</span>
      <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-700 p-1 rounded-lg">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.id;
          
          return (
            <button
              key={themeOption.id}
              className={`h-8 w-8 p-0 transition-all duration-200 border-0 rounded-md flex items-center justify-center ${
                isSelected 
                  ? "bg-maestros-green hover:bg-maestros-green/90 text-white shadow-sm" 
                  : "bg-transparent hover:bg-maestros-green/10 text-gray-600 dark:text-gray-300 hover:text-maestros-green"
              }`}
              onClick={() => setTheme(themeOption.id)}
              title={themeOption.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
