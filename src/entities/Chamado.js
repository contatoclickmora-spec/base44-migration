import { supabase } from '@/integrations/supabase/client';

// Chamados table doesn't exist yet in Supabase - using mock for now
// TODO: Create chamados table in Supabase
export const Chamado = {
  async list() {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('Chamado: Table not yet migrated to Supabase');
    return true;
  }
};
