import React, { useState, useMemo } from 'react';
import { Search, Filter, Trophy, Star, Crown, Zap, Target, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  generateAllFigurinhas, 
  filterFigurinhasByCategory, 
  filterFigurinhasByRarity, 
  searchFigurinhas,
  getCatalogStats,
  figurinhaCategories,
  rarityConfig,
  type Figurinha,
  type PlayerStats
} from '@/utils/figurinhas';

interface FigurinhasCatalogProps {
  playerStats: PlayerStats;
  userRole?: string;
  onClose?: () => void;
}

export function FigurinhasCatalog({ playerStats, userRole, onClose }: FigurinhasCatalogProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Gerar todas as figurinhas
  const allFigurinhas = useMemo(() => 
    generateAllFigurinhas(playerStats, userRole), 
    [playerStats, userRole]
  );

  // Filtrar figurinhas
  const filteredFigurinhas = useMemo(() => {
    let filtered = allFigurinhas;

    // Busca por texto
    if (searchText.trim()) {
      filtered = searchFigurinhas(filtered, searchText);
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filterFigurinhasByCategory(filtered, selectedCategory);
    }

    // Filtro por raridade
    if (selectedRarity !== 'all') {
      filtered = filterFigurinhasByRarity(filtered, selectedRarity);
    }

    // Mostrar apenas desbloqueadas
    if (showOnlyUnlocked) {
      filtered = filtered.filter(f => f.unlocked);
    }

    return filtered;
  }, [allFigurinhas, searchText, selectedCategory, selectedRarity, showOnlyUnlocked]);

  // Estatísticas do catálogo
  const stats = useMemo(() => getCatalogStats(allFigurinhas), [allFigurinhas]);

  // Componente de figurinha individual
  const FigurinhaCard = ({ figurinha }: { figurinha: Figurinha }) => (
    <Card className={`
      relative overflow-hidden transition-all duration-300 hover:scale-105
      ${figurinha.unlocked 
        ? `bg-gradient-to-br ${figurinha.color} ${rarityConfig[figurinha.rarity].bgColor} border-2 ${figurinha.borderColor}` 
        : 'bg-muted/50 border-muted'
      }
    `}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-3xl">{figurinha.emoji}</div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={figurinha.unlocked ? "default" : "secondary"}
              className={`
                ${figurinha.unlocked 
                  ? `bg-gradient-to-r ${figurinha.color} text-white` 
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {rarityConfig[figurinha.rarity].name}
            </Badge>
            {figurinha.unlocked && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`font-bold text-lg ${figurinha.unlocked ? rarityConfig[figurinha.rarity].textColor : 'text-muted-foreground'}`}>
            {figurinha.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {figurinha.description}
          </p>
          
          {!figurinha.unlocked && figurinha.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{Math.round(figurinha.progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${figurinha.progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {figurinha.current} / {figurinha.requirement}
              </div>
            </div>
          )}

          {figurinha.unlocked && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Trophy className="h-3 w-3" />
              <span>Desbloqueada!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Figurinhas</h2>
          <p className="text-muted-foreground">
            {stats.unlocked} de {stats.total} figurinhas desbloqueadas ({stats.progress}%)
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.unlocked}</div>
              <div className="text-sm text-muted-foreground">Desbloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.locked}</div>
              <div className="text-sm text-muted-foreground">Bloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.progress}%</div>
              <div className="text-sm text-muted-foreground">Progresso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar figurinhas..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {Object.entries(figurinhaCategories).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Raridade */}
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger>
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as raridades</SelectItem>
                {Object.entries(rarityConfig).map(([key, rarity]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${rarity.color}`} />
                      {rarity.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Apenas desbloqueadas */}
            <Button
              variant={showOnlyUnlocked ? "default" : "outline"}
              onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              {showOnlyUnlocked ? 'Todas' : 'Desbloqueadas'}
            </Button>

            {/* Limpar filtros */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchText('');
                setSelectedCategory('all');
                setSelectedRarity('all');
                setShowOnlyUnlocked(false);
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de figurinhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFigurinhas.map((figurinha) => (
          <FigurinhaCard key={figurinha.id} figurinha={figurinha} />
        ))}
      </div>

      {/* Mensagem quando não há resultados */}
      {filteredFigurinhas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma figurinha encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar as figurinhas que procura.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

