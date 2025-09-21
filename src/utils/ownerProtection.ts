/**
 * Sistema de Proteção do Owner Principal
 * Garante que apenas o owner principal possa criar novos owners e não possa ser excluído
 */

// ID do owner principal - será definido automaticamente no primeiro login
let MAIN_OWNER_ID: string | null = null;

/**
 * Define o ID do owner principal
 * Deve ser chamado apenas uma vez, no primeiro login
 */
export function setMainOwnerId(userId: string): void {
  if (!MAIN_OWNER_ID) {
    MAIN_OWNER_ID = userId;
    localStorage.setItem('main_owner_id', userId);
    console.log('🔒 Owner principal definido:', userId);
  }
}

/**
 * Obtém o ID do owner principal
 */
export function getMainOwnerId(): string | null {
  if (!MAIN_OWNER_ID) {
    MAIN_OWNER_ID = localStorage.getItem('main_owner_id');
  }
  return MAIN_OWNER_ID;
}

/**
 * Verifica se o usuário atual é o owner principal
 */
export function isMainOwner(userId: string | undefined): boolean {
  if (!userId) return false;
  const mainOwnerId = getMainOwnerId();
  return mainOwnerId === userId;
}

/**
 * Verifica se é permitido criar novos owners
 * Apenas o owner principal pode criar novos owners
 */
export function canCreateOwner(currentUserId: string | undefined): boolean {
  return isMainOwner(currentUserId);
}

/**
 * Verifica se é permitido excluir um usuário
 * O owner principal não pode ser excluído
 */
export function canDeleteUser(targetUserId: string, currentUserId: string | undefined): boolean {
  const mainOwnerId = getMainOwnerId();
  
  // Não pode excluir o owner principal
  if (targetUserId === mainOwnerId) {
    return false;
  }
  
  // Apenas o owner principal pode excluir outros usuários
  return isMainOwner(currentUserId);
}

/**
 * Inicializa o sistema de proteção
 * Deve ser chamado no início da aplicação
 */
export function initializeOwnerProtection(currentUser: any): void {
  if (currentUser?.role === 'owner' && currentUser?.id) {
    // Se não há owner principal definido, define o usuário atual
    if (!getMainOwnerId()) {
      setMainOwnerId(currentUser.id);
    }
  }
}

/**
 * Mensagens de erro para proteções
 */
export const PROTECTION_MESSAGES = {
  CANNOT_CREATE_OWNER: '🚫 Apenas o owner principal pode criar novos owners.',
  CANNOT_DELETE_MAIN_OWNER: '🚫 O owner principal não pode ser excluído.',
  ONLY_MAIN_OWNER_CAN_DELETE: '🚫 Apenas o owner principal pode excluir usuários.',
  ACCESS_DENIED: '🚫 Acesso negado. Você não tem permissão para esta ação.',
  CANNOT_LOGOUT_MAIN_OWNER: '🚫 O owner principal não pode fazer logout.'
};