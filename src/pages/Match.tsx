import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Plus, Users, Shuffle, Trophy, Clock, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';
import { TeamColor } from '@/types';

interface TeamScore {
  Preto: number;
  Verde: number;
  Cinza: number;
  Vermelho: number;
}

// --- Novo: tipos/estados para registrar gols ---
interface Player { id: string; name: string; team: TeamColor }

export const Match: React.FC = () => {
  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState<TeamScore>({
    Preto: 0,
    Verde: 0,
    Cinza: 0,
    Vermelho: 0,
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

  const openGoalModal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalStep('select_scorer');
    setGoalScorer(null);
    setGoalAssist(null);
    setIsGoalOpen(true);
  };

  const handleSelectScorer = (pl: Player) => {
    setGoalScorer(pl);
    setGoalStep('select_assist');
  };

  const formatMMSS = (totalSeconds: number) => {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const confirmGoal = (assist: Player | null) => {
    if (!goalScorer) return;
    if (editingIndex !== null) {
      // Edição: ajustar stats antigos e substituir item
      setRecentGoals(prev => {
        const old = prev[editingIndex];
        if (!old) return prev;
        // Ajuste de estatísticas antigas
        setPlayerStats(ps => {
          const next = { ...ps };
          const dec = (id?: string) => {
            if (!id) return;
            if (next[id]) next[id] = { goals: Math.max(0, (next[id].goals ?? 0) - 1), assists: next[id].assists ?? 0 };
          };
          const decAssist = (id?: string) => {
            if (!id) return;
            if (next[id]) next[id] = { goals: next[id].goals ?? 0, assists: Math.max(0, (next[id].assists ?? 0) - 1) };
          };
          dec(old.playerId);
          decAssist(old.assistId);
          // Incrementa novas
          const scorerId = goalScorer.id;
          next[scorerId] = { goals: (next[scorerId]?.goals ?? 0) + 1, assists: next[scorerId]?.assists ?? 0 };
          if (assist) {
            const aid = assist.id;
            next[aid] = { goals: next[aid]?.goals ?? 0, assists: (next[aid]?.assists ?? 0) + 1 };
          }
          return next;
        });
        // Substitui o item mantendo time e horário original
        const updated = { team: old.team, player: goalScorer.name, playerId: goalScorer.id, assist: assist?.name, assistId: assist?.id, time: old.time };
        const arr = [...prev];
        arr[editingIndex] = updated;
        return arr;
      });
      setIsGoalOpen(false);
      setEditingIndex(null);
      return;
    }
    // Inclusão normal: soma no placar e adiciona item
    setScores(prev => ({ ...prev, [goalTeam]: (prev[goalTeam] ?? 0) + 1 }));
    setRecentGoals(prev => [
      { team: goalTeam, player: goalScorer.name, playerId: goalScorer.id, assist: assist?.name, assistId: assist?.id, time: formatMMSS(elapsedTime) },
      ...prev,
    ].slice(0, 8));
    setPlayerStats(prev => ({
      ...prev,
      [goalScorer.id]: {
        goals: (prev[goalScorer.id]?.goals ?? 0) + 1,
        assists: prev[goalScorer.id]?.assists ?? 0,
      },
      ...(assist ? {
        [assist.id]: {
          goals: prev[assist.id]?.goals ?? 0,
          assists: (prev[assist.id]?.assists ?? 0) + 1,
        }
      } : {}),
    }));
    setIsGoalOpen(false);
  };