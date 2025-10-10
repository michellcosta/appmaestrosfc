import { v } from "convex/values";
import { action } from "./_generated/server";

// Interface para os dados do usuário do Google
interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// Action para trocar código OAuth por token (servidor-side seguro)
export const exchangeCodeForToken = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, { code, redirectUri }) => {
    try {
      // Obter client_secret do ambiente (seguro no servidor)
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Credenciais do Google não configuradas no servidor");
      }

      // Trocar código por token de acesso (servidor-side)
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Erro na resposta do Google:', errorText);
        throw new Error('Falha ao trocar código por token');
      }

      const tokenData = await tokenResponse.json();

      // Obter dados do usuário com o token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Falha ao obter dados do usuário');
      }

      const userInfo: GoogleUserInfo = await userInfoResponse.json();

      return {
        success: true,
        userInfo,
      };
    } catch (error) {
      console.error('❌ Erro no exchangeCodeForToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  },
});
