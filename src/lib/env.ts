import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[env] Falta variable requerida: ${name}. Revisa .env.local`);
  }
  return v;
}

export function getSupabaseEnv(): { url: string; publishableKey: string; secretKey?: string } {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url.startsWith("https://")) throw new Error("[env] NEXT_PUBLIC_SUPABASE_URL debe ser https://");
  return { url, publishableKey, secretKey };
}
