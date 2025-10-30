import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração do cliente Supabase via variáveis de ambiente
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(envUrl && envKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local para habilitar recursos de banco de dados.'
  );
}

// Exporta o cliente apenas se configurado; componentes devem checar isSupabaseConfigured
export const supabase = isSupabaseConfigured
  ? createClient<Database>(envUrl as string, envKey as string)
  : (null as unknown as ReturnType<typeof createClient<Database>>);

// Funções de autenticação com Supabase
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};