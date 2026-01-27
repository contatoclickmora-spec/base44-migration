import { supabase } from '@/integrations/supabase/client';

// Adapter that mimics the base44 SDK interface but uses Supabase
export const base44 = {
  auth: {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    logout: async (redirectUrl) => {
      await supabase.auth.signOut();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin: (returnUrl) => {
      window.location.href = `/Auth?returnUrl=${encodeURIComponent(returnUrl || '/')}`;
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      // Optional: implement logging if needed
      console.log(`[NAV] Page visited: ${pageName}`);
    }
  }
};
