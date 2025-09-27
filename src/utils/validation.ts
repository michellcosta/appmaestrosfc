// Utilitários de validação para dados de jogadores

export interface PlayerData {
  id: string | number;
  name: string;
  team?: string;
  goals: number;
  assists: number;
  games: number;
  victories: number;
  draws: number;
  defeats: number;
  medals?: string;
  title?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: PlayerData;
}

// Validação de tipos e valores
export function validatePlayerData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar se é um objeto
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados do jogador devem ser um objeto válido'],
      warnings: []
    };
  }

  // Validar ID
  if (!data.id && data.id !== 0) {
    errors.push('ID do jogador é obrigatório');
  } else if (typeof data.id !== 'string' && typeof data.id !== 'number') {
    errors.push('ID do jogador deve ser string ou número');
  }

  // Validar nome
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Nome do jogador é obrigatório e deve ser uma string');
  } else if (data.name.trim().length === 0) {
    errors.push('Nome do jogador não pode estar vazio');
  } else if (data.name.length > 50) {
    warnings.push('Nome do jogador é muito longo (máximo 50 caracteres)');
  }

  // Validar estatísticas numéricas
  const numericFields = ['goals', 'assists', 'games', 'victories', 'draws', 'defeats'];
  
  for (const field of numericFields) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`${field} é obrigatório`);
    } else if (typeof data[field] !== 'number') {
      errors.push(`${field} deve ser um número`);
    } else if (!Number.isInteger(data[field])) {
      warnings.push(`${field} deve ser um número inteiro`);
    } else if (data[field] < 0) {
      errors.push(`${field} não pode ser negativo`);
    }
  }

  // Validações específicas
  if (data.games < 0) {
    errors.push('Número de jogos não pode ser negativo');
  }

  if (data.goals < 0) {
    errors.push('Número de gols não pode ser negativo');
  }

  if (data.assists < 0) {
    errors.push('Número de assistências não pode ser negativo');
  }

  // Validar consistência dos resultados
  const totalResults = (data.victories || 0) + (data.draws || 0) + (data.defeats || 0);
  if (data.games && totalResults > data.games) {
    warnings.push('Soma de vitórias + empates + derrotas excede número de jogos');
  }

  // Validar campos opcionais
  if (data.team && typeof data.team !== 'string') {
    warnings.push('Time deve ser uma string');
  }

  if (data.medals && typeof data.medals !== 'string') {
    warnings.push('Medalhas devem ser uma string');
  }

  if (data.title && typeof data.title !== 'string') {
    warnings.push('Título deve ser uma string');
  }

  // Se há erros, não é válido
  const isValid = errors.length === 0;

  // Sanitizar dados se válido
  let sanitizedData: PlayerData | undefined;
  if (isValid) {
    sanitizedData = {
      id: data.id,
      name: data.name.trim(),
      team: data.team?.trim() || '',
      goals: Math.max(0, Math.floor(data.goals || 0)),
      assists: Math.max(0, Math.floor(data.assists || 0)),
      games: Math.max(0, Math.floor(data.games || 0)),
      victories: Math.max(0, Math.floor(data.victories || 0)),
      draws: Math.max(0, Math.floor(data.draws || 0)),
      defeats: Math.max(0, Math.floor(data.defeats || 0)),
      medals: data.medals?.trim() || '',
      title: data.title?.trim() || ''
    };
  }

  return {
    isValid,
    errors,
    warnings,
    sanitizedData
  };
}

// Validar array de jogadores
export function validatePlayersArray(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validPlayers: PlayerData[] = [];

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Dados devem ser um array de jogadores'],
      warnings: []
    };
  }

  if (data.length === 0) {
    warnings.push('Array de jogadores está vazio');
  }

  // Validar cada jogador
  data.forEach((player, index) => {
    const result = validatePlayerData(player);
    
    if (!result.isValid) {
      errors.push(`Jogador ${index + 1}: ${result.errors.join(', ')}`);
    } else {
      validPlayers.push(result.sanitizedData!);
    }

    if (result.warnings.length > 0) {
      warnings.push(`Jogador ${index + 1}: ${result.warnings.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: validPlayers
  };
}

// Sanitizar dados de entrada
export function sanitizePlayerData(data: any): PlayerData {
  return {
    id: data.id || `player-${Date.now()}`,
    name: String(data.name || 'Jogador').trim(),
    team: String(data.team || '').trim(),
    goals: Math.max(0, Math.floor(Number(data.goals) || 0)),
    assists: Math.max(0, Math.floor(Number(data.assists) || 0)),
    games: Math.max(0, Math.floor(Number(data.games) || 0)),
    victories: Math.max(0, Math.floor(Number(data.victories) || 0)),
    draws: Math.max(0, Math.floor(Number(data.draws) || 0)),
    defeats: Math.max(0, Math.floor(Number(data.defeats) || 0)),
    medals: String(data.medals || '').trim(),
    title: String(data.title || '').trim()
  };
}

// Validar dados do localStorage
export function validateStorageData(storageKey: string): ValidationResult {
  try {
    const data = localStorage.getItem(storageKey);
    if (!data) {
      return {
        isValid: false,
        errors: [`Chave '${storageKey}' não encontrada no localStorage`],
        warnings: []
      };
    }

    const parsed = JSON.parse(data);
    
    if (Array.isArray(parsed)) {
      return validatePlayersArray(parsed);
    } else if (parsed.players && Array.isArray(parsed.players)) {
      return validatePlayersArray(parsed.players);
    } else if (parsed.state && Array.isArray(parsed.state.players)) {
      return validatePlayersArray(parsed.state.players);
    } else {
      return {
        isValid: false,
        errors: [`Dados em '${storageKey}' não são um array de jogadores válido`],
        warnings: []
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Erro ao processar dados de '${storageKey}': ${error}`],
      warnings: []
    };
  }
}

// Função de geração de dados mock removida - sistema baseado apenas em dados reais
