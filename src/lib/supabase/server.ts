import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey, secretKey } = getSupabaseEnv();
  const supabaseKey = secretKey ?? publishableKey;

  return createServerClient(url, supabaseKey,
    {
      cookies: {
        getAll(): { name: string; value: string }[] {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: object }[],
        ): void {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorar si se llama desde Server Component
          }
        },
      },
    },
  );
}
