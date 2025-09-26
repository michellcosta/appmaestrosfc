import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Mail, 
  Copy, 
  Check, 
  Star, 
  Zap,
  Clock,
  Calendar,
  ExternalLink,
  RefreshCw,
  Users,
  Crown,
  Shield,
  Send,
  XCircle,
  UserCheck,
  Info
} from 'lucide-react';
import { useSimpleInvites, SimpleInvite } from '@/hooks/useSimpleInvites';
import { useAuth } from '@/auth/OfflineAuthProvider';

interface CompleteInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompleteInviteModal({ open, onOpenChange }: CompleteInviteModalProps) {
  const { user } = useAuth();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mensalista' | 'diarista' | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<SimpleInvite | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [lastActiveTab, setLastActiveTab] = useState('create');
  
  const {
    invites,
    loading,
    createInvite,
    copyToClipboard,
    cleanExpiredInvites,
    getRecentInvites,
    loadInvites
  } = useSimpleInvites();

  useEffect(() => {
    if (open) {
      console.log('Carregando convites...');
      loadInvites();
      // Restaurar a aba que estava sendo usada
      setActiveTab(lastActiveTab);
    } else {
      // Limpar estado quando fechar o modal
      setSelectedType(null);
      setGeneratedInvite(null);
      setCopiedItem(null);
    }
  }, [open, loadInvites, lastActiveTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setLastActiveTab(newTab); // Salvar a aba ativa
  };

  const handleCreateInvite = async (type: 'mensalista' | 'diarista') => {
    if (!user) {
      console.error('Usuário não encontrado');
      return;
    }
    
    const userId = user.id || user.email || 'unknown';
    console.log('Criando convite para:', type, 'por:', userId);
    const invite = await createInvite(type, userId);
    if (invite) {
      console.log('Convite criado:', invite);
      setSelectedType(type);
      setGeneratedInvite(invite);
      setActiveTab('manage'); // Mudar para aba de gerenciamento após criar
      setLastActiveTab('manage'); // Salvar a nova aba ativa
    } else {
      console.error('Falha ao criar convite');
      alert('Erro ao criar convite. Tente novamente.');
    }
  };

  const handleCopyLink = async (invite: SimpleInvite) => {
    console.log('🔗 Copiando link:', invite.link);
    const success = await copyToClipboard(invite.link);
    console.log('📋 Resultado da cópia do link:', success);
    if (success) {
      setCopiedItem(invite.id);
      setTimeout(() => setCopiedItem(null), 3000);
    } else {
      alert('❌ Erro ao copiar link. Verifique as permissões do navegador.');
    }
  };

  const handleCopyMessage = async (invite: SimpleInvite) => {
    console.log('💬 Copiando mensagem:', invite.message.substring(0, 50) + '...');
    const success = await copyToClipboard(invite.message);
    console.log('📋 Resultado da cópia da mensagem:', success);
    if (success) {
      setCopiedItem(`message_${invite.id}`);
      setTimeout(() => setCopiedItem(null), 3000);
    } else {
      alert('❌ Erro ao copiar mensagem. Verifique as permissões do navegador.');
    }
  };

  const handleCopyAll = async (invite: SimpleInvite) => {
    const fullText = `${invite.message}\n\n🔗 Link: ${invite.link}`;
    console.log('📱 Copiando mensagem completa para WhatsApp...');
    const success = await copyToClipboard(fullText);
    console.log('📋 Resultado da cópia completa:', success);
    if (success) {
      setCopiedItem(`all_${invite.id}`);
      setTimeout(() => setCopiedItem(null), 3000);
    } else {
      alert('❌ Erro ao copiar conteúdo. Verifique as permissões do navegador.');
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

  const getTypeIcon = (type: 'mensalista' | 'diarista') => {
    return type === 'mensalista' ? (
      <Star className="w-5 h-5 text-purple-500" />
    ) : (
      <Zap className="w-5 h-5 text-orange-500" />
    );
  };

  const getTypeLabel = (type: 'mensalista' | 'diarista') => {
    return type === 'mensalista' ? 'Mensalista' : 'Diarista';
  };

  const recentInvites = getRecentInvites(10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Sistema Completo de Convites
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Criar Convites
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gerenciar
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* Aba: Criar Convites */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateInvite('mensalista')}>
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 mx-auto text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">Convite Mensalista</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Para jogadores que pagam mensalidade fixa
                  </p>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Gerar Convite'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateInvite('diarista')}>
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">Convite Diarista</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Para jogadores que pagam por partida
                  </p>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Gerar Convite'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Convite Gerado */}
            {generatedInvite && (
              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-600">
                      Convite {getTypeLabel(generatedInvite.type)} Criado!
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Link */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">Link do Convite:</div>
                          <div className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                            {generatedInvite.link}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCopyLink(generatedInvite)}
                          className="ml-3 flex items-center gap-1"
                          variant={copiedItem === generatedInvite.id ? "default" : "outline"}
                        >
                          {copiedItem === generatedInvite.id ? (
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

                    {/* Mensagem WhatsApp */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500">Mensagem para WhatsApp:</div>
                        <Button
                          size="sm"
                          onClick={() => handleCopyMessage(generatedInvite)}
                          className="flex items-center gap-1"
                          variant={copiedItem === `message_${generatedInvite.id}` ? "default" : "outline"}
                        >
                          {copiedItem === `message_${generatedInvite.id}` ? (
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
                      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {generatedInvite.message}
                      </div>
                    </div>

                    {/* Botão Copiar Tudo */}
                    <Button
                      onClick={() => handleCopyAll(generatedInvite)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      variant={copiedItem === `all_${generatedInvite.id}` ? "default" : "default"}
                    >
                      {copiedItem === `all_${generatedInvite.id}` ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado! Cole no WhatsApp
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link + Mensagem
                        </>
                      )}
                    </Button>

                    {/* Informações do Convite */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Expira em {formatDate(generatedInvite.expiresAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Criado em {formatDate(generatedInvite.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba: Gerenciar */}
          <TabsContent value="manage" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Histórico de Convites ({recentInvites.length})</h3>
              <Button 
                onClick={cleanExpiredInvites}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar Expirados
              </Button>
            </div>
            
            {recentInvites.length > 0 ? (
              <div className="space-y-3">
                {recentInvites.map((invite) => (
                  <Card key={invite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(invite.type)}
                          <div>
                            <div className="font-medium text-sm">{getTypeLabel(invite.type)}</div>
                            <div className="text-xs text-gray-500">
                              Criado em {formatDate(invite.createdAt)}
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
                            onClick={() => handleCopyLink(invite)}
                            className="flex items-center gap-1"
                          >
                            {copiedItem === invite.id ? (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(invite.link, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum convite criado</h3>
                  <p className="text-gray-500">Crie seu primeiro convite na aba "Criar Convites"!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba: Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{recentInvites.length}</div>
                  <div className="text-sm text-gray-500">Total de Convites</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {recentInvites.filter(inv => inv.type === 'mensalista').length}
                  </div>
                  <div className="text-sm text-gray-500">Mensalistas</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {recentInvites.filter(inv => inv.type === 'diarista').length}
                  </div>
                  <div className="text-sm text-gray-500">Diaristas</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Acesso Completo do Owner
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Você tem acesso total ao sistema de convites, incluindo criação, gerenciamento e estatísticas.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Funcionalidades Disponíveis
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Criar convites únicos, gerenciar histórico, copiar links para WhatsApp e acompanhar estatísticas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={async () => {
              const testText = "🧪 TESTE DE CÓPIA - Maestros FC\n\nSe você está vendo esta mensagem, a função de cópia está funcionando!\n\n✅ Timestamp: " + new Date().toLocaleString('pt-BR');
              console.log("🧪 Testando cópia com:", testText);
              const success = await copyToClipboard(testText);
              if (success) {
                alert("✅ Teste de cópia bem-sucedido! Cole em qualquer lugar para verificar.");
              } else {
                alert("❌ Teste de cópia falhou! Verifique o console para mais detalhes.");
              }
            }}
            variant="outline"
            className="text-blue-600 hover:text-blue-700"
          >
            🧪 Testar Cópia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
