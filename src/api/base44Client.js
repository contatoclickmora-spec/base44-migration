import { supabase } from '@/integrations/supabase/client';

// Import all entities for compatibility
import { Morador } from '@/entities/Morador';
import { Condominio } from '@/entities/Condominio';
import { Encomenda } from '@/entities/Encomenda';
import { Chamado } from '@/entities/Chamado';
import { Visitante } from '@/entities/Visitante';
import { LogSistema } from '@/entities/LogSistema';
import { PermissoesUsuario } from '@/entities/PermissoesUsuario';
import { User } from '@/entities/User';
import { Residencia } from '@/entities/Residencia';
import { Anuncio } from '@/entities/Anuncio';
import { ImovelVistoria } from '@/entities/ImovelVistoria';
import { Vistoria } from '@/entities/Vistoria';
import { Inquilino } from '@/entities/Inquilino';
import { CreditoVistoria } from '@/entities/CreditoVistoria';
import { Bloco } from '@/entities/Bloco';
import { Aviso } from '@/entities/Aviso';
import { Enquete } from '@/entities/Enquete';
import { AlertaSOS } from '@/entities/AlertaSOS';
import { Funcionario } from '@/entities/Funcionario';
import { MensagemWhatsApp } from '@/entities/MensagemWhatsApp';
import { WhatsAppConfig } from '@/entities/WhatsAppConfig';

// Mock base44 client for migration - replaces @base44/sdk
export const base44 = {
  auth: {
    async me() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.nome || user.email,
        ...profile
      };
    },
    async logout(redirectUrl) {
      await supabase.auth.signOut();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async redirectToLogin(returnUrl) {
      // For now just redirect to root - implement proper login page later
      window.location.href = returnUrl || '/';
    }
  },
  entities: {
    Morador,
    Condominio,
    Encomenda,
    Chamado,
    Visitante,
    LogSistema,
    PermissoesUsuario,
    User,
    Residencia,
    Anuncio,
    ImovelVistoria,
    Vistoria,
    Inquilino,
    CreditoVistoria,
    Bloco,
    Aviso,
    Enquete,
    AlertaSOS,
    Funcionario,
    MensagemWhatsApp,
    WhatsAppConfig,
    // Additional mock entities that may be used
    PerguntaEnquete: {
      async list() { return []; },
      async filter() { return []; },
      async create(data) { return { id: crypto.randomUUID(), ...data }; },
      async delete() { return true; }
    },
    VotoEnquete: {
      async list() { return []; },
      async filter() { return []; },
      async create(data) { return { id: crypto.randomUUID(), ...data }; },
      async delete() { return true; }
    },
    Entregador: {
      async list() { return []; },
      async filter() { return []; },
      async create(data) { return { id: crypto.randomUUID(), ...data }; },
      async delete() { return true; }
    },
    RegistroEntrega: {
      async list() { return []; },
      async filter() { return []; },
      async create(data) { return { id: crypto.randomUUID(), ...data }; },
      async delete() { return true; }
    },
    PerfilPermissao: {
      async list() { return []; },
      async filter() { return []; },
      async create(data) { return { id: crypto.randomUUID(), ...data }; },
      async update(id, data) { return { id, ...data }; },
      async delete() { return true; }
    }
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        // TODO: Implement with Supabase Storage
        console.warn('UploadFile not implemented - needs Supabase Storage bucket');
        return { file_url: '' };
      }
    }
  },
  // For edge functions
  asServiceRole: {
    entities: {
      Morador,
      Condominio,
      Encomenda,
      WhatsAppConfig,
      MensagemWhatsApp,
      AlertaSOS
    }
  }
};

// For compatibility with pages that import appParams
export const appParams = {
  appId: '',
  token: '',
  functionsVersion: '',
  appBaseUrl: ''
};
