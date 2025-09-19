import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Trophy, 
  MessageSquare,
  Settings,
  Save,
  CheckCircle
} from 'lucide-react';
import { useToastHelpers } from '@/components/ui/toast';

export default function ConfigureAccess() {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToastHelpers();

  // Configurações de acesso por role
  const [accessConfig, setAccessConfig] = useState({
    mensalista: {
      canSeeRanking: true,
      canSeeVote: true,
      canSeeFinance: true,
      canCreateGames: false,
      canManagePlayers: false
    },
    diarista: {
      canSeeRanking: false,
      canSeeVote: false,
      canSeeFinance: true,
      canCreateGames: false,
      canManagePlayers: false
    },
    aux: {
      canSeeRanking: true,
      canSeeVote: true,
      canSeeFinance: true,
      canCreateGames: true,
      canManagePlayers: true
    }
  });

  const handleToggleAccess = (role: string, permission: string) => {
    setAccessConfig(prev => ({
      ...prev,
      [role]: {
        ...prev[role as keyof typeof prev],
        [permission]: !(prev[role as keyof typeof prev] as any)[permission]
      }
    }));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      success('Configurações salvas', 'As permissões foram atualizadas com sucesso');
    } catch (err) {
      error('Erro ao salvar', 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const PermissionCard = ({ 
    role, 
    title, 
    description, 
    icon: Icon, 
    color 
  }: { 
    role: string; 
    title: string; 
    description: string; 
    icon: any; 
    color: string;
  }) => {
    const config = accessConfig[role as keyof typeof accessConfig];
    
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            {title}
          </CardTitle>
          <p className="text-sm text-zinc-500">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${role}-ranking`} className="text-sm">
                Ver Ranking
              </Label>
              <Switch
                id={`${role}-ranking`}
                checked={config.canSeeRanking}
                onCheckedChange={() => handleToggleAccess(role, 'canSeeRanking')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor={`${role}-vote`} className="text-sm">
                Participar de Votações
              </Label>
              <Switch
                id={`${role}-vote`}
                checked={config.canSeeVote}
                onCheckedChange={() => handleToggleAccess(role, 'canSeeVote')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor={`${role}-finance`} className="text-sm">
                Ver Financeiro
              </Label>
              <Switch
                id={`${role}-finance`}
                checked={config.canSeeFinance}
                onCheckedChange={() => handleToggleAccess(role, 'canSeeFinance')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor={`${role}-games`} className="text-sm">
                Criar Jogos
              </Label>
              <Switch
                id={`${role}-games`}
                checked={config.canCreateGames}
                onCheckedChange={() => handleToggleAccess(role, 'canCreateGames')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor={`${role}-players`} className="text-sm">
                Gerenciar Jogadores
              </Label>
              <Switch
                id={`${role}-players`}
                checked={config.canManagePlayers}
                onCheckedChange={() => handleToggleAccess(role, 'canManagePlayers')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          Configurar Acessos
        </h1>
        <p className="text-sm text-zinc-500">Defina as permissões para cada tipo de usuário</p>
      </div>

      {/* Configurações por Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PermissionCard
          role="mensalista"
          title="⭐ Mensalistas"
          description="Jogadores que pagam mensalidade"
          icon={Trophy}
          color="text-yellow-600"
        />
        
        <PermissionCard
          role="diarista"
          title="💫 Diaristas"
          description="Jogadores que pagam por jogo"
          icon={DollarSign}
          color="text-green-600"
        />
        
        <PermissionCard
          role="aux"
          title="⚡ Auxiliares"
          description="Administradores auxiliares"
          icon={Shield}
          color="text-blue-600"
        />
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveConfig}
          disabled={loading}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
