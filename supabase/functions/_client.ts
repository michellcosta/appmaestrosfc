/**
 * Cliente para chamar o PostgREST com Service Role (apenas dentro da Edge Function)
 * NUNCA exponha SERVICE_ROLE_KEY no front!
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
