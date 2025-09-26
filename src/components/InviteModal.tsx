import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Copy, 
  Check, 
  Clock, 
  UserCheck, 
  XCircle, 
  Crown, 
  Shield, 
  Star, 
  Zap,
  Send,
  Users,
  Calendar,
  Info
} from 'lucide-react';
import { useInviteSystem, Invite } from '@/hooks/useInviteSystem';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'aux' | 'mensalista' | 'diarista'>('mensalista');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showGenericInvite, setShowGenericInvite] = useState(false);
  
  const {
    invites,
    loading,
    error,
    sendInvite,
    cancelInvite,
    generateInviteLink,
    getInviteStats,
    getInvitesByStatus,
    cleanExpiredInvites
  } = useInviteSystem();

  const stats = getInviteStats();
  const pendingInvites = getInvitesByStatus('pending');
  const acceptedInvites = getInvitesByStatus('accepted');

  const handleSendInvite = async () => {
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um email válido');
      return;
    }

    const success = await sendInvite(email, role);
    if (success) {
      setEmail('');
      setRole('mensalista');
      alert('Convite enviado com sucesso!');
    } else {
      alert(error || 'Erro ao enviar convite');
    }
  };

  const copyToClipboard = async (text: string, inviteId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(inviteId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(inviteId);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'aux': return <Zap className="w-4 h-4 text-green-500" />;
      case 'mensalista': return <Star className="w-4 h-4 text-purple-500" />;
      case 'diarista': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'aux': return 'Auxiliar';
      case 'mensalista': return 'Mensalista';
      case 'diarista': return 'Diarista';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (invite: Invite) => {
    return new Date(invite.expiresAt) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Sistema de Convites
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-gray-600">Aceitos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                <div className="text-sm text-gray-600">Expirados</div>
              </CardContent>
            </Card>
          </div>

          {/* Links Genéricos de Convite */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Links de Convite Genéricos
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['admin', 'aux', 'mensalista', 'diarista'].map((roleType) => (
                    <div key={roleType} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(roleType)}
                          <span className="text-sm font-medium">{getRoleLabel(roleType)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const genericLink = `${window.location.origin}/join?role=${roleType}`;
                            copyToClipboard(genericLink, `generic_${roleType}`);
                          }}
                          className="flex items-center gap-1"
                        >
                          {copiedCode === `generic_${roleType}` ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-xs">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-xs">Copiar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Dica:</strong> Use os links genéricos para compartilhar em grupos do WhatsApp ou redes sociais. 
                      Os convidados poderão escolher seu próprio cargo ao se cadastrar.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Novo Convite */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviar Convite por Email
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email do Convidado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Select value={role} onValueChange={(value: any) => setRole(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="aux">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          Auxiliar
                        </div>
                      </SelectItem>
                      <SelectItem value="mensalista">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          Mensalista
                        </div>
                      </SelectItem>
                      <SelectItem value="diarista">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          Diarista
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleSendInvite}
                    disabled={loading || !email}
                    className="w-full"
                  >
                    {loading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convites Pendentes */}
          {pendingInvites.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Convites Pendentes ({pendingInvites.length})
                </h3>
                
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      {/* Informações do convite */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(invite.role)}
                          <div>
                            <div className="font-medium">{invite.email}</div>
                            <div className="text-sm text-gray-600">
                              {getRoleLabel(invite.role)} • Enviado em {formatDate(invite.invitedAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Expira em {formatDate(invite.expiresAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInvite(invite.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Link de convite destacado */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Link de Convite:</div>
                            <div className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                              {generateInviteLink(invite.inviteCode)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(generateInviteLink(invite.inviteCode), invite.id)}
                            className="ml-3 flex items-center gap-1"
                            variant={copiedCode === invite.id ? "default" : "outline"}
                          >
                            {copiedCode === invite.id ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-xs">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-xs">Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Convites Aceitos */}
          {acceptedInvites.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-500" />
                  Convites Aceitos ({acceptedInvites.length})
                </h3>
                
                <div className="space-y-3">
                  {acceptedInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(invite.role)}
                        <div>
                          <div className="font-medium">{invite.email}</div>
                          <div className="text-sm text-gray-600">
                            {getRoleLabel(invite.role)} • Aceito em {invite.acceptedAt && formatDate(invite.acceptedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Aceito
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensagem quando não há convites */}
          {invites.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum convite enviado</h3>
                <p className="text-gray-500">Envie seu primeiro convite para começar a expandir o grupo!</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={cleanExpiredInvites}
            variant="outline"
            className="text-orange-600 hover:text-orange-700"
          >
            Limpar Expirados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
