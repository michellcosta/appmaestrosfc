import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export interface Match {
    _id: Id<"matches">;
    title: string;
    date: number;
    status: 'pending' | 'live' | 'ended';
    created_by: string;
    created_at: number;
    started_at?: number;
    ended_at?: number;
}

export interface MatchEvent {
    _id: Id<"match_events">;
    match_id: Id<"matches">;
    type: 'goal' | 'assist' | 'yellow_card' | 'red_card';
    player_id: Id<"players">;
    assist_player_id?: Id<"players">;
    team: string;
    minute: number;
    round_number: number;
    is_own_goal?: boolean;
    is_penalty?: boolean;
    created_at: number;
    player_name?: string;
    assist_player_name?: string;
}

export interface MatchPlayer {
    _id: Id<"match_players">;
    match_id: Id<"matches">;
    player_id: Id<"players">;
    team: string;
    player_name?: string;
    player_email?: string;
    player_position?: string;
}

export interface LiveMatchView {
    match: Match;
    players: MatchPlayer[];
    playersByTeam: Record<string, MatchPlayer[]>;
    events: MatchEvent[];
    score: Record<string, number>;
    totalEvents: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
}

export interface CreateMatchData {
    title: string;
    date: number;
    userId: string;
}

export interface AddGoalData {
    matchId: Id<"matches">;
    playerId: Id<"players">;
    assistPlayerId?: Id<"players">;
    team: string;
    minute: number;
    roundNumber: number;
    isOwnGoal?: boolean;
    isPenalty?: boolean;
}

export interface AddCardData {
    matchId: Id<"matches">;
    playerId: Id<"players">;
    team: string;
    minute: number;
    roundNumber: number;
    cardType: 'yellow_card' | 'red_card';
}

export function useMatchesConvex() {
    try {
        // Queries
        const matches = useQuery(api.matches.list);
        const pendingMatches = useQuery(api.matches.list, { status: 'pending' });
        const liveMatches = useQuery(api.matches.list, { status: 'live' });
        const endedMatches = useQuery(api.matches.list, { status: 'ended' });

        // Mutations
        const createMatchMutation = useMutation(api.matches.create);
        const drawTeamsMutation = useMutation(api.matches.drawTeams);
        const startMatchMutation = useMutation(api.matches.start);
        const endMatchMutation = useMutation(api.matches.end);
        const addGoalMutation = useMutation(api.matches.addGoal);
        const addCardMutation = useMutation(api.matches.addCard);

        // Helper functions
        const createMatch = async (data: CreateMatchData): Promise<Id<"matches">> => {
            try {
                const matchId = await createMatchMutation({
                    title: data.title,
                    date: data.date,
                    userId: data.userId
                });
                return matchId;
            } catch (error) {
                console.error('Erro ao criar partida:', error);
                throw error;
            }
        };

        const drawTeams = async (matchId: Id<"matches">, playerIds: Id<"players">[]): Promise<{ teamA: Id<"players">[], teamB: Id<"players">[] }> => {
            try {
                const result = await drawTeamsMutation({ matchId, playerIds });
                return result;
            } catch (error) {
                console.error('Erro ao sortear times:', error);
                throw error;
            }
        };

        const startMatch = async (matchId: Id<"matches">): Promise<void> => {
            try {
                await startMatchMutation({ matchId });
            } catch (error) {
                console.error('Erro ao iniciar partida:', error);
                throw error;
            }
        };

        const endMatch = async (matchId: Id<"matches">): Promise<void> => {
            try {
                await endMatchMutation({ matchId });
            } catch (error) {
                console.error('Erro ao finalizar partida:', error);
                throw error;
            }
        };

        const addGoal = async (data: AddGoalData): Promise<Id<"match_events">> => {
            try {
                const eventId = await addGoalMutation(data);
                return eventId;
            } catch (error) {
                console.error('Erro ao adicionar gol:', error);
                throw error;
            }
        };

        const addCard = async (data: AddCardData): Promise<Id<"match_events">> => {
            try {
                const eventId = await addCardMutation(data);
                return eventId;
            } catch (error) {
                console.error('Erro ao adicionar cartão:', error);
                throw error;
            }
        };

        return {
            // Data
            matches: matches || [],
            pendingMatches: pendingMatches || [],
            liveMatches: liveMatches || [],
            endedMatches: endedMatches || [],

            // Actions
            createMatch,
            drawTeams,
            startMatch,
            endMatch,
            addGoal,
            addCard,

            // Loading states
            isLoading: matches === undefined
        };
    } catch (error) {
        console.error('Erro no useMatchesConvex:', error);
        return {
            // Data
            matches: [],
            pendingMatches: [],
            liveMatches: [],
            endedMatches: [],

            // Actions
            createMatch: async () => { throw new Error('Convex não disponível'); },
            drawTeams: async () => { throw new Error('Convex não disponível'); },
            startMatch: async () => { throw new Error('Convex não disponível'); },
            endMatch: async () => { throw new Error('Convex não disponível'); },
            addGoal: async () => { throw new Error('Convex não disponível'); },
            addCard: async () => { throw new Error('Convex não disponível'); },

            // Loading states
            isLoading: false
        };
    }
}

// Hook para visão ao vivo de uma partida específica
export function useLiveMatchView(matchId: Id<"matches">) {
    try {
        const liveView = useQuery(api.matches.getLiveView, { matchId });
        const matchEvents = useQuery(api.matches.getMatchEvents, { matchId });

        return {
            liveView: liveView as LiveMatchView | null,
            matchEvents: matchEvents || [],
            loading: liveView === undefined,
            error: null
        };
    } catch (error) {
        console.error('Erro no useLiveMatchView:', error);
        return {
            liveView: null,
            matchEvents: [],
            loading: false,
            error: 'Erro ao carregar dados da partida'
        };
    }
}

// Hook para uma partida específica
export function useMatch(matchId: Id<"matches">) {
    try {
        const match = useQuery(api.matches.get, { matchId });

        return {
            match: match as Match | null,
            loading: match === undefined,
            error: null
        };
    } catch (error) {
        console.error('Erro no useMatch:', error);
        return {
            match: null,
            loading: false,
            error: 'Erro ao carregar partida'
        };
    }
}
