import { createClient } from '@supabase/supabase-js';

// Identifiants Supabase Aziz Fashion
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jgewuhofxbtizfaeensu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ytc-YFz3zxZXWk0jiNNZkA_9E_F5Cp2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
