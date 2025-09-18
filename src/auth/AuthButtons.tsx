import React from 'react';
import { useAuth } from './SimpleAuthProvider';
import { Button } from '@/components/ui/button';

export const GoogleLoginButton: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <Button disabled={loading} onClick={signInWithGoogle}>
      Entrar com Google
    </Button>
  );
};

export const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  return <Button variant="secondary" onClick={signOut}>Sair</Button>;
};
