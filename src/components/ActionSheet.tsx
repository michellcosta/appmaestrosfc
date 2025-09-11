import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Option = { label: string; onClick: () => void };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  options: Option[];
}

export function ActionSheet({ isOpen, onClose, title, description, options }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="mt-2 grid gap-2">
          {options.map((opt, i) => (
            <Button key={i} variant="secondary" onClick={opt.onClick} className="justify-start">
              {opt.label}
            </Button>
          ))}
          <Button variant="ghost" onClick={onClose} className="justify-start">Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
