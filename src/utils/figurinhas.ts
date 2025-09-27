// Sistema completo de figurinhas/conquistas

export interface Figurinha {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  color: string;
  borderColor: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'unique';
  category: 'basicas' | 'intermediarias' | 'avancadas' | 'lendarias' | 'performance' | 'especiais';
  progress?: number; // Porcentagem de progresso (0-100)
}

export interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  totalPayments: number;
  consecutiveMatches: number;
  victories: number;
  // Novas estatísticas para figurinhas
  fastestGoal?: number; // Tempo em segundos do gol mais rápido
  goalAccuracy?: number; // Precisão de gols (0-100)
  cleanSheets?: number; // Partidas sem sofrer gol
  hatTricks?: number; // Hat-tricks feitos
  perfectAssists?: number; // Assistências perfeitas
  mvpCount?: number; // Vezes que foi MVP
  monthlyGoals?: number; // Gols no mês atual
  monthlyMatches?: number; // Partidas no mês atual
  loginDays?: number; // Dias consecutivos logado
}

// Categorias de figurinhas
export const figurinhaCategories = {
  basicas: { 
    name: "Básicas", 
    color: "green", 
    description: "Primeiros passos no futebol",
    icon: "🥉"
  },
  intermediarias: { 
    name: "Intermediárias", 
    color: "blue", 
    description: "Desenvolvendo suas habilidades",
    icon: "🥈"
  },
  avancadas: { 
    name: "Avançadas", 
    color: "purple", 
    description: "Dominando o jogo",
    icon: "🥇"
  },
  lendarias: { 
    name: "Lendárias", 
    color: "gold", 
    description: "Lendas do futebol",
    icon: "💎"
  },
  performance: { 
    name: "Performance", 
    color: "rainbow", 
    description: "Habilidades especiais",
    icon: "⭐"
  },
  especiais: { 
    name: "Especiais", 
    color: "unique", 
    description: "Conquistas únicas",
    icon: "👑"
  }
};

// Sistema de raridade
export const rarityConfig = {
  common: { 
    name: "Comum", 
    color: "from-green-400 to-emerald-500", 
    borderColor: "border-green-300 dark:border-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-800 dark:text-green-300"
  },
  rare: { 
    name: "Rara", 
    color: "from-blue-400 to-cyan-500", 
    borderColor: "border-blue-300 dark:border-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-800 dark:text-blue-300"
  },
  epic: { 
    name: "Épica", 
    color: "from-purple-400 to-violet-500", 
    borderColor: "border-purple-300 dark:border-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-800 dark:text-purple-300"
  },
  legendary: { 
    name: "Lendária", 
    color: "from-yellow-400 to-orange-500", 
    borderColor: "border-yellow-300 dark:border-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    textColor: "text-yellow-800 dark:text-yellow-300"
  },
  mythic: { 
    name: "Mítica", 
    color: "from-pink-400 to-rose-500", 
    borderColor: "border-pink-300 dark:border-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-800 dark:text-pink-300"
  },
  unique: { 
    name: "Única", 
    color: "from-yellow-400 to-orange-500", 
    borderColor: "border-yellow-300 dark:border-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    textColor: "text-yellow-800 dark:text-yellow-300"
  }
};

