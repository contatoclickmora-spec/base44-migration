import { supabase } from '@/integrations/supabase/client';
import { Morador } from '@/entities/Morador';
import { Encomenda } from '@/entities/Encomenda';
import { Condominio } from '@/entities/Condominio';
import { Visitante } from '@/entities/Visitante';
import { Chamado } from '@/entities/Chamado';
import { LogSistema } from '@/entities/LogSistema';
import { Bloco } from '@/entities/Bloco';
import { Residencia } from '@/entities/Residencia';

// Adapter that mimics the base44 SDK interface but uses Supabase
export const base44 = {
  auth: {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;
      
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.nome || user.email,
        ...profile
      };
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
  entities: {
    Morador,
    Encomenda,
    Condominio,
    Visitante,
    Chamado,
    LogSistema,
    Bloco,
    Residencia
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log(`[NAV] Page visited: ${pageName}`);
    }
  }
};
