import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  value?: string; // HH:MM format
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "HH:MM",
  className,
  disabled = false,
}: TimePickerProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal h-12 text-base",
          !value && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={() => {
          // Focar no input de time
          const timeInput = document.getElementById('time-input') as HTMLInputElement;
          if (timeInput) {
            timeInput.focus();
            timeInput.showPicker?.();
          }
        }}
      >
        <Clock className="mr-3 h-5 w-5" />
        {value ? value : placeholder}
      </Button>
      
      {/* Input de time oculto */}
      <input
        id="time-input"
        type="time"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="absolute opacity-0 pointer-events-none"
        disabled={disabled}
      />
    </div>
  );
}
