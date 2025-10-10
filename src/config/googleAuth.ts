// Configuração do Google OAuth

// Função para detectar se está sendo acessado via IP local
function isLocalNetworkAccess(): boolean {
  const hostname = window.location.hostname;
  return hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname === 'localhost';
}

// Função para obter o redirect_uri correto
function getRedirectUri(): string {
  if (isLocalNetworkAccess()) {
    // Para acesso via IP local, usar localhost
    return 'http://localhost:5173/auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
}

export const GOOGLE_AUTH_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: getRedirectUri(),
  scope: 'email profile'
};

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_AUTH_CONFIG.scope,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function isGoogleAuthConfigured(): boolean {
  return !!GOOGLE_AUTH_CONFIG.clientId;
}