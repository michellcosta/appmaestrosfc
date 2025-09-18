import React, { useEffect, useState } from 'react';
import InviteCreator from '@/components/InviteCreator';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Invite = {
  id: string;
  email: string;
  membership: 'mensalista'|'diarista';
  status: 'sent'|'accepted'|'revoked'|'expired';
  token: string;
  created_at: string;
  consumed_at: string|null;
  used_count: number;
};

type Request = {
  id: string;
  user_id: string;
  match_id: string;
  status: 'pending'|'approved'|'rejected';
  requested_at: string;
};

export default function InvitesApprovalsPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data: inv } = await supabase
        .from('invites')
        .select('id,email,membership,status,token,created_at,consumed_at,used_count')
        .order('created_at', { ascending: false });
      setInvites((inv as any) ?? []);
      const { data: reqs } = await supabase
        .from('attendance_requests')
        .select('id,user_id,match_id,status,requested_at')
        .order('requested_at', { ascending: false });
      setRequests((reqs as any) ?? []);
    })();
  }, []);

  const filteredInvites = invites.filter(i => i.email.toLowerCase().includes(q.toLowerCase()));

  const revoke = async (id: string) => {
    await supabase.from('invites').update({ status: 'revoked' }).eq('id', id);
    setInvites(prev => prev.map(i => i.id === id ? { ...i, status: 'revoked' } : i));
  };

  const approve = async (id: string) => {
    await supabase.from('attendance_requests').update({ status: 'approved' }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };
  const reject = async (id: string) => {
    await supabase.from('attendance_requests').update({ status: 'rejected' }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6">
      <InviteCreator />

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Convites</h3>
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por email" className="max-w-xs" />
          </div>
          <div className="space-y-2">
            {filteredInvites.map(inv => (
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
                    <Button size="sm" variant="outline" onClick={()=>revoke(inv.id)}>Revogar</Button>
                  )}
                </div>
              </div>
            ))}
            {filteredInvites.length === 0 && (<div className="text-sm text-zinc-500">Sem convites.</div>)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-lg font-semibold">Aprovação de Diaristas</h3>
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">Req #{r.id.slice(0,8)}</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(r.requested_at).toLocaleString()} • status: {r.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={()=>approve(r.id)} disabled={r.status!=='pending'}>Aprovar</Button>
                  <Button size="sm" variant="secondary" onClick={()=>reject(r.id)} disabled={r.status!=='pending'}>Rejeitar</Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (<div className="text-sm text-zinc-500">Sem solicitações.</div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
