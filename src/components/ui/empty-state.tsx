import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Trophy, 
  MessageSquare,
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <Card className="animate-fade-in-up">
      <CardContent className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && (
              <Button 
                onClick={action.onClick}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button 
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined empty states
export function EmptyGames() {
  const { canCreateGames } = usePermissions();
  const navigate = useNavigate();

  const handleCreateGame = () => {
    // Navegar para o OwnerDashboard e abrir modal de criação
    navigate('/owner-dashboard?action=create-game');
  };

  return (
    <EmptyState
      icon={Calendar}
      title="Nenhum jogo agendado"
      description="Não há jogos programados no momento. Crie um novo jogo para começar."
      action={canCreateGames() ? {
        label: "Criar Jogo",
        onClick: handleCreateGame
      } : undefined}
    />
  );
}

export function EmptyPlayers() {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum jogador cadastrado"
      description="Convide jogadores para participar do grupo e começar a organizar os jogos."
      action={{
        label: "Convidar Jogadores",
        onClick: () => window.location.href = '/create-invite'
      }}
    />
  );
}

export function EmptyPayments() {
  return (
    <EmptyState
      icon={DollarSign}
      title="Nenhum pagamento registrado"
      description="Ainda não há pagamentos registrados. Os pagamentos aparecerão aqui quando forem feitos."
    />
  );
}

export function EmptyRanking() {
  return (
    <EmptyState
      icon={Trophy}
      title="Ranking vazio"
      description="Não há dados suficientes para gerar o ranking. Jogue algumas partidas para ver as estatísticas."
    />
  );
}

export function EmptyVotes() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Nenhuma votação ativa"
      description="Não há votações abertas no momento. As votações aparecerão aqui quando forem criadas."
    />
  );
}

export function EmptyReports() {
  return (
    <EmptyState
      icon={FileText}
      title="Nenhum relatório disponível"
      description="Não há relatórios gerados ainda. Os relatórios aparecerão aqui quando forem criados."
    />
  );
}
