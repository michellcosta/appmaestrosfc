import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamDrawConvex } from '@/hooks/useTeamDrawConvex';
import { useGamesStore } from '@/store/gamesStore';
import { TeamColor } from '@/types';
import {
    ArrowLeft,
    RefreshCw,
    Shuffle,
    UserMinus,
    UserPlus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TEAM_COLORS: { [key in TeamColor]: { bg: string; text: string; border: string } } = {
    Preto: { bg: 'bg-gray-800', text: 'text-white', border: 'border-gray-800' },
    Verde: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
    Cinza: { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' },
    Vermelho: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' }
};

export default function TeamDrawMobile() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { getUpcomingMatches } = useGamesStore();

    const {
        players,
        teamDraw,
        loading,
        error,
        getPlayersByTeam,
        getAllAvailablePlayers,
        drawTeams,
        refreshTeamDraw,
        substitutePlayer,
        addPlayerToTeam,
        getTeamStats,
        hasTeamDraw,
        isTeamDrawComplete
    } = useTeamDrawConvex(matchId);

    const [showDrawModal, setShowDrawModal] = useState(false);
    const [showSubstituteModal, setShowSubstituteModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [selectedTeam, setSelectedTeam] = useState<TeamColor | null>(null);
    const [playersPerTeam, setPlayersPerTeam] = useState<5 | 6>(5);

    const upcomingMatches = getUpcomingMatches();
    const currentMatch = matchId ? upcomingMatches.find(m => m.id.toString() === matchId) : null;

    useEffect(() => {
        if (matchId) {
            refreshTeamDraw();
        }
    }, [matchId]);

    const handleDrawTeams = async () => {
        if (!matchId) return;

        try {
            await drawTeams(matchId, playersPerTeam);
            setShowDrawModal(false);
        } catch (err) {
            console.error('Erro ao sortear times:', err);
            alert('Erro ao sortear times. Verifique se há jogadores suficientes.');
        }
    };

    const handleSubstitutePlayer = (playerId: string, substituteId: string, teamColor: TeamColor) => {
        substitutePlayer(playerId, substituteId, teamColor);
        setShowSubstituteModal(false);
        setSelectedPlayer(null);
        setSelectedTeam(null);
    };

    const handleAddPlayerToTeam = (player: any, teamColor: TeamColor) => {
        addPlayerToTeam(player, teamColor);
    };

    const getPositionColor = (position?: string) => {
        switch (position) {
            case 'Goleiro': return 'bg-yellow-100 text-yellow-800';
            case 'Zagueiro': return 'bg-blue-100 text-blue-800';
            case 'Meia': return 'bg-green-100 text-green-800';
            case 'Atacante': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStars = (stars?: number) => {
        const starCount = stars || 0;
        return (
            <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-3 w-3 rounded-full ${i < starCount ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando sorteio...</p>
                </div>
            </div>
        );
    }

    if (!matchId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">ID da partida não encontrado</p>
                    <Button onClick={() => navigate('/home')}>
                        Voltar ao Início
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate('/home')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                ⚽ Sorteio de Times
                            </h1>
                            <p className="text-sm text-gray-600">
                                {currentMatch ? `${currentMatch.date} - ${currentMatch.time}` : 'Partida não encontrada'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={refreshTeamDraw}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            onClick={() => setShowDrawModal(true)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading || players.length === 0}
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Sortear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4">
                <Card className="bg-white shadow-sm mb-4">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {players.length}
                                </div>
                                <div className="text-sm text-gray-600">Jogadores</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {hasTeamDraw ? '✅' : '❌'}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {hasTeamDraw ? 'Times Sorteados' : 'Sem Times'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Teams */}
                {hasTeamDraw ? (
                    <div className="space-y-4">
                        {Object.entries(getTeamStats()).map(([teamColor, stats]) => {
                            if (stats.total === 0) return null;

                            const teamPlayers = getPlayersByTeam(teamColor as TeamColor);
                            const colorStyle = TEAM_COLORS[teamColor as TeamColor];

                            return (
                                <Card key={teamColor} className="bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`text-lg ${colorStyle.text} ${colorStyle.bg} px-3 py-1 rounded-full`}>
                                                Time {teamColor}
                                            </CardTitle>
                                            <div className="text-sm text-gray-600">
                                                {stats.active} titulares • {stats.substitutes} reservas
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {teamPlayers.map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {player.name || player.email.split('@')[0]}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {player.position && (
                                                                <span className={`text-xs px-2 py-1 rounded ${getPositionColor(player.position)}`}>
                                                                    {player.position}
                                                                </span>
                                                            )}
                                                            {renderStars(player.stars)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {player.is_substitute && (
                                                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                            Reserva
                                                        </span>
                                                    )}
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedPlayer(player);
                                                            setSelectedTeam(teamColor as TeamColor);
                                                            setShowSubstituteModal(true);
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <UserMinus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="bg-white shadow-sm">
                        <CardContent className="text-center py-12">
                            <Shuffle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum time sorteado
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Clique em "Sortear" para criar os times automaticamente
                            </p>
                            <Button
                                onClick={() => setShowDrawModal(true)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={players.length === 0}
                            >
                                <Shuffle className="h-4 w-4 mr-2" />
                                Sortear Times
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Available Players */}
                {hasTeamDraw && (
                    <Card className="bg-white shadow-sm mt-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Jogadores Disponíveis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {getAllAvailablePlayers().length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Todos os jogadores foram distribuídos nos times
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {getAllAvailablePlayers().map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {player.name || player.email.split('@')[0]}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {player.position && (
                                                            <span className={`text-xs px-2 py-1 rounded ${getPositionColor(player.position)}`}>
                                                                {player.position}
                                                            </span>
                                                        )}
                                                        {renderStars(player.stars)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {Object.keys(TEAM_COLORS).map((teamColor) => (
                                                    <Button
                                                        key={teamColor}
                                                        onClick={() => handleAddPlayerToTeam(player, teamColor as TeamColor)}
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 w-8 p-0 ${TEAM_COLORS[teamColor as TeamColor].border}`}
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal de Sorteio */}
            <Dialog open={showDrawModal} onOpenChange={setShowDrawModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shuffle className="w-5 h-5" />
                            Sortear Times
                        </DialogTitle>
                        <DialogDescription>
                            Configure os parâmetros para o sorteio dos times.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="players-per-team">Jogadores por time</Label>
                            <Select value={playersPerTeam.toString()} onValueChange={(value) => setPlayersPerTeam(parseInt(value) as 5 | 6)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 jogadores por time</SelectItem>
                                    <SelectItem value="6">6 jogadores por time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-800">
                                <strong>Jogadores disponíveis:</strong> {players.length}
                            </div>
                            <div className="text-sm text-blue-800">
                                <strong>Times que serão criados:</strong> {Math.ceil(players.length / playersPerTeam)}
                            </div>
                            <div className="text-sm text-blue-800">
                                <strong>Jogadores por time:</strong> {playersPerTeam}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDrawModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDrawTeams}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={players.length === 0}
                        >
                            <Shuffle className="w-4 h-4 mr-2" />
                            Sortear
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Substituição */}
            <Dialog open={showSubstituteModal} onOpenChange={setShowSubstituteModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserMinus className="w-5 h-5" />
                            Substituir Jogador
                        </DialogTitle>
                        <DialogDescription>
                            Escolha um jogador para substituir {selectedPlayer?.name || selectedPlayer?.email.split('@')[0]}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedTeam && (
                            <div className="space-y-2">
                                <Label>Jogadores disponíveis para substituição:</Label>
                                {getAllAvailablePlayers().map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {player.name || player.email.split('@')[0]}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {player.position && (
                                                        <span className={`text-xs px-2 py-1 rounded ${getPositionColor(player.position)}`}>
                                                            {player.position}
                                                        </span>
                                                    )}
                                                    {renderStars(player.stars)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleSubstitutePlayer(selectedPlayer.id, player.id, selectedTeam)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Substituir
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubstituteModal(false)} className="w-full">
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
        </div>
    );
}
