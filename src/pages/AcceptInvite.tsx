import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Crown, 
  Shield, 
  Star, 
  Zap,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Dados do grupo (simulados)
  const [groupInfo] = useState({
    name: 'Maestros FC',
    location: 'São Gonçalo - RJ',
    founded: '2024',
    members: 25,
    nextMatch: '2025-01-27 às 19:30'
  });

  useEffect(() => {
    // Verificar se há código de convite na URL
    const code = searchParams.get('code');
    const role = searchParams.get('role');
    
    if (code) {
      setInviteCode(code);
    }
    
    if (role) {
      setSelectedRole(role);
    }
  }, [searchParams]);

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Acesso completo ao sistema, pode gerenciar jogadores e partidas';
      case 'aux': return 'Ajuda na organização, pode criar partidas e gerenciar alguns aspectos';
      case 'mensalista': return 'Paga mensalidade fixa, acesso completo às funcionalidades';
      case 'diarista': return 'Paga por partida, acesso limitado às funcionalidades';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !selectedRole) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular processamento do convite
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso
      setSuccess(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setError('Erro ao processar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Convite Aceito!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bem-vindo ao {groupInfo.name}! Você foi adicionado com sucesso ao grupo.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                Você será redirecionado para a página inicial em alguns segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Informações do Grupo */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{groupInfo.name}</h1>
                <p className="text-blue-100">Grupo de Futebol</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{groupInfo.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{groupInfo.members} membros</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Próxima: {groupInfo.nextMatch}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Aceitação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Aceitar Convite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código do Convite (se houver) */}
              {inviteCode && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Convite válido: <code className="font-mono">{inviteCode}</code>
                    </span>
                  </div>
                </div>
              )}

              {/* Nome */}
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(21) 99999-9999"
                />
              </div>

              {/* Cargo */}
              <div>
                <Label htmlFor="role">Cargo no Grupo *</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs text-gray-500">Acesso completo</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="aux">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-medium">Auxiliar</div>
                          <div className="text-xs text-gray-500">Ajuda na organização</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="mensalista">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-medium">Mensalista</div>
                          <div className="text-xs text-gray-500">Paga mensalidade</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="diarista">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="font-medium">Diarista</div>
                          <div className="text-xs text-gray-500">Paga por partida</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedRole && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      {getRoleIcon(selectedRole)}
                      <div>
                        <div className="font-medium text-sm">{getRoleLabel(selectedRole)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {getRoleDescription(selectedRole)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name || !email || !selectedRole}
                  className="flex-1"
                >
                  {loading ? 'Processando...' : 'Aceitar Convite'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}