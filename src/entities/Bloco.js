import { supabase } from '@/integrations/supabase/client';

export const Bloco = {
  async list() {
    const { data, error } = await supabase.from('blocos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async filter(filters = {}) {
    let query = supabase.from('blocos').select('*');
    Object.entries(filters).forEach(([k, v]) => { if (v != null) query = query.eq(k, v); });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async get(id) {
    const { data, error } = await supabase.from('blocos').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(record) {
    const { data, error } = await supabase.from('blocos').insert(record).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('blocos').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('blocos').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
