import { supabase } from '@/integrations/supabase/client';

// Inquilino table doesn't exist yet in Supabase - using mock for now
// TODO: Create inquilinos table in Supabase
export const Inquilino = {
  async list() {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('Inquilino: Table not yet migrated to Supabase');
    return true;
  }
};
