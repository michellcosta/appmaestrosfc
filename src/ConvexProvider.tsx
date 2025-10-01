import { ConvexProvider, ConvexReactClient } from "convex/react";

// Função para obter URL do Convex
function getConvexUrl() {
    // Tentar diferentes formas de obter a URL
    const url1 = import.meta.env.VITE_CONVEX_URL;
    const url2 = (import.meta as any)?.env?.VITE_CONVEX_URL;
    const url3 = process.env.VITE_CONVEX_URL;

    console.log("🔍 Debug URLs:");
    console.log("  import.meta.env.VITE_CONVEX_URL:", url1);
    console.log("  (import.meta as any)?.env?.VITE_CONVEX_URL:", url2);
    console.log("  process.env.VITE_CONVEX_URL:", url3);

    // URL padrão que sabemos que funciona
    const defaultUrl = "https://expert-eagle-519.convex.cloud";

    // Verificar qual URL é válida
    const validUrl = [url1, url2, url3].find(url =>
        url &&
        url !== "undefined" &&
        url !== "" &&
        url.startsWith("https://")
    );

    const finalUrl = validUrl || defaultUrl;
    console.log("🔗 Convex URL final:", finalUrl);

    return finalUrl;
}

const convexUrl = getConvexUrl();
const client = new ConvexReactClient(convexUrl);

export default function Provider({ children }: { children: React.ReactNode }) {
    return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
