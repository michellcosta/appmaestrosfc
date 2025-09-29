import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Card as CardIcon, Users, RotateCcw } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface Event {
  id: string;
  type: string;
  team: string;
  player_id: string;
  timestamp: string;
}

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [players] = useState<Player[]>([
    { id: '1', name: 'João Silva', team: 'home' },
    { id: '2', name: 'Pedro Santos', team: 'away' },
    { id: '3', name: 'Carlos Lima', team: 'home' },
    { id: '4', name: 'Ana Costa', team: 'away' }
  ]);

  const [goalDialog, setGoalDialog] = useState(false);
  const [cardDialog, setCardDialog] = useState(false);
  const [subDialog, setSubDialog] = useState(false);

  const [goalData, setGoalData] = useState({
    team: '',
    player_id: '',
    assist_id: ''
  });

  const [cardData, setCardData] = useState({
    team: '',
    player_id: '',
    color: ''
  });

  const [subData, setSubData] = useState({
    team: '',
    out_player_id: '',
    in_player_id: ''
  });

  const handleGoal = async () => {
    if (!matchId || !user || !goalData.team || !goalData.player_id) return;

    try {
      const response = await fetch('/api/events/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          match_id: matchId,
          team: goalData.team,
          player_id: goalData.player_id,
          assist_id: goalData.assist_id || null
        })
      });

      if (response.ok) {
        const newEvent: Event = {
          id: crypto.randomUUID(),
          type: 'GOAL',
          team: goalData.team,
          player_id: goalData.player_id,
          timestamp: new Date().toISOString()
        };
        setEvents(prev => [...prev, newEvent]);
        setGoalDialog(false);
        setGoalData({ team: '', player_id: '', assist_id: '' });
      }
    } catch (error) {
      console.error('Error recording goal:', error);
    }
  };

  const handleCard = async () => {
    if (!matchId || !user || !cardData.team || !cardData.player_id || !cardData.color) return;

    try {
      const response = await fetch('/api/events/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          match_id: matchId,
          team: cardData.team,
          player_id: cardData.player_id,
          color: cardData.color
        })
      });

      if (response.ok) {
        const newEvent: Event = {
          id: crypto.randomUUID(),
          type: 'CARD',
          team: cardData.team,
          player_id: cardData.player_id,
          timestamp: new Date().toISOString()
        };
        setEvents(prev => [...prev, newEvent]);
        setCardDialog(false);
        setCardData({ team: '', player_id: '', color: '' });
      }
    } catch (error) {
      console.error('Error recording card:', error);
    }
  };

  const handleSubstitution = async () => {
    if (!matchId || !user || !subData.team || !subData.out_player_id || !subData.in_player_id) return;

    try {
      const response = await fetch('/api/events/sub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          match_id: matchId,
          team: subData.team,
          out_player_id: subData.out_player_id,
          in_player_id: subData.in_player_id
        })
      });

      if (response.ok) {
        const newEvent: Event = {
          id: crypto.randomUUID(),
          type: 'SUB',
          team: subData.team,
          player_id: subData.out_player_id,
          timestamp: new Date().toISOString()
        };
        setEvents(prev => [...prev, newEvent]);
        setSubDialog(false);
        setSubData({ team: '', out_player_id: '', in_player_id: '' });
      }
    } catch (error) {
      console.error('Error recording substitution:', error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return <Target className="w-4 h-4 text-green-600" />;
      case 'CARD': return <CardIcon className="w-4 h-4 text-yellow-600" />;
      case 'SUB': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <RotateCcw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'GOAL': return 'bg-green-100 text-green-800';
      case 'CARD': return 'bg-yellow-100 text-yellow-800';
      case 'SUB': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Controle da Partida</h1>
          <Badge variant="outline">Admin</Badge>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-3 gap-4">
          <Dialog open={goalDialog} onOpenChange={setGoalDialog}>
            <DialogTrigger asChild>
              <Button className="h-20 flex flex-col items-center justify-center">
                <Target className="w-6 h-6 mb-2" />
                <span>Gol</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Gol</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Time</Label>
                  <Select value={goalData.team} onValueChange={(value) => setGoalData(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="away">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Jogador</Label>
                  <Select value={goalData.player_id} onValueChange={(value) => setGoalData(prev => ({ ...prev, player_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assistência (opcional)</Label>
                  <Select value={goalData.assist_id} onValueChange={(value) => setGoalData(prev => ({ ...prev, assist_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a assistência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem assistência</SelectItem>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGoal} className="w-full">
                  Registrar Gol
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={cardDialog} onOpenChange={setCardDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <CardIcon className="w-6 h-6 mb-2" />
                <span>Cartão</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Cartão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Time</Label>
                  <Select value={cardData.team} onValueChange={(value) => setCardData(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="away">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Jogador</Label>
                  <Select value={cardData.player_id} onValueChange={(value) => setCardData(prev => ({ ...prev, player_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cor do Cartão</Label>
                  <Select value={cardData.color} onValueChange={(value) => setCardData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Amarelo</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCard} className="w-full">
                  Registrar Cartão
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={subDialog} onOpenChange={setSubDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Users className="w-6 h-6 mb-2" />
                <span>Substituição</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Substituição</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Time</Label>
                  <Select value={subData.team} onValueChange={(value) => setSubData(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="away">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sai</Label>
                  <Select value={subData.out_player_id} onValueChange={(value) => setSubData(prev => ({ ...prev, out_player_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jogador que sai" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Entra</Label>
                  <Select value={subData.in_player_id} onValueChange={(value) => setSubData(prev => ({ ...prev, in_player_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jogador que entra" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubstitution} className="w-full">
                  Registrar Substituição
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline de eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum evento registrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="font-medium">
                          {event.type === 'GOAL' && 'Gol marcado'}
                          {event.type === 'CARD' && 'Cartão aplicado'}
                          {event.type === 'SUB' && 'Substituição realizada'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Time: {event.team === 'home' ? 'Casa' : 'Visitante'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getEventColor(event.type)}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
