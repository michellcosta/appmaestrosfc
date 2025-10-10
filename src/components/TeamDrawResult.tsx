import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/hooks/usePlayersConvex';
import { TeamColor, TeamsState } from '@/utils/teamBalancing';
import { RefreshCw, Save, Users } from 'lucide-react';

interface TeamDrawResultProps {
    teams: TeamsState;
    stats: {
        averageStars: number;
        minStars: number;
        maxStars: number;
        variance: number;
    };
    onRedraw?: () => void;
    onSave?: () => void;
    isLoading?: boolean;
}

const teamColors: Record<TeamColor, { bg: string; border: string; text: string; icon: string }> = {
    Preto: {
        bg: 'bg-gray-900',
        border: 'border-gray-700',
        text: 'text-white',
        icon: '⚫'
    },
    Verde: {
        bg: 'bg-green-600',
        border: 'border-green-500',
        text: 'text-white',
        icon: '🟢'
    },
    Cinza: {
        bg: 'bg-gray-500',
        border: 'border-gray-400',
        text: 'text-white',
        icon: '⚪'
    },
    Vermelho: {
        bg: 'bg-red-600',
        border: 'border-red-500',
        text: 'text-white',
        icon: '🔴'
    },
};

function TeamCard({ color, players }: { color: TeamColor; players: Player[] }) {
    const colorConfig = teamColors[color];

    return (
        <Card className={`border-2 ${colorConfig.border} dark:bg-slate-900/90`}>
            <CardHeader className={`${colorConfig.bg} ${colorConfig.text} py-2 sm:py-3`}>
                <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-lg sm:text-xl">{colorConfig.icon}</span>
                        <span>Time {color}</span>
                    </span>
                    <span className="text-xs sm:text-sm font-normal opacity-90">
                        {players.length} jogador{players.length !== 1 ? 'es' : ''}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 dark:bg-slate-900/90">
                {players.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-slate-300 text-sm">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Nenhum jogador
                    </div>
                ) : (
                    players.map((player, index) => (
                        <div
                            key={player._id}
                            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="flex-shrink-0 w-5 sm:w-6 text-center text-xs font-medium text-gray-500 dark:text-slate-400">
                                {index + 1}
                            </div>

                            {player.avatar_url ? (
                                <img
                                    src={player.avatar_url}
                                    alt={player.name}
                                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${colorConfig.bg} flex items-center justify-center ${colorConfig.text} text-xs font-bold`}>
                                    {player.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-slate-100 truncate">
                                    {player.name}
                                </div>
                                {player.position && (
                                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 truncate">{player.position}</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export function TeamDrawResult({
    teams,
    stats,
    onRedraw,
    onSave,
    isLoading,
}: TeamDrawResultProps) {
    const activeTeams = Object.entries(teams).filter(([_, team]) => team !== undefined) as [TeamColor, typeof teams.Preto][];

    return (
        <div className="space-y-4">
            {/* Feedback de balanceamento */}
            <div className="rounded-lg p-4 bg-white dark:bg-slate-900 border border-green-200 dark:border-emerald-700 text-green-900 dark:text-emerald-200">
                <div className="flex items-center justify-center gap-2">
                    <div className="text-lg sm:text-xl">✅</div>
                    <h3 className="font-semibold text-sm sm:text-base">
                        Times Balanceados Automaticamente
                    </h3>
                </div>
            </div>

            {/* Botões de ação - Responsivos */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {onRedraw && (
                    <Button
                        variant="outline"
                        onClick={onRedraw}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Sortear Novamente
                    </Button>
                )}
                {onSave && (
                    <Button
                        onClick={onSave}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                        <Save className="h-4 w-4" />
                        Confirmar Times
                    </Button>
                )}
            </div>

            {/* Grid de times - Otimizado para Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activeTeams.map(([color, team]) => (
                    <TeamCard key={color} color={color} players={team.players} />
                ))}
            </div>
        </div>
    );
}

