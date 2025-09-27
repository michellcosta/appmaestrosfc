import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Users, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  BarChart3, 
  Clock, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Download,
  Upload
} from 'lucide-react';
import { useAdvancedInvites } from '@/hooks/useAdvancedInvites';
import { toast } from 'sonner';

interface AdvancedInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedInviteModal({ open, onOpenChange }: AdvancedInviteModalProps) {
  const {
    invites,
    templates,
    stats,
    loading,
    createInvite,
    createBulkInvites,
    sendWhatsAppInvite,
    getInvitesByStatus,
    generateWhatsAppLink
  } = useAdvancedInvites();

  // Estados para convite individual
  const [individualInvite, setIndividualInvite] = useState({
    type: 'mensalista' as const,
    email: '',
    phone: '',
    expires_in_hours: 24,
    template_id: ''
  });

  // Estados para convites em massa
  const [bulkInvites, setBulkInvites] = useState({
    type: 'mensalista' as const,
    contacts: '',
    expires_in_hours: 24,
    template_id: ''
  });

  // Estados da interface
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('individual');

  const pendingInvites = getInvitesByStatus('pending');
  const sentInvites = getInvitesByStatus('sent');
  const acceptedInvites = getInvitesByStatus('accepted');

  const handleCreateIndividualInvite = async () => {
    if (!individualInvite.email && !individualInvite.phone) {
      toast.error('Digite um email ou telefone');
      return;
    }

    try {
      await createInvite({
        type: individualInvite.type,
        email: individualInvite.email || undefined,
        phone: individualInvite.phone || undefined,
        expires_in_hours: individualInvite.expires_in_hours,
        template_id: individualInvite.template_id || undefined
      });

      // Resetar formulário
      setIndividualInvite({
        type: 'mensalista',
        email: '',
        phone: '',
        expires_in_hours: 24,
        template_id: ''
      });
    } catch (error) {
      console.error('Erro ao criar convite:', error);
    }
  };

  const handleCreateBulkInvites = async () => {
    if (!bulkInvites.contacts.trim()) {
      toast.error('Digite os contatos');
      return;
    }

    try {
      // Parse dos contatos (formato: email,phone,nome ou apenas email)
      const contacts = bulkInvites.contacts
        .split('\n')
        .map(line => {
          const parts = line.split(',');
          return {
            email: parts[0]?.trim() || undefined,
            phone: parts[1]?.trim() || undefined,
            name: parts[2]?.trim() || undefined
          };
        })
        .filter(contact => contact.email || contact.phone);

      await createBulkInvites({
        contacts,
        type: bulkInvites.type,
        template_id: bulkInvites.template_id || undefined,
        expires_in_hours: bulkInvites.expires_in_hours
      });

      // Resetar formulário
      setBulkInvites({
        type: 'mensalista',
        contacts: '',
        expires_in_hours: 24,
        template_id: ''
      });
    } catch (error) {
      console.error('Erro ao criar convites em massa:', error);
    }
  };

  const copyToClipboard = async (text: string, inviteId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(inviteId);
      setTimeout(() => setCopiedCode(null), 2000);
      toast.success('Copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Sistema de Convites Avançado
          </DialogTitle>
          <DialogDescription>
            Gerencie convites individuais e em massa com analytics completos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Em Massa</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Convite Individual */}
          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Criar Convite Individual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Convite</Label>
                    <Select 
                      value={individualInvite.type} 
                      onValueChange={(value: any) => setIndividualInvite(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensalista">Mensalista</SelectItem>
                        <SelectItem value="diarista">Diarista</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="aux">Auxiliar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires">Expira em (horas)</Label>
                    <Input
                      id="expires"
                      type="number"
                      value={individualInvite.expires_in_hours}
                      onChange={(e) => setIndividualInvite(prev => ({ 
                        ...prev, 
                        expires_in_hours: parseInt(e.target.value) || 24 
                      }))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@email.com"
                      value={individualInvite.email}
                      onChange={(e) => setIndividualInvite(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(21) 99999-9999"
                      value={individualInvite.phone}
                      onChange={(e) => setIndividualInvite(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template (opcional)</Label>
                  <Select 
                    value={individualInvite.template_id} 
                    onValueChange={(value) => setIndividualInvite(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateIndividualInvite}
                  disabled={loading || (!individualInvite.email && !individualInvite.phone)}
                  className="w-full"
                >
                  {loading ? 'Criando...' : 'Criar Convite'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Convites em Massa */}
          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Criar Convites em Massa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-type">Tipo de Convite</Label>
                    <Select 
                      value={bulkInvites.type} 
                      onValueChange={(value: any) => setBulkInvites(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensalista">Mensalista</SelectItem>
                        <SelectItem value="diarista">Diarista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-expires">Expira em (horas)</Label>
                    <Input
                      id="bulk-expires"
                      type="number"
                      value={bulkInvites.expires_in_hours}
                      onChange={(e) => setBulkInvites(prev => ({ 
                        ...prev, 
                        expires_in_hours: parseInt(e.target.value) || 24 
                      }))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacts">
                    Contatos (um por linha, formato: email,telefone,nome)
                  </Label>
                  <Textarea
                    id="contacts"
                    placeholder="usuario1@email.com,21999999999,João Silva&#10;usuario2@email.com,21988888888,Maria Santos&#10;21977777777,José Silva"
                    value={bulkInvites.contacts}
                    onChange={(e) => setBulkInvites(prev => ({ ...prev, contacts: e.target.value }))}
                    rows={6}
                  />
                  <p className="text-sm text-gray-500">
                    Exemplo: email@exemplo.com,(21)99999-9999,Nome da Pessoa
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-template">Template (opcional)</Label>
                  <Select 
                    value={bulkInvites.template_id} 
                    onValueChange={(value) => setBulkInvites(prev => ({ ...prev, template_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateBulkInvites}
                  disabled={loading || !bulkInvites.contacts.trim()}
                  className="w-full"
                >
                  {loading ? 'Criando...' : 'Criar Convites em Massa'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gerenciar Convites */}
          <TabsContent value="manage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Convites Pendentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    Pendentes ({pendingInvites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingInvites.slice(0, 5).map(invite => (
                    <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{invite.email || invite.phone}</p>
                        <p className="text-xs text-gray-500">{invite.code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(
                          `${window.location.origin}/accept-invite?code=${invite.code}`,
                          invite.id
                        )}
                      >
                        {copiedCode === invite.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Convites Enviados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Send className="w-4 h-4" />
                    Enviados ({sentInvites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sentInvites.slice(0, 5).map(invite => (
                    <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{invite.email || invite.phone}</p>
                        <Badge className={getStatusColor(invite.status)}>
                          {getStatusIcon(invite.status)}
                          <span className="ml-1">{invite.status}</span>
                        </Badge>
                      </div>
                      {invite.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(generateWhatsAppLink(invite), '_blank')}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Convites Aceitos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Aceitos ({acceptedInvites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {acceptedInvites.slice(0, 5).map(invite => (
                    <div key={invite.id} className="p-2 border rounded">
                      <p className="text-sm font-medium">{invite.email || invite.phone}</p>
                      <p className="text-xs text-gray-500">
                        Aceito em: {new Date(invite.accepted_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas de Convites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                      <p className="text-sm text-gray-500">Aceitos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                      <p className="text-sm text-gray-500">Pendentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.conversion_rate}%</p>
                      <p className="text-sm text-gray-500">Taxa Conversão</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
