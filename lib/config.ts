for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent — fine; Next.js loads .env.local on its own for the app.
  }
}

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export const config = {
  deepseek: {
    apiKey: env("DEEPSEEK_API_KEY"),
    baseUrl: env("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com",
    modelThink: env("DEEPSEEK_MODEL_THINK") ?? "deepseek-reasoner",
    modelFast: env("DEEPSEEK_MODEL_FAST") ?? "deepseek-chat",
  },
  supabase: {
    url: env("SUPABASE_URL") ?? env("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: env("SUPABASE_ANON_KEY") ?? env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
    bucket: env("SUPABASE_BUCKET") ?? "shortwave",
    publicUrl: env("NEXT_PUBLIC_SUPABASE_URL"),
    publicAnonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  vault: { key: env("SW_TOKEN_KEK") },
  operatorEmail: env("OPERATOR_EMAIL"),
  resend: {
    apiKey: env("RESEND_API_KEY"),
    from: env("NOTIFY_FROM") ?? "Shortwave <onboarding@resend.dev>",
  },
  fal: { key: env("FAL_KEY") },
  replicate: { token: env("REPLICATE_API_TOKEN") },
  elevenlabs: {
    apiKey: env("ELEVENLABS_API_KEY"),
    voiceId: env("ELEVENLABS_VOICE_ID"),
  },
  openai: { apiKey: env("OPENAI_API_KEY") },
  instagram: {
    appId: env("IG_APP_ID"),
    appSecret: env("IG_APP_SECRET"),
    redirectUri:
      env("IG_REDIRECT_URI") ?? "http://localhost:3040/api/oauth/instagram",
    graphHost: env("IG_GRAPH_HOST") ?? "https://graph.instagram.com",
    apiVersion: env("IG_API_VERSION") ?? "v23.0",
  },
  appUrl: env("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3040",
} as const;

/** Demo mode: the app is fully viewable with mock data when core keys are absent. */
export function isDemo(): boolean {
  return !config.deepseek.apiKey || !config.supabase.url;
}
