import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'PRAGMA CRM: Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env (proyecto Supabase).'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
