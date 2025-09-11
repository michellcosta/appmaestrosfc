import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ActionSheetOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  options: ActionSheetOption[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-card rounded-t-2xl shadow-xl p-4 pb-8">
          {/* Header */}
          {(title || description) && (
            <div className="mb-4 text-center">
              {title && (
                <h3 className="text-lg font-outfit font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Options */}
          <div className="space-y-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={option.variant || 'outline'}
                size="lg"
                className="w-full justify-start"
                onClick={() => {
                  option.onClick();
                  onClose();
                }}
              >
                {option.icon && (
                  <span className="mr-3">{option.icon}</span>
                )}
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Cancel Button */}
          <Button
            variant="ghost"
            size="lg"
            className="w-full mt-4"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </>
  );
};