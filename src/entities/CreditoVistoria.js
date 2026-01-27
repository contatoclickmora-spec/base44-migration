import { supabase } from '@/integrations/supabase/client';

// CreditoVistoria table doesn't exist yet in Supabase - using mock for now
// TODO: Create creditos_vistoria table in Supabase
export const CreditoVistoria = {
  async list() {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('CreditoVistoria: Table not yet migrated to Supabase');
    return true;
  }
};
