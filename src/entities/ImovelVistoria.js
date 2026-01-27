import { supabase } from '@/integrations/supabase/client';

// ImovelVistoria table doesn't exist yet in Supabase - using mock for now
// TODO: Create imoveis_vistoria table in Supabase
export const ImovelVistoria = {
  async list() {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('ImovelVistoria: Table not yet migrated to Supabase');
    return true;
  }
};