// Gerar todas as figurinhas baseadas nas estatísticas do jogador
export function generateAllFigurinhas(stats: PlayerStats, userRole?: string): Figurinha[] {
  const figurinhas: Figurinha[] = [];

  // 🥉 BÁSICAS (6 figurinhas)
  figurinhas.push({
    id: 'first-goal',
    name: 'Primeiro Gol',
    emoji: '⚽',
    description: '1º gol da vida',
    requirement: 1,
    current: stats.totalGoals,
    unlocked: stats.totalGoals >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  figurinhas.push({
    id: 'first-assist',
    name: 'Primeira Assist',
    emoji: '🎯',
    description: '1ª assistência',
    requirement: 1,
    current: stats.totalAssists,
    unlocked: stats.totalAssists >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  figurinhas.push({
    id: 'debutante',
    name: 'Debutante',
    emoji: '⭐',
    description: '1ª partida',
    requirement: 1,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  figurinhas.push({
    id: 'first-payment',
    name: 'Primeiro Pago',
    emoji: '💰',
    description: '1º pagamento',
    requirement: 1,
    current: stats.totalPayments,
    unlocked: stats.totalPayments >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  figurinhas.push({
    id: 'primeiro-passo',
    name: 'Primeiro Passo',
    emoji: '🏃',
    description: 'Participar de 1 partida',
    requirement: 1,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  figurinhas.push({
    id: 'boas-vindas',
    name: 'Boas Vindas',
    emoji: '👋',
    description: 'Fazer login pela primeira vez',
    requirement: 1,
    current: stats.loginDays || 0,
    unlocked: (stats.loginDays || 0) >= 1,
    color: rarityConfig.common.color,
    borderColor: rarityConfig.common.borderColor,
    rarity: 'common',
    category: 'basicas'
  });

  // 🥈 INTERMEDIÁRIAS (6 figurinhas)
  figurinhas.push({
    id: 'nao-falto-uma',
    name: 'Não Falto Uma',
    emoji: '🔗',
    description: '5 partidas seguidas',
    requirement: 5,
    current: stats.consecutiveMatches,
    unlocked: stats.consecutiveMatches >= 5,
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  figurinhas.push({
    id: 'presente',
    name: 'Presente',
    emoji: '🔥',
    description: '5 partidas total',
    requirement: 5,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 5,
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  figurinhas.push({
    id: 'velocista',
    name: 'Velocista',
    emoji: '⚡',
    description: 'Fazer 3 gols em 1 partida',
    requirement: 3,
    current: 0, // Seria calculado baseado em partidas individuais
    unlocked: false, // Lógica complexa para gols por partida
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  figurinhas.push({
    id: 'precisao',
    name: 'Precisão',
    emoji: '🎯',
    description: '5 assistências em 1 partida',
    requirement: 5,
    current: 0, // Seria calculado baseado em partidas individuais
    unlocked: false, // Lógica complexa para assistências por partida
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  figurinhas.push({
    id: 'resistencia',
    name: 'Resistência',
    emoji: '💪',
    description: 'Jogar 3 partidas seguidas',
    requirement: 3,
    current: stats.consecutiveMatches,
    unlocked: stats.consecutiveMatches >= 3,
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  figurinhas.push({
    id: 'maratonista',
    name: 'Maratonista',
    emoji: '🏃',
    description: '10 partidas em 1 mês',
    requirement: 10,
    current: stats.monthlyMatches || 0,
    unlocked: (stats.monthlyMatches || 0) >= 10,
    color: rarityConfig.rare.color,
    borderColor: rarityConfig.rare.borderColor,
    rarity: 'rare',
    category: 'intermediarias'
  });

  // 🥇 AVANÇADAS (6 figurinhas)
  figurinhas.push({
    id: 'artilheiro',
    name: 'Artilheiro',
    emoji: '🥊',
    description: '15+ gols total',
    requirement: 15,
    current: stats.totalGoals,
    unlocked: stats.totalGoals >= 15,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  figurinhas.push({
    id: 'criador',
    name: 'Criador',
    emoji: '⚡',
    description: '10+ assistências',
    requirement: 10,
    current: stats.totalAssists,
    unlocked: stats.totalAssists >= 10,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  figurinhas.push({
    id: 'rei-futebol',
    name: 'Rei do Futebol',
    emoji: '👑',
    description: '50 gols totais',
    requirement: 50,
    current: stats.totalGoals,
    unlocked: stats.totalGoals >= 50,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  figurinhas.push({
    id: 'mestre-assistencias',
    name: 'Mestre das Assistências',
    emoji: '🎪',
    description: '25 assistências totais',
    requirement: 25,
    current: stats.totalAssists,
    unlocked: stats.totalAssists >= 25,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  figurinhas.push({
    id: 'campeao',
    name: 'Campeão',
    emoji: '🏆',
    description: '20 vitórias totais',
    requirement: 20,
    current: stats.victories,
    unlocked: stats.victories >= 20,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  figurinhas.push({
    id: 'estrela',
    name: 'Estrela',
    emoji: '⭐',
    description: '100 partidas jogadas',
    requirement: 100,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 100,
    color: rarityConfig.epic.color,
    borderColor: rarityConfig.epic.borderColor,
    rarity: 'epic',
    category: 'avancadas'
  });

  // 💎 LENDÁRIAS (6 figurinhas)
  figurinhas.push({
    id: 'lenda-viva',
    name: 'Lenda Viva',
    emoji: '🔥',
    description: '100 gols totais',
    requirement: 100,
    current: stats.totalGoals,
    unlocked: stats.totalGoals >= 100,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  figurinhas.push({
    id: 'mestre-supremo',
    name: 'Mestre Supremo',
    emoji: '⚡',
    description: '50 assistências totais',
    requirement: 50,
    current: stats.totalAssists,
    unlocked: stats.totalAssists >= 50,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  figurinhas.push({
    id: 'imperador',
    name: 'Imperador',
    emoji: '👑',
    description: '50 vitórias totais',
    requirement: 50,
    current: stats.victories,
    unlocked: stats.victories >= 50,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  figurinhas.push({
    id: 'lenda',
    name: 'Lenda',
    emoji: '🌟',
    description: '200 partidas jogadas',
    requirement: 200,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 200,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  figurinhas.push({
    id: 'campeao-absoluto',
    name: 'Campeão Absoluto',
    emoji: '🏆',
    description: '100 vitórias totais',
    requirement: 100,
    current: stats.victories,
    unlocked: stats.victories >= 100,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  figurinhas.push({
    id: 'idolo',
    name: 'Ídolo',
    emoji: '⭐',
    description: '500 partidas jogadas',
    requirement: 500,
    current: stats.totalMatches,
    unlocked: stats.totalMatches >= 500,
    color: rarityConfig.legendary.color,
    borderColor: rarityConfig.legendary.borderColor,
    rarity: 'legendary',
    category: 'lendarias'
  });

  // ⭐ PERFORMANCE (6 figurinhas)
  figurinhas.push({
    id: 'raio',
    name: 'Raio',
    emoji: '⚡',
    description: 'Gol em menos de 1 minuto',
    requirement: 1,
    current: stats.fastestGoal ? (stats.fastestGoal < 60 ? 1 : 0) : 0,
    unlocked: (stats.fastestGoal || 999) < 60,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  figurinhas.push({
    id: 'atirador-elite',
    name: 'Atirador de Elite',
    emoji: '🎯',
    description: '90% de precisão em gols',
    requirement: 90,
    current: stats.goalAccuracy || 0,
    unlocked: (stats.goalAccuracy || 0) >= 90,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  figurinhas.push({
    id: 'muralha',
    name: 'Muralha',
    emoji: '🛡️',
    description: '0 gols sofridos em 5 partidas',
    requirement: 5,
    current: stats.cleanSheets || 0,
    unlocked: (stats.cleanSheets || 0) >= 5,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  figurinhas.push({
    id: 'hat-trick',
    name: 'Hat-trick',
    emoji: '🔥',
    description: '3 gols em 1 partida',
    requirement: 1,
    current: stats.hatTricks || 0,
    unlocked: (stats.hatTricks || 0) >= 1,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  figurinhas.push({
    id: 'assistencia-perfeita',
    name: 'Assistência Perfeita',
    emoji: '🎪',
    description: '5 assistências em 1 partida',
    requirement: 1,
    current: stats.perfectAssists || 0,
    unlocked: (stats.perfectAssists || 0) >= 1,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  figurinhas.push({
    id: 'mvp',
    name: 'MVP',
    emoji: '👑',
    description: 'Melhor jogador da partida',
    requirement: 1,
    current: stats.mvpCount || 0,
    unlocked: (stats.mvpCount || 0) >= 1,
    color: rarityConfig.mythic.color,
    borderColor: rarityConfig.mythic.borderColor,
    rarity: 'mythic',
    category: 'performance'
  });

  // 👑 ESPECIAIS (1 figurinha - Owner)
  if (userRole === 'owner') {
    figurinhas.push({
      id: 'grande-lider',
      name: 'O GRANDE LÍDER',
      emoji: '👑',
      description: 'Soberano Supremo',
      requirement: 1,
      current: 1,
      unlocked: true,
      color: rarityConfig.unique.color,
      borderColor: rarityConfig.unique.borderColor,
      rarity: 'unique',
      category: 'especiais'
    });
  }

  // Calcular progresso para figurinhas não desbloqueadas
  figurinhas.forEach(figurinha => {
    if (!figurinha.unlocked && figurinha.requirement > 0) {
      figurinha.progress = Math.min(100, (figurinha.current / figurinha.requirement) * 100);
    }
  });

  return figurinhas;
}

// Filtrar figurinhas por categoria
export function filterFigurinhasByCategory(figurinhas: Figurinha[], category: string): Figurinha[] {
  if (category === 'all') return figurinhas;
  return figurinhas.filter(f => f.category === category);
}

// Filtrar figurinhas por raridade
export function filterFigurinhasByRarity(figurinhas: Figurinha[], rarity: string): Figurinha[] {
  if (rarity === 'all') return figurinhas;
  return figurinhas.filter(f => f.rarity === rarity);
}

// Buscar figurinhas por texto
export function searchFigurinhas(figurinhas: Figurinha[], searchText: string): Figurinha[] {
  if (!searchText.trim()) return figurinhas;
  const search = searchText.toLowerCase();
  return figurinhas.filter(f => 
    f.name.toLowerCase().includes(search) ||
    f.description.toLowerCase().includes(search)
  );
}

// Estatísticas do catálogo
export function getCatalogStats(figurinhas: Figurinha[]) {
  const total = figurinhas.length;
  const unlocked = figurinhas.filter(f => f.unlocked).length;
  const locked = total - unlocked;
  const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  const byCategory = figurinhas.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byRarity = figurinhas.reduce((acc, f) => {
    acc[f.rarity] = (acc[f.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    unlocked,
    locked,
    progress,
    byCategory,
    byRarity
  };
}

