// Arquivo temporário para compatibilidade - Supabase removido
// Este arquivo será removido após migração completa

console.warn('⚠️ Supabase foi removido. Migrando para Convex...');

// Mock do cliente Supabase para evitar erros
export const supabase = {
    from: (table: string) => ({
        select: () => ({
            eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
            eq: () => Promise.resolve({ data: null, error: null })
        }),
        delete: () => ({
            eq: () => Promise.resolve({ data: null, error: null })
        })
    }),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
    }
};

export default supabase;
