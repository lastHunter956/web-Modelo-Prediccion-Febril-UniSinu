import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL o Anon Key no configuradas. Verifica .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Desactivar Navigator LockManager para evitar timeouts en producción
      lock: 'no-op',
      // Usar almacenamiento por defecto (localStorage)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
