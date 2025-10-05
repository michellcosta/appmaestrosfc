import { TeamColor } from '@/types';
import { useEffect, useState } from 'react';
import { Player, usePlayers } from './usePlayers';

export interface PlayerWithTeam extends Player {
    team_color?: TeamColor;
    is_substitute?: boolean;
    name?: string;
}

interface TeamDraw {
    id: string;
    match_id: string;
    created_at: string;
    players_per_team: number;
}

interface UseTeamDrawSupabaseReturn {
    // Estado
    players: PlayerWithTeam[];
    teamDraw: TeamDraw | null;
    loading: boolean;
    error: string | null;

    // Funções de times
    getPlayersByTeam: (teamColor: TeamColor) => PlayerWithTeam[];
    getAvailablePlayersForTeam: (teamColor: TeamColor) => PlayerWithTeam[];
    getAllAvailablePlayers: () => PlayerWithTeam[];

    // Ações
    loadTeamDraw: (matchId: string) => Promise<void>;
    drawTeams: (matchId: string, playersPerTeam?: 5 | 6) => Promise<void>;
    refreshTeamDraw: () => Promise<void>;

    // Substituições
    substitutePlayer: (playerId: string, substituteId: string, teamColor: TeamColor) => void;
    addPlayerToTeam: (player: Player, teamColor: TeamColor) => void;

    // Busca
    searchPlayers: (query: string) => PlayerWithTeam[];
    getPlayerById: (playerId: string) => PlayerWithTeam | undefined;
    getPlayerByName: (name: string) => PlayerWithTeam | undefined;

    // Validações
    canPlayerScore: (playerId: string, teamColor: TeamColor) => boolean;
    canPlayerAssist: (playerId: string, assistedPlayerId: string, teamColor: TeamColor) => boolean;

    // Estatísticas
    getTeamStats: () => Record<TeamColor, { total: number; active: number; substitutes: number }>;
    hasTeamDraw: boolean;
    isTeamDrawComplete: boolean;
}

