import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";

export function useGoogleAuth() {
  const { handleGoogleSignIn, handleSignOut, currentUser, loading, error, isAuthenticated } = useConvexAuth();
  const upsertProfileFromGoogle = useMutation(api.profiles.upsertProfileFromGoogle);

  const createOrUpdateProfile = async (email: string, fullName: string, role: string = "diarista", picture?: string) => {
    try {
      console.log('��� Criando/atualizando perfil do Google...', { email, fullName, role });

      const profileId = await upsertProfileFromGoogle({
        email,
        full_name: fullName,
        role,
        membership: role === "mensalista" ? "mensalista" : "diarista",
        picture: picture // Incluir foto do Google
      });

      console.log('✅ Perfil criado/atualizado:', profileId);
      return profileId;
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar perfil:', error);
      throw error;
    }
  };

  return {
    handleGoogleSignIn,
    handleSignOut,
    createOrUpdateProfile,
    currentUser,
    loading,
    error,
    isAuthenticated
  };
}
