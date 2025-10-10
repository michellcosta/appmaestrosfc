import { TeamColor } from '@/utils/teamBalancing';
import {
    TeamDrawResult,
    generateUniqueDraw,
    performTeamDraw,
    validatePlayerSelection
} from '@/utils/teamDrawing';
import { useCallback, useMemo, useState } from 'react';
import { usePlayersConvex } from './usePlayersConvex';

export type { TeamColor };

export interface PlayerWithTeam {
    id: string;
    name: string;
    email: string;
    team_color: TeamColor;
    is_substitute: boolean;
    stars?: number;
}

export function useTeamDrawConvex(matchId?: string) {
    const { players, isLoading } = usePlayersConvex();
    const [currentDraw, setCurrentDraw] = useState<TeamDrawResult | null>(null);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());

    const approvedPlayers = useMemo(() => {
        return players.filter(player => player.approved && player.active);
    }, [players]);

    const selectedPlayers = useMemo(() => {
        return approvedPlayers.filter(p => selectedPlayerIds.has(p._id));
    }, [approvedPlayers, selectedPlayerIds]);

    // Toggle seleção de jogador
    const togglePlayerSelection = useCallback((playerId: string) => {
        setSelectedPlayerIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(playerId)) {
                newSet.delete(playerId);
            } else {
                newSet.add(playerId);
            }
            return newSet;
        });
    }, []);

    // Selecionar todos
    const selectAll = useCallback(() => {
        const allIds = new Set(approvedPlayers.map(p => p._id));
        setSelectedPlayerIds(allIds);
    }, [approvedPlayers]);

    // Limpar seleção
    const clearSelection = useCallback(() => {
        setSelectedPlayerIds(new Set());
    }, []);

    // Realizar sorteio
    const drawTeams = useCallback(async (targetMatchId: string, playersPerTeam?: 4 | 5 | 6, seed?: number) => {
        if (!targetMatchId) {
            throw new Error('Match ID é obrigatório');
        }

        // Validar seleção
        const validation = validatePlayerSelection(selectedPlayers);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Realizar sorteio
        const result = performTeamDraw(selectedPlayers, targetMatchId, seed, playersPerTeam);
        setCurrentDraw(result);

        // Salvar no localStorage (compatibilidade)
        localStorage.setItem(`teamDraw_${targetMatchId}`, JSON.stringify(result));

        return result;
    }, [selectedPlayers]);

    // Sortear novamente (garantindo diferença)
    const redraw = useCallback(async (targetMatchId: string, playersPerTeam?: 4 | 5 | 6) => {
        if (!targetMatchId) {
            throw new Error('Match ID é obrigatório');
        }

        const validation = validatePlayerSelection(selectedPlayers);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        const result = generateUniqueDraw(selectedPlayers, targetMatchId, currentDraw || undefined, 10, playersPerTeam);
        setCurrentDraw(result);

        localStorage.setItem(`teamDraw_${targetMatchId}`, JSON.stringify(result));

        return result;
    }, [selectedPlayers, currentDraw]);

    // Carregar sorteio salvo
    const loadTeamDraw = useCallback(async (targetMatchId: string) => {
        const teamDrawData = localStorage.getItem(`teamDraw_${targetMatchId}`);
        if (teamDrawData) {
            try {
                const result: TeamDrawResult = JSON.parse(teamDrawData);
                setCurrentDraw(result);

                // Restaurar seleção de jogadores
                setSelectedPlayerIds(new Set(result.selectedPlayerIds));

                return result;
            } catch (error) {
                console.error('Erro ao carregar sorteio:', error);
                return null;
            }
        }
        return null;
    }, []);

    // Obter jogadores de um time específico
    const getPlayersByTeam = useCallback((teamColor: TeamColor) => {
        if (!currentDraw) return [];
        return currentDraw.teams[teamColor]?.players || [];
    }, [currentDraw]);

    // Verificar se existe sorteio
    const hasTeamDraw = useCallback((targetMatchId: string) => {
        const teamDrawData = localStorage.getItem(`teamDraw_${targetMatchId}`);
        return !!teamDrawData;
    }, []);

    // Verificar se sorteio está completo
    const isTeamDrawComplete = useCallback((targetMatchId: string) => {
        const teamDrawData = localStorage.getItem(`teamDraw_${targetMatchId}`);
        if (teamDrawData) {
            try {
                const result: TeamDrawResult = JSON.parse(teamDrawData);
                return !!result.teams;
            } catch {
                return false;
            }
        }
        return false;
    }, []);

    // Validar seleção atual
    const validation = useMemo(() => {
        return validatePlayerSelection(selectedPlayers);
    }, [selectedPlayers]);

    return {
        // Jogadores
        approvedPlayers,
        selectedPlayers,
        selectedPlayerIds,

        // Estado
        currentDraw,
        isLoading,
        validation,

        // Ações de seleção
        togglePlayerSelection,
        selectAll,
        clearSelection,

        // Ações de sorteio
        drawTeams,
        redraw,
        loadTeamDraw,

        // Helpers
        getPlayersByTeam,
        hasTeamDraw,
        isTeamDrawComplete,
    };
}