export const useTeamDrawSupabase = (matchId?: string): UseTeamDrawSupabaseReturn => {
    const { players: supabasePlayers, loading: playersLoading, error: playersError, getApprovedPlayers } = usePlayers();
    const [teamDraw, setTeamDraw] = useState<TeamDraw | null>(null);
    const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMatchId, setCurrentMatchId] = useState<string | null>(matchId || null);

    // Converter jogadores do Supabase para formato do sorteio
    const convertPlayersToTeamDraw = (supabasePlayers: Player[]): PlayerWithTeam[] => {
        return supabasePlayers.map(player => ({
            ...player,
            name: player.email.split('@')[0], // Usar parte antes do @ como nome
            team_color: undefined,
            is_substitute: false
        }));
    };

    // Carregar sorteio de times do localStorage
    const loadTeamDraw = async (targetMatchId: string) => {
        try {
            setLoading(true);
            setError(null);
            setCurrentMatchId(targetMatchId);

            // Carregar dados do localStorage
            const storedData = localStorage.getItem(`teamDraw_${targetMatchId}`);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setTeamDraw(parsedData.teamDraw);

                // Mesclar jogadores do Supabase com dados de times
                const supabasePlayersList = getApprovedPlayers();
                const convertedPlayers = convertPlayersToTeamDraw(supabasePlayersList);

                // Aplicar dados de times salvos
                const playersWithTeams = convertedPlayers.map(player => {
                    const savedPlayer = parsedData.players.find((p: any) => p.id === player.id);
                    return savedPlayer ? { ...player, ...savedPlayer } : player;
                });

                setPlayers(playersWithTeams);
            } else {
                // Criar novo sorteio
                const newTeamDraw: TeamDraw = {
                    id: `draw_${Date.now()}`,
                    match_id: targetMatchId,
                    created_at: new Date().toISOString(),
                    players_per_team: 5
                };

                setTeamDraw(newTeamDraw);
                const supabasePlayersList = getApprovedPlayers();
                setPlayers(convertPlayersToTeamDraw(supabasePlayersList));
            }
        } catch (err) {
            console.error('Erro ao carregar sorteio de times:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar sorteio');
        } finally {
            setLoading(false);
        }
    };

    // Sortear times
    const drawTeams = async (targetMatchId: string, playersPerTeam: 5 | 6 = 5) => {
        try {
            setLoading(true);
            setError(null);

            const availablePlayers = getApprovedPlayers();

            if (availablePlayers.length < playersPerTeam * 2) {
                throw new Error(`Precisa de pelo menos ${playersPerTeam * 2} jogadores para sortear times`);
            }

            // Embaralhar jogadores
            const shuffledPlayers = [...availablePlayers].sort(() => Math.random() - 0.5);

            // Definir cores dos times
            const teamColors: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
            const selectedColors = teamColors.slice(0, Math.ceil(shuffledPlayers.length / playersPerTeam));

            // Distribuir jogadores nos times
            const playersWithTeams = shuffledPlayers.map((player, index) => {
                const teamIndex = Math.floor(index / playersPerTeam);
                const teamColor = selectedColors[teamIndex];
                const isSubstitute = index >= playersPerTeam * selectedColors.length;

                return {
                    ...player,
                    name: player.email.split('@')[0],
                    team_color: teamColor,
                    is_substitute: isSubstitute
                };
            });

            // Criar sorteio
            const newTeamDraw: TeamDraw = {
                id: `draw_${Date.now()}`,
                match_id: targetMatchId,
                created_at: new Date().toISOString(),
                players_per_team: playersPerTeam
            };

            setTeamDraw(newTeamDraw);
            setPlayers(playersWithTeams);
            setCurrentMatchId(targetMatchId);

            // Salvar no localStorage (fallback)
            localStorage.setItem(`teamDraw_${targetMatchId}`, JSON.stringify({
                teamDraw: newTeamDraw,
                players: playersWithTeams
            }));

            // 🔥 NOVO: Persistir no Supabase
            try {
                const { createMatchWithTeams } = await import('@/lib/db');

                // Calcular número de times
                const teamCount = selectedColors.length;

                // Criar partida no Supabase
                await createMatchWithTeams({
                    teamCount,
                    players: shuffledPlayers.map(p => ({
                        id: p.id,
                        name: p.email.split('@')[0] || p.email
                    })),
                    playersPerTeam
                });

                console.log('✅ Sorteio salvo no Supabase com sucesso');
            } catch (supabaseError) {
                console.warn('⚠️ Falha ao salvar no Supabase, usando apenas localStorage:', supabaseError);
                // Não jogar erro, permite continuar com localStorage
            }

        } catch (err) {
            console.error('Erro ao sortear times:', err);
            setError(err instanceof Error ? err.message : 'Erro ao sortear times');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Atualizar sorteio atual
    const refreshTeamDraw = async () => {
        if (currentMatchId) {
            await loadTeamDraw(currentMatchId);
        }
    };

    // Obter jogadores por time
    const getPlayersByTeam = (teamColor: TeamColor): PlayerWithTeam[] => {
        return players.filter(player => player.team_color === teamColor);
    };

    // Obter jogadores disponíveis para um time
    const getAvailablePlayersForTeam = (teamColor: TeamColor): PlayerWithTeam[] => {
        return players.filter(player =>
            !player.team_color || player.team_color === teamColor
        );
    };

    // Obter todos os jogadores disponíveis
    const getAllAvailablePlayers = (): PlayerWithTeam[] => {
        return players.filter(player => !player.team_color);
    };

    // Substituir jogador
    const substitutePlayer = (playerId: string, substituteId: string, teamColor: TeamColor) => {
        setPlayers(prev => {
            const newPlayers = [...prev];
            const playerIndex = newPlayers.findIndex(p => p.id === playerId);
            const substituteIndex = newPlayers.findIndex(p => p.id === substituteId);

            if (playerIndex !== -1 && substituteIndex !== -1) {
                // Trocar times
                const playerTeam = newPlayers[playerIndex].team_color;
                newPlayers[playerIndex].team_color = undefined;
                newPlayers[playerIndex].is_substitute = true;

                newPlayers[substituteIndex].team_color = playerTeam;
                newPlayers[substituteIndex].is_substitute = false;

                // Salvar no localStorage
                if (currentMatchId) {
                    localStorage.setItem(`teamDraw_${currentMatchId}`, JSON.stringify({
                        teamDraw,
                        players: newPlayers
                    }));
                }
            }

            return newPlayers;
        });
    };

    // Adicionar jogador ao time
    const addPlayerToTeam = (player: Player, teamColor: TeamColor) => {
        setPlayers(prev => {
            const newPlayers = [...prev];
            const playerIndex = newPlayers.findIndex(p => p.id === player.id);

            if (playerIndex !== -1) {
                newPlayers[playerIndex].team_color = teamColor;
                newPlayers[playerIndex].is_substitute = false;

                // Salvar no localStorage
                if (currentMatchId) {
                    localStorage.setItem(`teamDraw_${currentMatchId}`, JSON.stringify({
                        teamDraw,
                        players: newPlayers
                    }));
                }
            }

            return newPlayers;
        });
    };

    // Buscar jogadores
    const searchPlayers = (query: string): PlayerWithTeam[] => {
        const lowercaseQuery = query.toLowerCase();
        return players.filter(player =>
            player.email.toLowerCase().includes(lowercaseQuery) ||
            player.name?.toLowerCase().includes(lowercaseQuery)
        );
    };

    // Obter jogador por ID
    const getPlayerById = (playerId: string): PlayerWithTeam | undefined => {
        return players.find(player => player.id === playerId);
    };

    // Obter jogador por nome
    const getPlayerByName = (name: string): PlayerWithTeam | undefined => {
        return players.find(player => player.name === name);
    };

    // Verificar se jogador pode marcar gol
    const canPlayerScore = (playerId: string, teamColor: TeamColor): boolean => {
        const player = getPlayerById(playerId);
        return Boolean(player && player.team_color === teamColor && !player.is_substitute);
    };

    // Verificar se jogador pode dar assistência
    const canPlayerAssist = (playerId: string, assistedPlayerId: string, teamColor: TeamColor): boolean => {
        const player = getPlayerById(playerId);
        const assistedPlayer = getPlayerById(assistedPlayerId);

        return Boolean(
            player &&
            assistedPlayer &&
            player.team_color === teamColor &&
            assistedPlayer.team_color === teamColor &&
            player.id !== assistedPlayerId &&
            !player.is_substitute
        );
    };

    // Obter estatísticas dos times
    const getTeamStats = () => {
        const stats: Record<TeamColor, { total: number; active: number; substitutes: number }> = {
            Preto: { total: 0, active: 0, substitutes: 0 },
            Verde: { total: 0, active: 0, substitutes: 0 },
            Cinza: { total: 0, active: 0, substitutes: 0 },
            Vermelho: { total: 0, active: 0, substitutes: 0 }
        };

        players.forEach(player => {
            if (player.team_color) {
                stats[player.team_color].total++;
                if (player.is_substitute) {
                    stats[player.team_color].substitutes++;
                } else {
                    stats[player.team_color].active++;
                }
            }
        });

        return stats;
    };

    // Verificar se há sorteio de times
    const hasTeamDraw = Boolean(teamDraw && players.length > 0);

    // Verificar se sorteio está completo
    const isTeamDrawComplete = () => {
        if (!hasTeamDraw) return false;

        const stats = getTeamStats();
        const teamsWithPlayers = Object.values(stats).filter(stat => stat.active > 0).length;

        return teamsWithPlayers >= 2;
    };

    // Inicializar com matchId se fornecido
    useEffect(() => {
        if (matchId && matchId !== currentMatchId) {
            loadTeamDraw(matchId);
        }
    }, [matchId, currentMatchId]);

    // Atualizar jogadores quando Supabase players mudarem
    useEffect(() => {
        if (supabasePlayers.length > 0) {
            const convertedPlayers = convertPlayersToTeamDraw(getApprovedPlayers());

            if (currentMatchId) {
                // Mesclar com dados salvos
                const storedData = localStorage.getItem(`teamDraw_${currentMatchId}`);
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const playersWithTeams = convertedPlayers.map(player => {
                        const savedPlayer = parsedData.players.find((p: any) => p.id === player.id);
                        return savedPlayer ? { ...player, ...savedPlayer } : player;
                    });
                    setPlayers(playersWithTeams);
                } else {
                    setPlayers(convertedPlayers);
                }
            } else {
                setPlayers(convertedPlayers);
            }
        }
    }, [supabasePlayers, currentMatchId]);

    return {
        // Estado
        players,
        teamDraw,
        loading: loading || playersLoading,
        error: error || playersError,

        // Funções de times
        getPlayersByTeam,
        getAvailablePlayersForTeam,
        getAllAvailablePlayers,

        // Ações
        loadTeamDraw,
        drawTeams,
        refreshTeamDraw,

        // Substituições
        substitutePlayer,
        addPlayerToTeam,

        // Busca
        searchPlayers,
        getPlayerById,
        getPlayerByName,

        // Validações
        canPlayerScore,
        canPlayerAssist,

        // Estatísticas
        getTeamStats,
        hasTeamDraw,
        isTeamDrawComplete: isTeamDrawComplete()
    };
};

