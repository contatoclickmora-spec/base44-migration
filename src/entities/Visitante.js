import { supabase } from '@/integrations/supabase/client';

/**
 * Visitante entity - maps to visitantes table
 */
export const Visitante = {
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    const { data, error } = await supabase
      .from('visitantes')
      .select(`
        *,
        unidades:unidade_id (
          id,
          numero,
          blocos:bloco_id (
            id,
            nome,
            condominio_id
          )
        )
      `)
      .order(field, { ascending });
    
    if (error) throw error;
    return (data || []).map(transformVisitante);
  },

  async filter(filters = {}, sort = '-created_at', limit = null) {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    let query = supabase
      .from('visitantes')
      .select(`
        *,
        unidades:unidade_id (
          id,
          numero,
          blocos:bloco_id (
            id,
            nome,
            condominio_id
          )
        )
      `);
    
    // Apply direct filters
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
    return (data || []).map(transformVisitante);
  },

  async get(id) {
    const { data, error } = await supabase
      .from('visitantes')
      .select(`
        *,
        unidades:unidade_id (
          id,
          numero,
          blocos:bloco_id (
            id,
            nome,
            condominio_id
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformVisitante(data) : null;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('visitantes')
      .insert({
        nome: record.nome || record.nome_visitante,
        documento: record.documento || record.documento_visitante,
        observacao: record.observacao || record.observacoes,
        foto_url: record.foto_url,
        unidade_id: record.unidade_id,
        condominio_id: record.condominio_id,
        porteiro_id: record.porteiro_id,
        data_entrada: record.data_entrada || record.data_inicio,
        data_saida: record.data_saida
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformVisitante(data);
  },

  async update(id, updates) {
    const mappedUpdates = {};
    
    if (updates.data_entrada) mappedUpdates.data_entrada = updates.data_entrada;
    if (updates.data_entrada_real) mappedUpdates.data_entrada = updates.data_entrada_real;
    if (updates.data_saida) mappedUpdates.data_saida = updates.data_saida;
    if (updates.observacao) mappedUpdates.observacao = updates.observacao;
    if (updates.status === 'cancelado') mappedUpdates.observacao = 'Cancelado - Não compareceu';
    
    const { data, error } = await supabase
      .from('visitantes')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('visitantes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

function transformVisitante(raw) {
  if (!raw) return null;
  
  const unidade = raw.unidades || {};
  const bloco = unidade?.blocos || {};
  
  // Determine status based on data
  let status = 'agendado';
  if (raw.observacao?.includes('Cancelado')) {
    status = 'cancelado';
  } else if (raw.data_saida) {
    status = 'saiu';
  } else if (raw.data_entrada) {
    status = 'entrou';
  }
  
  return {
    ...raw,
    // Legacy field mappings
    nome_visitante: raw.nome,
    documento_visitante: raw.documento,
    observacoes: raw.observacao,
    data_inicio: raw.data_entrada || raw.created_at,
    morador_id: raw.porteiro_id, // Legacy compatibility
    status: status,
    recorrencia: null,
    dias_semana: [],
    tipo_visitante: 'visitante',
    
    // Unidade/Bloco data
    numero_unidade: unidade.numero || '',
    bloco_nome: bloco.nome || '',
    bloco_condominio_id: bloco.condominio_id || raw.condominio_id
  };
}
