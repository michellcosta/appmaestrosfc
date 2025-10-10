import { Player } from '@/hooks/usePlayersConvex';

export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';

export interface TeamState {
    players: Player[];
    totalStars: number;
}

export interface TeamsState {
    Preto: TeamState;
    Verde: TeamState;
    Cinza: TeamState;
    Vermelho?: TeamState;
}

export interface BalancingResult {
    teams: TeamsState;
    stats: {
        averageStars: number;
        minStars: number;
        maxStars: number;
        variance: number;
    };
}

/**
 * Calcula estatísticas dos times
 */
function calculateStats(teams: TeamsState): BalancingResult['stats'] {
    const teamsList = Object.values(teams).filter(Boolean) as TeamState[];
    const totalStarsList = teamsList.map(t => t.totalStars);

    const averageStars = totalStarsList.reduce((a, b) => a + b, 0) / teamsList.length;
    const minStars = Math.min(...totalStarsList);
    const maxStars = Math.max(...totalStarsList);

    // Calcular variância (dispersão dos valores)
    const variance = totalStarsList.reduce((sum, stars) => {
        return sum + Math.pow(stars - averageStars, 2);
    }, 0) / teamsList.length;

    return { averageStars, minStars, maxStars, variance };
}

/**
 * Encontra o melhor time para adicionar um jogador
 * Critérios (em ordem):
 * 1. Time com menor totalStars
 * 2. Se empate, time com menos jogadores
 * 3. Se ainda empatar, escolhe aleatoriamente
 */
function findBestTeam(
    teams: TeamsState,
    player: Player,
    perTeamLimit: number
): TeamColor | null {
    const availableTeams = (Object.entries(teams) as [TeamColor, TeamState][])
        .filter(([_, team]) => team && team.players.length < perTeamLimit);

    if (availableTeams.length === 0) return null;

    // Ordenar por totalStars (menor primeiro), depois por quantidade de jogadores
    availableTeams.sort(([, a], [, b]) => {
        if (a.totalStars !== b.totalStars) {
            return a.totalStars - b.totalStars;
        }
        return a.players.length - b.players.length;
    });

    // Pegar todos os times empatados com o menor totalStars
    const minStars = availableTeams[0][1].totalStars;
    const tiedTeams = availableTeams.filter(([, team]) => team.totalStars === minStars);

    // Se tiver empate, escolher aleatoriamente
    const selectedTeam = tiedTeams[Math.floor(Math.random() * tiedTeams.length)];

    return selectedTeam[0];
}

/**
 * Adiciona jogador a um time
 */
function addPlayerToTeam(teams: TeamsState, teamColor: TeamColor, player: Player): void {
    const team = teams[teamColor];
    if (!team) return;

    team.players.push(player);
    team.totalStars += player.stars || 0;
}

/**
 * Distribui posições críticas primeiro (goleiros)
 */
function allocateCriticalPositions(
    players: Player[],
    teams: TeamsState,
    perTeamLimit: number
): Player[] {
    const criticalPositions = ['Goleiro', 'goleiro', 'Gol'];
    const critical: Player[] = [];
    const regular: Player[] = [];

    players.forEach(player => {
        if (player.position && criticalPositions.includes(player.position)) {
            critical.push(player);
        } else {
            regular.push(player);
        }
    });

    // Distribuir jogadores críticos primeiro
    critical.forEach(player => {
        const bestTeam = findBestTeam(teams, player, perTeamLimit);
        if (bestTeam) {
            addPlayerToTeam(teams, bestTeam, player);
        }
    });

    return regular;
}

/**
 * Balanceia jogadores em times baseado em estrelas
 * @param players Jogadores já embaralhados
 * @param numTeams Número de times (3 ou 4)
 * @param customPerTeamLimit Limite customizado de jogadores por time (opcional)
 * @returns Times balanceados com estatísticas
 */
export function balanceTeams(
    players: Player[],
    numTeams: 3 | 4,
    customPerTeamLimit?: number
): BalancingResult {
    const perTeamLimit = customPerTeamLimit || Math.ceil(players.length / numTeams);

    // Inicializar times
    const teams: TeamsState = {
        Preto: { players: [], totalStars: 0 },
        Verde: { players: [], totalStars: 0 },
        Cinza: { players: [], totalStars: 0 },
    };

    if (numTeams === 4) {
        teams.Vermelho = { players: [], totalStars: 0 };
    }

    // 1. Alocar posições críticas (goleiros) primeiro
    const regularPlayers = allocateCriticalPositions(players, teams, perTeamLimit);

    // 2. Ordenar jogadores regulares por estrelas (decrescente)
    // Isso ajuda a distribuir os mais fortes primeiro
    const sortedPlayers = [...regularPlayers].sort((a, b) => {
        const starsA = a.stars || 0;
        const starsB = b.stars || 0;
        return starsB - starsA;
    });

    // 3. Distribuir jogadores restantes
    sortedPlayers.forEach(player => {
        const bestTeam = findBestTeam(teams, player, perTeamLimit);
        if (bestTeam) {
            addPlayerToTeam(teams, bestTeam, player);
        }
    });

    // 4. Calcular estatísticas finais
    const stats = calculateStats(teams);

    return { teams, stats };
}

/**
 * Verifica se dois sorteios são idênticos
 */
export function areDrawsEqual(draw1: TeamsState, draw2: TeamsState): boolean {
    const colors: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];

    return colors.every(color => {
        const team1 = draw1[color];
        const team2 = draw2[color];

        if (!team1 && !team2) return true;
        if (!team1 || !team2) return false;

        if (team1.players.length !== team2.players.length) return false;

        const ids1 = team1.players.map(p => p._id).sort();
        const ids2 = team2.players.map(p => p._id).sort();

        return ids1.every((id, i) => id === ids2[i]);
    });
}

