import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// URL do Convex - você pode configurar isso no .env
const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://expert-eagle-519.convex.cloud';

if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL não configurada no .env');
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
