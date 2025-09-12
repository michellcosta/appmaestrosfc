import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Plus, Users, Shuffle, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';
import { TeamColor } from '@/types';

interface TeamScore {
  Preto: number;
  Verde: number;
  Cinza: number;
  Coletes: number;
}

export const Match: React.FC = () => {
  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState<TeamScore>({
    Preto: 0,
    Verde: 0,
    Cinza: 0,
    Coletes: 0,
  });

  // Cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (matchState === 'running') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [matchState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (matchState === 'idle') {
      setMatchState('running');
    } else if (matchState === 'running') {
      setMatchState('paused');
    } else {
      setMatchState('running');
    }
  };

  const handleEnd = () => {
    setMatchState('idle');
    setElapsedTime(0);
    setCurrentRound(currentRound + 1);
  };

  const handleGoal = (team: TeamColor) => {
    setScores((prev) => ({
      ...prev,
      [team]: prev[team] + 1,
    }));
  };

  const getTeamColor = (team: TeamColor) => {
    const colors = {
      Preto: 'bg-team-black',
      Verde: 'bg-team-green',
      Cinza: 'bg-team-gray',
      Coletes: 'bg-team-bibs',
      Vermelho: 'bg-team-red', // transição: usa a mesma cor até migrarmos o CSS
    };
    return colors[team];
  };

  const displayTeamName = (team: TeamColor) => (team === 'Coletes' ? 'Vermelho' : team);

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.match.matchLive}
        </h1>
        <p className="text-muted-foreground mt-1">
          {pt.match.round} {currentRound}
        </p>
      </header>

      {/* Cronômetro Principal */}
      <Card className="p-8 text-center shadow-xl bg-gradient-card">
        <div className={cn(
          "text-6xl font-outfit font-bold mb-4 transition-all duration-200",
          matchState === 'running' && "text-primary animate-pulse",
          matchState === 'paused' && "text-warning",
          matchState === 'idle' && "text-muted-foreground"
        )}>
          {formatTime(elapsedTime)}
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant={matchState === 'running' ? 'warning' : 'success'}
            size="xl"
            onClick={handleStartPause}
            className="min-w-[140px]"
          >
            {matchState === 'running' ? (
              <>
                <Pause className="w-5 h-5" />
                {pt.match.pause}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {pt.match.start}
              </>
            )}
          </Button>
          
          {matchState !== 'idle' && (
            <Button
              variant="destructive"
              size="xl"
              onClick={handleEnd}
            >
              <StopCircle className="w-5 h-5" />
              {pt.match.end}
            </Button>
          )}
        </div>
      </Card>

      {/* Placar */}
      <Card className="p-6 shadow-lg">
        <h2 className="text-lg font-outfit font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {pt.match.score}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(scores) as [TeamColor, number][]).map(([team, score]) => (
            <div
              key={team}
              className="flex items-center justify-between p-4 rounded-xl bg-card border-2 border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full",
                  getTeamColor(team)
                )} />
                <span className="font-medium">{displayTeamName(team)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{score}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleGoal(team)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" className="w-full">
          <Users className="w-4 h-4" />
          {pt.match.substitute}
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          <Shuffle className="w-4 h-4" />
          {pt.match.tiebreaker}
        </Button>
      </div>

      {/* Tabs para Histórico */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">{pt.time.week}</TabsTrigger>
          <TabsTrigger value="month">{pt.time.month}</TabsTrigger>
          <TabsTrigger value="all">{pt.time.all}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          <Card className="p-6">
            <h3 className="font-outfit font-semibold mb-4">
              {pt.match.history} - {pt.time.week}
            </h3>
            <div className="space-y-3">
              {/* Mock data - será substituído por dados reais */}
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Rodada 1</div>
                  <div className="text-muted-foreground">Preto 3 x 2 Verde</div>
                </div>
                <Badge variant="secondary">10 min</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="month">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <EmptyState type="ranking" className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {pt.messages.noRanking}
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <EmptyState type="ranking" className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {pt.messages.noRanking}
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};