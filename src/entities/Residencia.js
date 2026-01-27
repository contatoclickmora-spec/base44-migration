import { supabase } from '@/integrations/supabase/client';

// Maps to unidades table in Supabase
export const Residencia = {
  async list() {
    const { data, error } = await supabase.from('unidades').select('*, blocos:bloco_id(id, nome, condominio_id)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({ ...r, condominio_id: r.blocos?.condominio_id }));
  },
  async filter(filters = {}) {
    const condId = filters.condominio_id; delete filters.condominio_id;
    let query = supabase.from('unidades').select('*, blocos:bloco_id(id, nome, condominio_id)');
    Object.entries(filters).forEach(([k, v]) => { if (v != null) query = query.eq(k, v); });
    const { data, error } = await query;
    if (error) throw error;
    let results = (data || []).map(r => ({ ...r, condominio_id: r.blocos?.condominio_id }));
    if (condId) results = results.filter(r => r.condominio_id === condId);
    return results;
  },
  async get(id) {
    const { data, error } = await supabase.from('unidades').select('*, blocos:bloco_id(id, nome, condominio_id)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? { ...data, condominio_id: data.blocos?.condominio_id } : null;
  },
  async create(record) {
    const { data, error } = await supabase.from('unidades').insert(record).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('unidades').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('unidades').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
