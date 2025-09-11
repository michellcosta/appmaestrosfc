// ENUM IMUTÁVEL DE CORES DOS TIMES
// Nunca permitir renomear, adicionar ou remover cores
export enum TeamColor {
  BLACK = 'Preto',
  GREEN = 'Verde',
  GRAY = 'Cinza',
  BIBS = 'Coletes'
}

export const TEAM_COLORS = Object.values(TeamColor) as readonly string[];

// Type guard para validar se uma string é uma cor válida
export function isValidTeamColor(color: string): color is TeamColor {
  return TEAM_COLORS.includes(color);
}

// Configuração visual das cores
export const TEAM_COLOR_CONFIG = {
  [TeamColor.BLACK]: {
    label: 'Preto',
    cssVar: 'team-black',
    icon: '⚫',
  },
  [TeamColor.GREEN]: {
    label: 'Verde',
    cssVar: 'team-green',
    icon: '🟢',
  },
  [TeamColor.GRAY]: {
    label: 'Cinza',
    cssVar: 'team-gray',
    icon: '⚪',
  },
  [TeamColor.BIBS]: {
    label: 'Coletes',
    cssVar: 'team-bibs',
    icon: '🟡',
  },
} as const;