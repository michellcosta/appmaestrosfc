import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Copy, 
  Check, 
  Star, 
  Zap,
  Clock,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useSimpleInvites, SimpleInvite } from '@/hooks/useSimpleInvites';
import { useAuth } from '@/auth/OfflineAuthProvider';

interface SimpleInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleInviteModal({ open, onOpenChange }: SimpleInviteModalProps) {
  const { user } = useAuth();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mensalista' | 'diarista' | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<SimpleInvite | null>(null);
  
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
    }
  }, [open, loadInvites]);

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

  const recentInvites = getRecentInvites(5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Criar Convites para WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botões de Criação */}
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

          {/* Histórico de Convites */}
          {recentInvites.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Convites Recentes ({recentInvites.length})
                </h3>
                
                <div className="space-y-3">
                  {recentInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
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
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum convite criado</h3>
                <p className="text-gray-500">Crie seu primeiro convite clicando nos botões acima!</p>
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
