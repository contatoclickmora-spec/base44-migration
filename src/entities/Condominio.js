import { supabase } from '@/integrations/supabase/client';

/**
 * Condominio entity - maps to condominios table
 */
export const Condominio = {
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order(field, { ascending });
    
    if (error) throw error;
    return (data || []).map(transformCondominio);
  },

  async filter(filters = {}, sort = '-created_at', limit = null) {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    let query = supabase.from('condominios').select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    query = query.order(field, { ascending });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(transformCondominio);
  },

  async get(id) {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformCondominio(data) : null;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('condominios')
      .insert({
        nome: record.nome,
        endereco: record.endereco,
        cidade: record.cidade,
        estado: record.estado,
        cep: record.cep,
        telefone: record.telefone,
        email: record.email,
        logo_url: record.logo_url,
        ativo: record.ativo !== false
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformCondominio(data);
  },

  async update(id, updates) {
    // Filter only valid condominio fields
    const validFields = ['nome', 'endereco', 'cidade', 'estado', 'cep', 'telefone', 'email', 'logo_url', 'ativo'];
    const filteredUpdates = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (validFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    });
    
    const { data, error } = await supabase
      .from('condominios')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformCondominio(data);
  },

  async delete(id) {
    const { error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

function transformCondominio(raw) {
  if (!raw) return null;
  
  return {
    ...raw,
    // Legacy field mappings for compatibility
    status: raw.ativo ? 'ativo' : 'inativo',
    moradores_ativos: 0, // Would need to be computed
    total_usuarios: 0, // Would need to be computed
    limite_moradores: 100, // Default
    plano: '100_moradores', // Default
    valor_mensalidade: 0, // Not in schema
    permissoes_perfis: {} // Not in schema
  };
}
