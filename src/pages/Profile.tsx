import React from 'react';
import { cn } from '@/lib/utils'; // ajuste se seu util estiver em outro lugar
import { Badge } from '@/components/ui/badge'; // ajuste se necessário

const colors = {
  owner: 'bg-emerald-600',
  admin: 'bg-indigo-600',
  aux: 'bg-sky-600',
  mensalista: 'bg-amber-600',
  diarista: 'bg-rose-600',
} as const;

const pt = {
  roles: {
    owner: 'Dono',
    admin: 'Admin',
    aux: 'Assistente',
    mensalista: 'Mensalista',
    diarista: 'Diarista',
  } as const,
};

type RoleKey = keyof typeof colors; // 'owner' | 'admin' | ...

export default function Profile() {
  const role: string = 'admin'; // exemplo; troque pelo valor vindo do usuário
  const roleKey = (role in colors ? role : 'aux') as RoleKey;

  return (
    <div className="p-4">
      <Badge className={cn(colors[roleKey], 'text-white')}>
        {pt.roles[roleKey]}
      </Badge>
    </div>
  );
}
