import InviteCreator from '@/components/InviteCreator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAttendanceConvex } from '@/hooks/useAttendanceConvex';
import { useInviteSystemConvex } from '@/hooks/useInviteSystemConvex';
import React, { useState } from 'react';

type Invite = {
  id: string;
  email: string;
  membership: 'mensalista' | 'diarista';
  status: 'sent' | 'accepted' | 'revoked' | 'expired';
  token: string;
  created_at: string;
  consumed_at: string | null;
  used_count: number;
};

type Request = {
  id: string;
  user_id: string;
  match_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
};

export default function InvitesApprovalsPage() {
  const [q, setQ] = useState('');

  // Hooks Convex
  const { invites, pendingInvites, acceptedInvites, declinedInvites, revokeInvite, isLoading: invitesLoading } = useInviteSystemConvex();
  const { attendanceRequests, pendingRequests, approvedRequests, rejectedRequests, approveAttendanceRequest, rejectAttendanceRequest, isLoading: requestsLoading } = useAttendanceConvex();

  const filteredInvites = invites.filter(i => i.email.toLowerCase().includes(q.toLowerCase()));

  const revoke = async (id: string) => {
    try {
      await revokeInvite(id as any);
    } catch (error) {
      console.error('Erro ao revogar convite:', error);
    }
  };

  const approve = async (id: string) => {
    try {
      await approveAttendanceRequest(id as any, 'admin');
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
    }
  };

  const reject = async (id: string) => {
    try {
      await rejectAttendanceRequest(id as any, 'admin');
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6">
      <InviteCreator />

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Convites</h3>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por email" className="max-w-xs" />
          </div>
          <div className="space-y-2">
            {invitesLoading ? (
              <div className="text-center p-4">Carregando convites...</div>
            ) : (
              filteredInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{inv.email}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(inv.created_at).toLocaleString()} • {inv.membership}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{inv.status}</Badge>
                    {inv.status === 'sent' && (
                      <Button size="sm" variant="outline" onClick={() => revoke(inv.id)}>Revogar</Button>
                    )}
                  </div>
                </div>
              ))
            )}
            {!invitesLoading && filteredInvites.length === 0 && (<div className="text-sm text-zinc-500">Sem convites.</div>)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-lg font-semibold">Aprovação de Diaristas</h3>
          <div className="space-y-2">
            {requestsLoading ? (
              <div className="text-center p-4">Carregando solicitações...</div>
            ) : (
              attendanceRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Req #{r.id.slice(0, 8)}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(r.requested_at).toLocaleString()} • status: {r.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => approve(r.id)} disabled={r.status !== 'pending'}>Aprovar</Button>
                    <Button size="sm" variant="secondary" onClick={() => reject(r.id)} disabled={r.status !== 'pending'}>Rejeitar</Button>
                  </div>
                </div>
              ))
            )}
            {!requestsLoading && attendanceRequests.length === 0 && (<div className="text-sm text-zinc-500">Sem solicitações.</div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
