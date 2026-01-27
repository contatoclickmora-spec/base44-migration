import { supabase } from '@/integrations/supabase/client';

// Vistoria table doesn't exist yet in Supabase - using mock for now
// TODO: Create vistorias table in Supabase
export const Vistoria = {
  async list() {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('Vistoria: Table not yet migrated to Supabase');
    return true;
  }
};
