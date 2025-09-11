import React, { useState } from 'react';
import { Trophy, Target, Shield, Zap, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';

interface PlayerStats {
  id: string;
  name: string;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
  position?: string;
}

export const Ranking: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  // Mock data
  const mockPlayers: PlayerStats[] = [
    { id: '1', name: 'João Silva', goals: 12, assists: 8, wins: 15, draws: 3, losses: 2, position: 'Atacante' },
    { id: '2', name: 'Pedro Santos', goals: 8, assists: 15, wins: 14, draws: 4, losses: 2, position: 'Meio' },
    { id: '3', name: 'Carlos Oliveira', goals: 5, assists: 3, wins: 13, draws: 5, losses: 2, position: 'Zaga' },
    { id: '4', name: 'Lucas Ferreira', goals: 10, assists: 6, wins: 12, draws: 4, losses: 4, position: 'Coringa' },
  ];

  const sortedByGoals = [...mockPlayers].sort((a, b) => b.goals - a.goals);
  const sortedByAssists = [...mockPlayers].sort((a, b) => b.assists - a.assists);
  const sortedByWins = [...mockPlayers].sort((a, b) => b.wins - a.wins);

  const getMedalColor = (position: number) => {
    if (position === 0) return 'text-yellow-500';
    if (position === 1) return 'text-gray-400';
    if (position === 2) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getRankBadge = (position: number) => {
    if (position === 0) return <Badge className="bg-yellow-500 text-white">1º</Badge>;
    if (position === 1) return <Badge className="bg-gray-400 text-white">2º</Badge>;
    if (position === 2) return <Badge className="bg-orange-600 text-white">3º</Badge>;
    return <Badge variant="outline">{position + 1}º</Badge>;
  };

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.navigation.ranking}
        </h1>
        <p className="text-muted-foreground mt-1">
          Estatísticas e premiações
        </p>
      </header>

      {/* Filtros de Tempo */}
      <Tabs defaultValue="month" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">{pt.time.week}</TabsTrigger>
          <TabsTrigger value="month">{pt.time.month}</TabsTrigger>
          <TabsTrigger value="all">{pt.time.all}</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="mt-4 space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <EmptyState type="ranking" className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {pt.messages.noRanking}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-4 space-y-4">
          {/* Medalhas do Mês */}
          <Card className="p-6 shadow-lg bg-gradient-card">
            <h2 className="text-lg font-outfit font-semibold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Medalhas do Mês
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card rounded-xl border-2 border-yellow-500/20">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-xs text-muted-foreground mb-1">Artilheiro</p>
                <p className="font-outfit font-semibold">{sortedByGoals[0]?.name}</p>
                <p className="text-2xl font-bold text-primary mt-1">{sortedByGoals[0]?.goals}</p>
              </div>
              
              <div className="text-center p-4 bg-card rounded-xl border-2 border-blue-500/20">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-xs text-muted-foreground mb-1">Garçom</p>
                <p className="font-outfit font-semibold">{sortedByAssists[0]?.name}</p>
                <p className="text-2xl font-bold text-primary mt-1">{sortedByAssists[0]?.assists}</p>
              </div>
              
              <div className="text-center p-4 bg-card rounded-xl border-2 border-green-500/20">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-xs text-muted-foreground mb-1">Defensor</p>
                <p className="font-outfit font-semibold">Carlos Oliveira</p>
                <p className="text-sm text-primary mt-1">Melhor Zagueiro</p>
              </div>
              
              <div className="text-center p-4 bg-card rounded-xl border-2 border-purple-500/20">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-xs text-muted-foreground mb-1">Craque</p>
                <p className="font-outfit font-semibold">João Silva</p>
                <p className="text-sm text-primary mt-1">MVP do Mês</p>
              </div>
            </div>
          </Card>

          {/* Tabela de Ranking */}
          <Card className="p-6 shadow-lg">
            <h2 className="text-lg font-outfit font-semibold mb-4">
              Tabela Geral
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Nome</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">G</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">A</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">V</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">E</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">D</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByWins.map((player, index) => (
                    <tr
                      key={player.id}
                      className={cn(
                        "border-b border-border/50 transition-colors hover:bg-accent/50",
                        index < 3 && "bg-accent/20"
                      )}
                    >
                      <td className="py-3 px-2">
                        {getRankBadge(index)}
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{player.name}</p>
                          {player.position && (
                            <p className="text-xs text-muted-foreground">{player.position}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 font-semibold">
                        {player.goals}
                      </td>
                      <td className="text-center py-3 px-2">
                        {player.assists}
                      </td>
                      <td className="text-center py-3 px-2 text-success font-medium">
                        {player.wins}
                      </td>
                      <td className="text-center py-3 px-2 text-warning">
                        {player.draws}
                      </td>
                      <td className="text-center py-3 px-2 text-destructive">
                        {player.losses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <EmptyState type="ranking" className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {pt.messages.noRanking}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};