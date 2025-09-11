import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// NOTE: to keep it generic, we use simple Inputs for author/assist by name.
// In your app, swap Input for a Select fed by team players list.

interface Props {
  open: boolean;
  teamLabel: string;     // 'Preto' | 'Verde' | 'Cinza' | 'Coletes'
  onClose: () => void;
  onConfirm: (authorName: string, assistName?: string) => void;
}

export function GoalModal({ open, teamLabel, onClose, onConfirm }: Props) {
  const [author, setAuthor] = React.useState('');
  const [assist, setAssist] = React.useState('');

  React.useEffect(() => {
    if (open) { setAuthor(''); setAssist(''); }
  }, [open]);

  const canConfirm = author.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar gol — {teamLabel}</DialogTitle>
          <DialogDescription>Informe o autor (obrigatório) e, se quiser, a assistência.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label>Autor *</Label>
            <Input placeholder="Nome do autor" value={author} onChange={(e)=>setAuthor(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Assistência (opcional)</Label>
            <Input placeholder="Nome de quem assistiu" value={assist} onChange={(e)=>setAssist(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canConfirm} onClick={()=>onConfirm(author.trim(), assist.trim()||undefined)}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
