// Utilitários de validação para dados do usuário

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role?: string;
  position?: string;
  shirtSize?: string;
  avatar?: string;
  custom_avatar?: string;
  avatar_url?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: UserData;
}

// Validação de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de nome
export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}

// Sanitização de string
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validação de dados do usuário
export function validateUserData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar se é um objeto
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados do usuário devem ser um objeto válido'],
      warnings: []
    };
  }

  // Validar nome
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Nome é obrigatório e deve ser uma string');
  } else {
    const sanitizedName = sanitizeString(data.name);
    if (!validateName(sanitizedName)) {
      errors.push('Nome deve ter entre 2 e 50 caracteres');
    }
  }

  // Validar email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório e deve ser uma string');
  } else {
    const sanitizedEmail = sanitizeString(data.email);
    if (!validateEmail(sanitizedEmail)) {
      errors.push('Email deve ter um formato válido');
    }
  }

  // Validar role (se fornecido)
  if (data.role && typeof data.role !== 'string') {
    warnings.push('Role deve ser uma string');
  } else if (data.role) {
    const validRoles = ['owner', 'admin', 'aux', 'mensalista', 'diarista', 'user'];
    if (!validRoles.includes(data.role)) {
      warnings.push('Role deve ser um dos valores válidos: owner, admin, aux, mensalista, diarista, user');
    }
  }

  // Validar posição (se fornecida)
  if (data.position && typeof data.position !== 'string') {
    warnings.push('Posição deve ser uma string');
  } else if (data.position) {
    const validPositions = ['Goleiro', 'Zagueiro', 'Meia', 'Atacante'];
    if (!validPositions.includes(data.position)) {
      warnings.push('Posição deve ser uma das opções válidas: Goleiro, Zagueiro, Meia, Atacante');
    }
  }

  // Validar tamanho da camisa (se fornecido)
  if (data.shirtSize && typeof data.shirtSize !== 'string') {
    warnings.push('Tamanho da camisa deve ser uma string');
  } else if (data.shirtSize) {
    const validSizes = ['P', 'M', 'G', 'GG', 'XG'];
    if (!validSizes.includes(data.shirtSize)) {
      warnings.push('Tamanho da camisa deve ser um dos valores válidos: P, M, G, GG, XG');
    }
  }

  // Validar URLs de avatar (se fornecidas)
  if (data.avatar && typeof data.avatar !== 'string') {
    warnings.push('Avatar deve ser uma string');
  } else if (data.avatar && !isValidUrl(data.avatar)) {
    warnings.push('Avatar deve ser uma URL válida');
  }

  if (data.custom_avatar && typeof data.custom_avatar !== 'string') {
    warnings.push('Custom avatar deve ser uma string');
  } else if (data.custom_avatar && !isValidUrl(data.custom_avatar)) {
    warnings.push('Custom avatar deve ser uma URL válida');
  }

  if (data.avatar_url && typeof data.avatar_url !== 'string') {
    warnings.push('Avatar URL deve ser uma string');
  } else if (data.avatar_url && !isValidUrl(data.avatar_url)) {
    warnings.push('Avatar URL deve ser uma URL válida');
  }

  // Se há erros, não é válido
  const isValid = errors.length === 0;

  // Sanitizar dados se válido
  let sanitizedData: UserData | undefined;
  if (isValid) {
    sanitizedData = {
      id: data.id || undefined,
      name: sanitizeString(data.name),
      email: sanitizeString(data.email),
      role: data.role ? sanitizeString(data.role) : undefined,
      position: data.position ? sanitizeString(data.position) : undefined,
      shirtSize: data.shirtSize ? sanitizeString(data.shirtSize) : undefined,
      avatar: data.avatar ? sanitizeString(data.avatar) : undefined,
      custom_avatar: data.custom_avatar ? sanitizeString(data.custom_avatar) : undefined,
      avatar_url: data.avatar_url ? sanitizeString(data.avatar_url) : undefined
    };
  }

  return {
    isValid,
    errors,
    warnings,
    sanitizedData
  };
}

// Validação de URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validação de dados de edição do jogador
export function validatePlayerInfo(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar posição
  if (data.position && typeof data.position !== 'string') {
    errors.push('Posição deve ser uma string');
  } else if (data.position) {
    const validPositions = ['Goleiro', 'Zagueiro', 'Meia', 'Atacante'];
    if (!validPositions.includes(data.position)) {
      errors.push('Posição deve ser uma das opções válidas: Goleiro, Zagueiro, Meia, Atacante');
    }
  }

  // Validar tamanho da camisa
  if (data.shirtSize && typeof data.shirtSize !== 'string') {
    errors.push('Tamanho da camisa deve ser uma string');
  } else if (data.shirtSize) {
    const validSizes = ['P', 'M', 'G', 'GG', 'XG'];
    if (!validSizes.includes(data.shirtSize)) {
      errors.push('Tamanho da camisa deve ser um dos valores válidos: P, M, G, GG, XG');
    }
  }

  const isValid = errors.length === 0;

  let sanitizedData: any = undefined;
  if (isValid) {
    sanitizedData = {
      position: data.position ? sanitizeString(data.position) : undefined,
      shirtSize: data.shirtSize ? sanitizeString(data.shirtSize) : undefined
    };
  }

  return {
    isValid,
    errors,
    warnings,
    sanitizedData
  };
}

// Validação de arquivo de imagem
export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar se é um arquivo
  if (!file || !(file instanceof File)) {
    return {
      isValid: false,
      errors: ['Arquivo inválido'],
      warnings: []
    };
  }

  // Verificar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    errors.push('Arquivo deve ser uma imagem');
  }

  // Verificar tamanho (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('Arquivo deve ter no máximo 10MB');
  }

  // Verificar tamanho mínimo (1KB)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    warnings.push('Arquivo muito pequeno, pode ser de baixa qualidade');
  }

  // Verificar extensões permitidas
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    warnings.push('Extensões recomendadas: JPG, PNG, GIF, WebP');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings
  };
}

// Validação de dados de estatísticas
export function validateStatsData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar se é um objeto
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados de estatísticas devem ser um objeto válido'],
      warnings: []
    };
  }

  // Validar campos numéricos
  const numericFields = ['victories', 'totalGoals', 'totalAssists', 'totalMatches', 'totalPayments', 'consecutiveMatches'];
  
  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (typeof data[field] !== 'number') {
        errors.push(`${field} deve ser um número`);
      } else if (!Number.isInteger(data[field])) {
        warnings.push(`${field} deve ser um número inteiro`);
      } else if (data[field] < 0) {
        errors.push(`${field} não pode ser negativo`);
      }
    }
  }

  const isValid = errors.length === 0;

  // Sanitizar dados se válido
  let sanitizedData: any = undefined;
  if (isValid) {
    sanitizedData = {};
    for (const field of numericFields) {
      if (data[field] !== undefined && data[field] !== null) {
        sanitizedData[field] = Math.max(0, Math.floor(data[field]));
      }
    }
  }

  return {
    isValid,
    errors,
    warnings,
    sanitizedData
  };
}

