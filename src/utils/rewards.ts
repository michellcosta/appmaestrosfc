// Sistema de recompensas para figurinhas

export interface Reward {
  id: string;
  type: 'xp' | 'coins' | 'badge' | 'title' | 'unlock';
  value: number;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'unique';
}

export interface PlayerRewards {
  xp: number;
  coins: number;
  badges: string[];
  titles: string[];
  unlocked: string[];
}

// Recompensas por raridade de figurinha
export const rewardByRarity = {
  common: {
    xp: 10,
    coins: 5,
    badge: 'Iniciante',
    title: 'Novato'
  },
  rare: {
    xp: 25,
    coins: 15,
    badge: 'Aprendiz',
    title: 'Promissor'
  },
  epic: {
    xp: 50,
    coins: 30,
    badge: 'Experiente',
    title: 'Veterano'
  },
  legendary: {
    xp: 100,
    coins: 60,
    badge: 'Mestre',
    title: 'Lenda'
  },
  mythic: {
    xp: 200,
    coins: 120,
    badge: 'Lendário',
    title: 'Ídolo'
  },
  unique: {
    xp: 500,
    coins: 300,
    badge: 'Único',
    title: 'Soberano'
  }
};

// Recompensas especiais por categoria
export const categoryRewards = {
  basicas: {
    bonus: { xp: 5, coins: 2 },
    completion: { xp: 50, coins: 25, title: 'Fundador' }
  },
  intermediarias: {
    bonus: { xp: 10, coins: 5 },
    completion: { xp: 100, coins: 50, title: 'Desenvolvedor' }
  },
  avancadas: {
    bonus: { xp: 20, coins: 10 },
    completion: { xp: 200, coins: 100, title: 'Especialista' }
  },
  lendarias: {
    bonus: { xp: 40, coins: 20 },
    completion: { xp: 400, coins: 200, title: 'Mestre Supremo' }
  },
  performance: {
    bonus: { xp: 30, coins: 15 },
    completion: { xp: 300, coins: 150, title: 'Perfeccionista' }
  },
  especiais: {
    bonus: { xp: 100, coins: 50 },
    completion: { xp: 1000, coins: 500, title: 'Lenda Viva' }
  }
};

// Calcular recompensas para uma figurinha
export function calculateReward(figurinha: any, playerRewards: PlayerRewards): Reward[] {
  const rewards: Reward[] = [];
  const rarityReward = rewardByRarity[figurinha.rarity];
  const categoryReward = categoryRewards[figurinha.category];

  // Recompensa base por raridade
  rewards.push({
    id: `xp-${figurinha.id}`,
    type: 'xp',
    value: rarityReward.xp,
    name: 'Experiência',
    description: `+${rarityReward.xp} XP`,
    icon: '⭐',
    rarity: figurinha.rarity
  });

  rewards.push({
    id: `coins-${figurinha.id}`,
    type: 'coins',
    value: rarityReward.coins,
    name: 'Moedas',
    description: `+${rarityReward.coins} moedas`,
    icon: '🪙',
    rarity: figurinha.rarity
  });

  // Recompensa de badge se for a primeira da categoria
  const categoryCount = playerRewards.badges.filter(b => b.includes(categoryReward.bonus.title)).length;
  if (categoryCount === 0) {
    rewards.push({
      id: `badge-${figurinha.category}`,
      type: 'badge',
      value: 1,
      name: 'Badge',
      description: `Badge: ${categoryReward.bonus.title}`,
      icon: '🏆',
      rarity: figurinha.rarity
    });
  }

  // Recompensa de título se completar a categoria
  const categoryFigurinhas = 6; // Assumindo 6 figurinhas por categoria
  const unlockedInCategory = playerRewards.unlocked.filter(id => 
    id.includes(figurinha.category)
  ).length;

  if (unlockedInCategory === categoryFigurinhas - 1) { // Última da categoria
    rewards.push({
      id: `title-${figurinha.category}`,
      type: 'title',
      value: 1,
      name: 'Título',
      description: `Título: ${categoryReward.completion.title}`,
      icon: '👑',
      rarity: 'legendary'
    });
  }

  return rewards;
}

// Aplicar recompensas ao jogador
export function applyRewards(playerRewards: PlayerRewards, rewards: Reward[]): PlayerRewards {
  const newRewards = { ...playerRewards };

  rewards.forEach(reward => {
    switch (reward.type) {
      case 'xp':
        newRewards.xp += reward.value;
        break;
      case 'coins':
        newRewards.coins += reward.value;
        break;
      case 'badge':
        if (!newRewards.badges.includes(reward.name)) {
          newRewards.badges.push(reward.name);
        }
        break;
      case 'title':
        if (!newRewards.titles.includes(reward.name)) {
          newRewards.titles.push(reward.name);
        }
        break;
      case 'unlock':
        if (!newRewards.unlocked.includes(reward.name)) {
          newRewards.unlocked.push(reward.name);
        }
        break;
    }
  });

  return newRewards;
}

// Calcular nível do jogador baseado em XP
export function calculateLevel(xp: number): { level: number; xpToNext: number; progress: number } {
  const baseXP = 100;
  const level = Math.floor(xp / baseXP) + 1;
  const currentLevelXP = (level - 1) * baseXP;
  const nextLevelXP = level * baseXP;
  const xpToNext = nextLevelXP - xp;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    level,
    xpToNext,
    progress: Math.min(100, Math.max(0, progress))
  };
}

// Títulos especiais baseados em conquistas
export function getSpecialTitles(playerRewards: PlayerRewards): string[] {
  const titles: string[] = [];

  // Títulos baseados em XP
  if (playerRewards.xp >= 1000) titles.push('Veterano');
  if (playerRewards.xp >= 5000) titles.push('Mestre');
  if (playerRewards.xp >= 10000) titles.push('Lenda');

  // Títulos baseados em moedas
  if (playerRewards.coins >= 500) titles.push('Rico');
  if (playerRewards.coins >= 2000) titles.push('Milionário');

  // Títulos baseados em badges
  if (playerRewards.badges.length >= 10) titles.push('Colecionador');
  if (playerRewards.badges.length >= 25) titles.push('Arquiteto');

  return titles;
}

