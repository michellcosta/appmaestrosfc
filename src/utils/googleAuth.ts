// Utilitários para Google OAuth real
export interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
}

// Função para detectar se está sendo acessado via IP local
function isLocalNetworkAccess(): boolean {
    const hostname = window.location.hostname;
    return hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname === 'localhost';
}

// Função para obter o redirect_uri correto
export function getRedirectUri(): string {
    if (isLocalNetworkAccess()) {
        // Para acesso via IP local, usar localhost
        return 'http://localhost:5173/auth/callback';
    }
    return `${window.location.origin}/auth/callback`;
}

export async function exchangeCodeForToken(code: string): Promise<GoogleUserInfo> {
    try {
        console.log('🔄 Trocando código por token do Google (servidor-side seguro)...');

        // ⚠️ IMPORTANTE: Esta função agora precisa ser chamada com o Convex action
        // Não podemos fazer chamadas diretas ao Convex aqui sem o ConvexHttpClient
        // Por isso, esta função será depreciada em favor de usar a action diretamente

        console.error('❌ exchangeCodeForToken não deve ser chamado diretamente');
        console.error('Use a action convex/googleAuth.ts:exchangeCodeForToken no callback');

        throw new Error('Use a Convex action exchangeCodeForToken no callback');
    } catch (error) {
        console.error('❌ Erro ao trocar código por token:', error);
        throw error;
    }
}

// Função para obter dados do usuário do Google (implementação real)
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao obter dados do usuário');
        }

        const userInfo = await response.json();
        console.log('✅ Dados reais do Google obtidos:', userInfo);
        return userInfo;
    } catch (error) {
        console.error('❌ Erro ao obter dados do usuário:', error);
        throw error;
    }
}

// Função para gerar URL de autorização do Google
export function getGoogleAuthUrl(): string {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const redirectUri = getRedirectUri();

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}