import { supabase } from '@/integrations/supabase/client';

/**
 * Encomenda entity - maps to encomendas table
 */
export const Encomenda = {
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
    
    const { data: encomendasData, error } = await supabase
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
        )
      `)
      .order(field, { ascending });
    
    if (error) throw error;
    if (!encomendasData || encomendasData.length === 0) return [];

    // Get morador data separately if needed
    const moradorIds = [...new Set(encomendasData.map(e => e.morador_id).filter(Boolean))];
    let moradoresMap = {};
    
    if (moradorIds.length > 0) {
      const { data: moradoresData } = await supabase
        .from('moradores')
        .select('id, user_id')
        .in('id', moradorIds);
      
      if (moradoresData) {
        const userIds = moradoresData.map(m => m.user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, nome, telefone')
          .in('user_id', userIds);
        
        const profilesMap = {};
        (profilesData || []).forEach(p => { profilesMap[p.user_id] = p; });
        
        moradoresData.forEach(m => {
          moradoresMap[m.id] = {
            id: m.id,
            user_id: m.user_id,
            profile: profilesMap[m.user_id] || {}
          };
        });
      }
    }

    return encomendasData.map(e => transformEncomenda(e, moradoresMap[e.morador_id]));
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
    
    const { data: encomendasData, error } = await query;
    if (error) throw error;
    if (!encomendasData || encomendasData.length === 0) return [];

    // Get morador data separately
    const moradorIds = [...new Set(encomendasData.map(e => e.morador_id).filter(Boolean))];
    let moradoresMap = {};
    
    if (moradorIds.length > 0) {
      const { data: moradoresData } = await supabase
        .from('moradores')
        .select('id, user_id')
        .in('id', moradorIds);
      
      if (moradoresData) {
        const userIds = moradoresData.map(m => m.user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, nome, telefone')
          .in('user_id', userIds);
        
        const profilesMap = {};
        (profilesData || []).forEach(p => { profilesMap[p.user_id] = p; });
        
        moradoresData.forEach(m => {
          moradoresMap[m.id] = {
            id: m.id,
            user_id: m.user_id,
            profile: profilesMap[m.user_id] || {}
          };
        });
      }
    }

    return encomendasData.map(e => transformEncomenda(e, moradoresMap[e.morador_id]));
  },

  async get(id) {
    const { data: encomendaData, error } = await supabase
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
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!encomendaData) return null;

    // Get morador data if exists
    let moradorData = null;
    if (encomendaData.morador_id) {
      const { data: morador } = await supabase
        .from('moradores')
        .select('id, user_id')
        .eq('id', encomendaData.morador_id)
        .maybeSingle();
      
      if (morador?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, nome, telefone')
          .eq('user_id', morador.user_id)
          .maybeSingle();
        
        moradorData = { id: morador.id, user_id: morador.user_id, profile: profile || {} };
      }
    }

    return transformEncomenda(encomendaData, moradorData);
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

/**
 * Transform encomenda data
 * @param {Object} raw - Raw encomenda from database
 * @param {Object} moradorData - Morador with profile data
 */
function transformEncomenda(raw, moradorData = null) {
  if (!raw) return null;
  
  const unidade = raw.unidades || {};
  const bloco = unidade?.blocos || {};
  const profile = moradorData?.profile || {};
  
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
    bloco_nome: bloco.nome || '',
    condominio_id: bloco.condominio_id || raw.condominio_id
  };
}
