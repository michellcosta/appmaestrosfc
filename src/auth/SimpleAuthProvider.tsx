import React, { createContext, useContext, useState } from 'react';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'owner'|'admin'|'aux'|'mensalista'|'diarista';
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInOffline: (email: string, password: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  signInOffline: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signInOffline = async (email: string, password: string) => {
    const userData = {
      id: 'offline-' + Date.now(),
      email: email,
      name: email.split('@')[0],
      role: 'owner' as const
    };
    setUser(userData);
  };

  const signInWithGoogle = async () => {
    console.log('Google Auth not implemented in simple version');
  };

  const signOut = async () => {
    setUser(null);
  };

  const refreshProfile = async () => {
    // Simple implementation
  };

  return (
    <Ctx.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      refreshProfile,
      signInOffline,
    }}>
      {children}
    </Ctx.Provider>
  );
}