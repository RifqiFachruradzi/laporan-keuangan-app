export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Supports both the new publishable key and the legacy anon key
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
