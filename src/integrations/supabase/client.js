import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://exocfapvvpzxdxwqkosa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4b2NmYXB2dnB6eGR4d3Frb3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzE5MTYsImV4cCI6MjA4NTEwNzkxNn0.neChh8nGwHfwePad3exEcY-ywJYLFrlvZeLhqgGS9qY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
