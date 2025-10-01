import { ConvexProvider, ConvexReactClient } from "convex/react";

const url = (import.meta as any)?.env?.VITE_CONVEX_URL;
if (!url) console.warn("⚠ VITE_CONVEX_URL não configurada no .env");

const client = new ConvexReactClient(String(url || ""));

export default function Provider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
