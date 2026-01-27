import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://exocfapvvpzxdxwqkosa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qj4hag0w4SNcG8qqTASmrw_qidyVNSr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
