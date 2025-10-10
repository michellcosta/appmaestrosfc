import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Player } from '@/hooks/usePlayersConvex';
import { CheckCircle2, Circle, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface PlayerSelectionModalProps {
    open: boolean;
    onClose: () => void;
    players: Player[];
    selectedIds: Set<string>;
    onToggle: (playerId: string) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
    onConfirm: () => void;
    minRequired: number;
    playersPerTeam: 4 | 5 | 6;
    onPlayersPerTeamChange: (value: 4 | 5 | 6) => void;
}

export function PlayerSelectionModal({
    open,
    onClose,
    players,
    selectedIds,
    onToggle,
    onSelectAll,
    onClearAll,
    onConfirm,
    minRequired,
    playersPerTeam,
    onPlayersPerTeamChange,
}: PlayerSelectionModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState<string>('all');

    // Filtrar jogadores
    const filteredPlayers = useMemo(() => {
        return players.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                player.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPosition = positionFilter === 'all' || player.position === positionFilter;

            return matchesSearch && matchesPosition;
        });
    }, [players, searchTerm, positionFilter]);

    // Obter posições únicas
    const positions = useMemo(() => {
        const uniquePositions = new Set(players.map(p => p.position).filter(Boolean));
        return Array.from(uniquePositions);
    }, [players]);

    const selectedCount = selectedIds.size;
    const isValid = selectedCount >= minRequired;
    // Calcular times baseado nos jogadores por time escolhido
    const numTeams = Math.ceil(selectedCount / playersPerTeam);
    const perTeamLimit = playersPerTeam;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Selecionar Jogadores para o Sorteio
                    </DialogTitle>
                </DialogHeader>

                {/* Seletor de Jogadores por Time */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Jogadores por time:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {([4, 5, 6] as const).map(num => (
                            <Button
                                key={num}
                                variant={playersPerTeam === num ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPlayersPerTeamChange(num)}
                                className={playersPerTeam === num ? 'bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700' : 'dark:text-slate-100 dark:border-slate-600'}
                            >
                                {num} jogadores
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Estatísticas - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-green-50 dark:bg-emerald-900/25 rounded-lg border border-green-200 dark:border-emerald-700">
                    <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-emerald-400">{selectedCount}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-300">Selecionados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{numTeams}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-300">Times</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{perTeamLimit}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-300">Por Time</div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        <Button
                            variant={positionFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPositionFilter('all')}
                            className="flex-shrink-0"
                        >
                            Todas
                        </Button>
                        {positions.map(position => (
                            <Button
                                key={position}
                                variant={positionFilter === position ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPositionFilter(position!)}
                                className="flex-shrink-0"
                            >
                                {position}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Lista de jogadores */}
                <div className="flex-1 overflow-y-auto max-h-[50vh] border rounded-lg dark:border-slate-700">
                    {filteredPlayers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-slate-300">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum jogador encontrado</p>
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-slate-700">
                            {filteredPlayers.map(player => {
                                const isSelected = selectedIds.has(player._id);
                                return (
                                    <div
                                        key={player._id}
                                        className={`p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${isSelected ? 'bg-green-50 dark:bg-emerald-900/25' : ''
                                            }`}
                                        onClick={() => onToggle(player._id)}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggle(player._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            {player.avatar_url ? (
                                                <img
                                                    src={player.avatar_url}
                                                    alt={player.name}
                                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                                    {player.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">{player.name}</div>
                                                <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1 sm:gap-2 flex-wrap">
                                                    {player.position && (
                                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 rounded text-xs">
                                                            {player.position}
                                                        </span>
                                                    )}
                                                    {player.approved ? (
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Circle className="h-3 w-3 text-gray-300" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mensagem de validação */}
                {!isValid && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        ⚠️ Selecione pelo menos {minRequired} jogadores para realizar o sorteio
                    </div>
                )}

                <DialogFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={onSelectAll} className="flex-1 sm:flex-none dark:text-slate-100 dark:border-slate-600">
                            Selecionar Todos
                        </Button>
                        <Button variant="outline" size="sm" onClick={onClearAll} className="flex-1 sm:flex-none dark:text-slate-100 dark:border-slate-600">
                            Limpar
                        </Button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                if (isValid) {
                                    onConfirm();
                                    onClose();
                                }
                            }}
                            disabled={!isValid}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                            Sortear ({selectedCount})
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

