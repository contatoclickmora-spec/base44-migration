import { supabase } from '@/integrations/supabase/client';

/**
 * Encomenda entity - maps to encomendas table
 */
export const Encomenda = {
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    const { data, error } = await supabase
      .from('encomendas')
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
        ),
        moradores:morador_id (
          id,
          user_id,
          profiles:user_id (
            nome,
            telefone
          )
        )
      `)
      .order(field, { ascending });
    
    if (error) throw error;
    return (data || []).map(transformEncomenda);
  },

  async filter(filters = {}, sort = '-created_at', limit = null) {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    let query = supabase
      .from('encomendas')
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
        ),
        moradores:morador_id (
          id,
          user_id,
          profiles:user_id (
            nome,
            telefone
          )
        )
      `);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const mappedKey = key === 'created_date' ? 'created_at' : key;
        if (Array.isArray(value)) {
          query = query.in(mappedKey, value);
        } else {
          query = query.eq(mappedKey, value);
        }
      }
    });
    
    query = query.order(field, { ascending });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(transformEncomenda);
  },

  async get(id) {
    const { data, error } = await supabase
      .from('encomendas')
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
        ),
        moradores:morador_id (
          id,
          user_id,
          profiles:user_id (
            nome,
            telefone
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformEncomenda(data) : null;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('encomendas')
      .insert({
        remetente: record.remetente,
        tipo: record.tipo,
        codigo_rastreio: record.codigo_rastreio || record.codigo,
        foto_url: record.foto_url || record.foto_encomenda,
        observacao: record.observacao,
        condominio_id: record.condominio_id,
        unidade_id: record.unidade_id,
        morador_id: record.morador_id,
        porteiro_recebimento_id: record.porteiro_recebimento_id,
        status: record.status || 'recebida',
        data_recebimento: record.data_recebimento || record.data_entrada || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformEncomenda(data);
  },

  async update(id, updates) {
    const mappedUpdates = {};
    
    // Map legacy field names
    if (updates.status) mappedUpdates.status = updates.status;
    if (updates.data_retirada) mappedUpdates.data_retirada = updates.data_retirada;
    if (updates.data_notificacao) mappedUpdates.data_notificacao = updates.data_notificacao;
    if (updates.porteiro_entrega_id) mappedUpdates.porteiro_entrega_id = updates.porteiro_entrega_id;
    if (updates.observacao) mappedUpdates.observacao = updates.observacao;
    
    const { data, error } = await supabase
      .from('encomendas')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('encomendas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

function transformEncomenda(raw) {
  if (!raw) return null;
  
  const unidade = raw.unidades || {};
  const bloco = unidade?.blocos || {};
  const morador = raw.moradores || {};
  const profile = morador?.profiles || {};
  
  return {
    ...raw,
    // Legacy field mappings
    codigo: raw.codigo_rastreio,
    foto_encomenda: raw.foto_url,
    data_entrada: raw.data_recebimento || raw.created_at,
    porteiro_entrada: raw.porteiro_recebimento_id,
    
    // Status mapping (aguardando -> recebida)
    status: raw.status === 'recebida' ? 'aguardando' : raw.status,
    
    // Morador info
    morador_nome: profile.nome || 'Sem nome',
    morador_telefone: profile.telefone || '',
    
    // Unidade/Bloco
    numero_unidade: unidade.numero || '',
    bloco_nome: bloco.nome || ''
  };
}
