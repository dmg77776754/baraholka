import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  console.error('⚠️  Add these Repository Secrets in GitHub:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
  console.error('📝 Or create .env file locally with these variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
