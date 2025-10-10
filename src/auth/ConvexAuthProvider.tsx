import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppUser {
    id: string;
    email: string;
    name: string;
    role: string;
    membership?: string;
    group_id?: string;
    approved?: boolean;
    notifications_enabled?: boolean;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    signInOffline: (userData: AppUser) => void;
    updateAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshProfile: async () => { },
    signInOffline: () => { },
    updateAvatar: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Converter dados do Convex para formato do app
    const convertConvexUser = (convexUser: any): AppUser => ({
        id: convexUser._id,
        email: convexUser.email,
        name: convexUser.full_name,
        role: convexUser.role,
        membership: convexUser.membership,
        group_id: `group_${convexUser._id.slice(-8)}`,
        approved: true,
        notifications_enabled: true,
    });

    // Inicializar autenticação offline (temporário)
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Verificar se há usuário salvo no localStorage
                const offlineUser = localStorage.getItem('offline_user');
                if (offlineUser) {
                    const userData = JSON.parse(offlineUser);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ Erro ao carregar usuário offline:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Função de login com Google (usando Convex Auth)
    const signInWithGoogle = async () => {
        try {
            // O Convex Auth irá redirecionar para Google OAuth
            // Esta função será implementada quando configurarmos o Google OAuth no Convex
            console.log('🔐 Google OAuth será implementado com Convex Auth');

            // Por enquanto, usar autenticação offline como fallback
            const offlineUser = localStorage.getItem('offline_user');
            if (offlineUser) {
                const userData = JSON.parse(offlineUser);
                setUser(userData);
            }
        } catch (error) {
            console.error('❌ Erro no login Google:', error);
            throw error;
        }
    };

    // Função de logout
    const signOut = async () => {
        try {
            setUser(null);
            localStorage.removeItem('offline_user');

            // O Convex Auth irá limpar a sessão automaticamente
            console.log('🔐 Logout realizado');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            throw error;
        }
    };

    // Função para atualizar perfil
    const refreshProfile = async () => {
        try {
            const offlineUser = localStorage.getItem('offline_user');
            if (offlineUser) {
                const userData = JSON.parse(offlineUser);
                setUser(userData);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            throw error;
        }
    };

    // Função para login offline (compatibilidade)
    const signInOffline = (userData: AppUser) => {
        setUser(userData);
        localStorage.setItem('offline_user', JSON.stringify(userData));
    };

    // Função para atualizar avatar
    const updateAvatar = async (avatarUrl: string) => {
        try {
            // Implementar atualização de avatar no Convex quando necessário
            console.log('🖼️ Avatar será atualizado no Convex:', avatarUrl);

            // Por enquanto, atualizar apenas localmente
            if (user) {
                const updatedUser = { ...user, avatar: avatarUrl };
                setUser(updatedUser);
                localStorage.setItem('offline_user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar avatar:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            signOut,
            refreshProfile,
            signInOffline,
            updateAvatar,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
