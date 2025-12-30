
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    // Warn but don't crash, to allow build to pass if env vars are missing
    console.warn("Supabase credentials missing. Check .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
