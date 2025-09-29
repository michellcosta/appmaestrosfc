/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SENTRY_DSN: string
  readonly MP_ACCESS_TOKEN: string
  readonly MP_BASE_URL: string
  readonly APP_PUBLIC_BASE_URL: string
  readonly EDGE_FUNCTION_SECRET: string
  readonly PROVIDER_WEBHOOK_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}