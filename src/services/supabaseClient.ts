import { createClient } from '@supabase/supabase-js';

// Compatibilité Environnement (Vite / Node.js)
const getEnvVar = (name: string): string | undefined => {
  // @ts-ignore
  const env = import.meta.env;
  if (env) {
    return env[name];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://jgewuhofxbtizfaeensu.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_ytc-YFz3zxZXWk0jiNNZkA_9E_F5Cp2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
