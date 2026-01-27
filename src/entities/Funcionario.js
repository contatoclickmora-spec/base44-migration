import { supabase } from '@/integrations/supabase/client';

// Funcionario table doesn't exist yet in Supabase - using mock for now
// TODO: Create funcionarios table in Supabase
export const Funcionario = {
  async list() {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return [];
  },

  async filter(filters = {}, options = {}) {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return [];
  },

  async get(id) {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return null;
  },

  async create(record) {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return record;
  },

  async update(id, updates) {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return { id, ...updates };
  },

  async delete(id) {
    console.warn('Funcionario: Table not yet migrated to Supabase');
    return true;
  }
};
