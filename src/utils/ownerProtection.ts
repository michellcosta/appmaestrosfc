/**
 * Sistema de proteção para o owner principal (Michell Oliveira)
 * Impede alterações no cargo e remoção do sistema
 */

export const MAIN_OWNER_EMAIL = 'michell.oliveira@gmail.com';
export const MAIN_OWNER_NAME = 'Michell Oliveira';

/**
 * Verifica se o usuário é o owner principal protegido
 */
export function isMainOwner(email: string, name?: string): boolean {
  return email === MAIN_OWNER_EMAIL || name === MAIN_OWNER_NAME;
}

/**
 * Verifica se pode alterar o role de um usuário
 */
export function canChangeUserRole(userEmail: string, userRole: string, newRole: string): boolean {
  // Se é o owner principal, não pode alterar o próprio role
  if (isMainOwner(userEmail) && userRole === 'owner') {
    return false;
  }

  // Se está tentando alterar o owner principal, não pode
  if (isMainOwner(userEmail) && newRole !== 'owner') {
    return false;
  }

  return true;
}

/**
 * Verifica se pode remover um usuário
 */
export function canRemoveUser(userEmail: string): boolean {
  // Owner principal não pode ser removido
  return !isMainOwner(userEmail);
}

/**
 * Verifica se pode desativar um usuário
 */
export function canDeactivateUser(userEmail: string): boolean {
  // Owner principal não pode ser desativado
  return !isMainOwner(userEmail);
}

/**
 * Mensagens de erro para proteção
 */
export const PROTECTION_MESSAGES = {
  CANNOT_CHANGE_OWNER_ROLE: '❌ Não é possível alterar o cargo do owner principal do sistema.',
  CANNOT_REMOVE_OWNER: '❌ Não é possível remover o owner principal do sistema.',
  CANNOT_DEACTIVATE_OWNER: '❌ Não é possível desativar o owner principal do sistema.',
  OWNER_PROTECTION: '🛡️ Este usuário possui proteção especial como owner principal.'
} as const;

/**
 * Validação completa para operações em usuários
 */
export function validateUserOperation(
  operation: 'update' | 'remove' | 'deactivate',
  userEmail: string,
  userRole: string,
  newRole?: string
): { allowed: boolean; message?: string } {

  if (!isMainOwner(userEmail)) {
    return { allowed: true };
  }

  switch (operation) {
    case 'update':
      if (newRole && !canChangeUserRole(userEmail, userRole, newRole)) {
        return {
          allowed: false,
          message: PROTECTION_MESSAGES.CANNOT_CHANGE_OWNER_ROLE
        };
      }
      break;

    case 'remove':
      if (!canRemoveUser(userEmail)) {
        return {
          allowed: false,
          message: PROTECTION_MESSAGES.CANNOT_REMOVE_OWNER
        };
      }
      break;

    case 'deactivate':
      if (!canDeactivateUser(userEmail)) {
        return {
          allowed: false,
          message: PROTECTION_MESSAGES.CANNOT_DEACTIVATE_OWNER
        };
      }
      break;
  }

  return { allowed: true };
}