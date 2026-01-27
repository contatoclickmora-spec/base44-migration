import { supabase } from '@/integrations/supabase/client';

// Anuncio table doesn't exist yet in Supabase - using mock for now
// TODO: Create anuncios table in Supabase
export const Anuncio = {
  async list() {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('Anuncio: Table not yet migrated to Supabase');
    return true;
  }
};
