import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://keprgwmctvjafbflldry.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHJnd21jdHZqYWZiZmxsZHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ5ODgsImV4cCI6MjA4ODU0MDk4OH0.GQkrnfHGk4eWVYao5Jle9L-jZ7hGI0f76qQOCkhdZM8';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);