// Hook específico para modal de gol
export const useGoalModalSupabase = (matchId?: string) => {
    const teamDraw = useTeamDrawSupabase(matchId);

    // Obter opções de jogadores para seletor
    const getPlayerOptions = (teamColor: TeamColor) => {
        const players = teamDraw.getPlayersByTeam(teamColor);
        return players.map(player => ({
            value: player.id,
            label: player.name || player.email.split('@')[0],
            position: player.position,
            stars: player.stars
        }));
    };

    // Obter opções de assistência (mesmo time, exceto o autor)
    const getAssistOptions = (teamColor: TeamColor, authorId?: string) => {
        const players = teamDraw.getPlayersByTeam(teamColor);
        return players
            .filter(player => player.id !== authorId)
            .map(player => ({
                value: player.id,
                label: player.name || player.email.split('@')[0],
                position: player.position,
                stars: player.stars
            }));
    };

    // Validar gol
    const validateGoal = (authorId: string, assistId: string | null, teamColor: TeamColor) => {
        const errors: string[] = [];

        // Verificar se autor pode marcar
        if (!teamDraw.canPlayerScore(authorId, teamColor)) {
            errors.push('Jogador não pode marcar gol para este time');
        }

        // Verificar assistência se fornecida
        if (assistId && !teamDraw.canPlayerAssist(assistId, authorId, teamColor)) {
            errors.push('Jogador não pode dar assistência para este gol');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    return {
        ...teamDraw,
        getPlayerOptions,
        getAssistOptions,
        validateGoal
    };
};
