import { Player } from '@/hooks/usePlayersConvex';
import { shuffleWithSeed } from './shuffle';
import { TeamsState, areDrawsEqual, balanceTeams } from './teamBalancing';

export interface TeamDrawResult {
    matchId: string;
    teams: TeamsState;
    selectedPlayerIds: string[];
    createdAt: number;
    seed: number;
    stats: {
        averageStars: number;
        minStars: number;
        maxStars: number;
        variance: number;
    };
}

/**
 * Calcula o número de times baseado na quantidade de jogadores
 */
export function calculateNumTeams(playerCount: number): 3 | 4 {
    return playerCount >= 24 ? 4 : 3;
}

/**
 * Calcula o limite de jogadores por time
 */
export function calculatePerTeamLimit(playerCount: number, numTeams: 3 | 4): number {
    return Math.ceil(playerCount / numTeams);
}

/**
 * Calcula estrelas padrão baseadas na média do grupo
 */
function getDefaultStars(players: Player[]): number {
    const playersWithStars = players.filter(p => p.stars && p.stars > 0);

    if (playersWithStars.length === 0) return 10;

    const average = playersWithStars.reduce((sum, p) => sum + (p.stars || 0), 0) / playersWithStars.length;
    return Math.round(average);
}

/**
 * Prepara jogadores para o sorteio (normaliza estrelas)
 */
function preparePlayers(players: Player[]): Player[] {
    const defaultStars = getDefaultStars(players);

    return players.map(player => ({
        ...player,
        stars: player.stars && player.stars > 0 ? player.stars : defaultStars
    }));
}

/**
 * Realiza o sorteio de times
 * @param selectedPlayers Jogadores selecionados para o sorteio
 * @param matchId ID da partida
 * @param seed Seed opcional para reproduzir sorteio
 * @param playersPerTeam Jogadores por time (4, 5 ou 6) - opcional
 * @returns Resultado completo do sorteio
 */
export function performTeamDraw(
    selectedPlayers: Player[],
    matchId: string,
    seed?: number,
    playersPerTeam?: 4 | 5 | 6
): TeamDrawResult {
    // 1. Preparar jogadores (normalizar estrelas)
    const preparedPlayers = preparePlayers(selectedPlayers);

    // 2. Embaralhar jogadores
    const { shuffled, seed: usedSeed } = shuffleWithSeed(preparedPlayers, seed);

    // 3. Determinar número de times - SEMPRE 3 (exceto se >= 24 jogadores)
    const numTeams = selectedPlayers.length >= 24 ? 4 : 3;

    // 4. Calcular limite por time (pode ser desigual)
    const perTeamLimit = playersPerTeam || Math.ceil(selectedPlayers.length / numTeams);

    // 5. Balancear times
    const { teams, stats } = balanceTeams(shuffled, numTeams, perTeamLimit);

    // 5. Montar resultado
    return {
        matchId,
        teams,
        selectedPlayerIds: selectedPlayers.map(p => p._id),
        createdAt: Date.now(),
        seed: usedSeed,
        stats,
    };
}

/**
 * Gera um novo sorteio garantindo que seja diferente do anterior
 * @param selectedPlayers Jogadores selecionados
 * @param matchId ID da partida
 * @param previousDraw Sorteio anterior (opcional)
 * @param maxAttempts Número máximo de tentativas
 * @param playersPerTeam Jogadores por time (4, 5 ou 6) - opcional
 * @returns Novo sorteio diferente do anterior
 */
export function generateUniqueDraw(
    selectedPlayers: Player[],
    matchId: string,
    previousDraw?: TeamDrawResult,
    maxAttempts: number = 10,
    playersPerTeam?: 4 | 5 | 6
): TeamDrawResult {
    // Se não há sorteio anterior, fazer um novo
    if (!previousDraw) {
        return performTeamDraw(selectedPlayers, matchId, undefined, playersPerTeam);
    }

    // Tentar gerar sorteio diferente
    for (let i = 0; i < maxAttempts; i++) {
        const newSeed = Date.now() + i * 1000 + Math.random() * 1000;
        const newDraw = performTeamDraw(selectedPlayers, matchId, newSeed, playersPerTeam);

        if (!areDrawsEqual(newDraw.teams, previousDraw.teams)) {
            return newDraw;
        }
    }

    // Se após maxAttempts ainda não conseguiu um diferente, retornar o último
    // (improvável com embaralhamento aleatório, mas possível com poucos jogadores)
    console.warn('Não foi possível gerar sorteio único após', maxAttempts, 'tentativas');
    return performTeamDraw(selectedPlayers, matchId, Date.now() + Math.random() * 10000, playersPerTeam);
}

/**
 * Valida se os jogadores selecionados são suficientes para sorteio
 */
export function validatePlayerSelection(players: Player[]): {
    valid: boolean;
    message?: string;
    minRequired: number;
} {
    const minRequired = 6; // Mínimo para 3 times de 2 jogadores

    if (players.length < minRequired) {
        return {
            valid: false,
            message: `Selecione pelo menos ${minRequired} jogadores para o sorteio`,
            minRequired,
        };
    }

    return {
        valid: true,
        minRequired,
    };
}

