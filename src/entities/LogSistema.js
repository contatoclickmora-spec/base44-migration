import { supabase } from '@/integrations/supabase/client';

// LogSistema table doesn't exist yet in Supabase - using mock for now
// TODO: Create log_sistema table in Supabase
export const LogSistema = {
  async list() {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('LogSistema: Table not yet migrated to Supabase');
    return true;
  }
};
