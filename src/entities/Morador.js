import { supabase } from '@/integrations/supabase/client';

/**
 * Morador entity with proper joins to get all related data
 * Schema: moradores -> unidades -> blocos -> condominios
 * Profile data comes from: profiles (joined via user_id)
 */
export const Morador = {
  /**
   * List all moradores with full data (profile, unidade, bloco, condominio)
   */
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '');
    
    const { data, error } = await supabase
      .from('moradores')
      .select(`
        *,
        profiles:user_id (
          nome,
          telefone,
          cpf,
          avatar_url
        ),
        unidades:unidade_id (
          id,
          numero,
          tipo,
          blocos:bloco_id (
            id,
            nome,
            condominio_id,
            condominios:condominio_id (
              id,
              nome
            )
          )
        )
      `)
      .order(field, { ascending });
    
    if (error) throw error;
    return (data || []).map(transformMorador);
  },

  /**
   * Filter moradores by conditions
   */
  async filter(filters = {}, sort = '-created_at', limit = null) {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '');
    
    let query = supabase
      .from('moradores')
      .select(`
        *,
        profiles:user_id (
          nome,
          telefone,
          cpf,
          avatar_url
        ),
        unidades:unidade_id (
          id,
          numero,
          tipo,
          blocos:bloco_id (
            id,
            nome,
            condominio_id,
            condominios:condominio_id (
              id,
              nome
            )
          )
        )
      `);

    // Handle condominio_id filter specially (needs to filter via join)
    if (filters.condominio_id) {
      // We'll filter after fetching since it's a nested relation
    }
    
    // Apply direct filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'condominio_id') {
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
    
    let results = (data || []).map(transformMorador);
    
    // Filter by condominio_id if specified
    if (filters.condominio_id) {
      results = results.filter(m => m.condominio_id === filters.condominio_id);
    }
    
    return results;
  },

  /**
   * Get single morador by ID
   */
  async get(id) {
    const { data, error } = await supabase
      .from('moradores')
      .select(`
        *,
        profiles:user_id (
          nome,
          telefone,
          cpf,
          avatar_url
        ),
        unidades:unidade_id (
          id,
          numero,
          tipo,
          blocos:bloco_id (
            id,
            nome,
            condominio_id,
            condominios:condominio_id (
              id,
              nome
            )
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformMorador(data) : null;
  },

  /**
   * Get morador by user_id
   */
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('moradores')
      .select(`
        *,
        profiles:user_id (
          nome,
          telefone,
          cpf,
          avatar_url
        ),
        unidades:unidade_id (
          id,
          numero,
          tipo,
          blocos:bloco_id (
            id,
            nome,
            condominio_id,
            condominios:condominio_id (
              id,
              nome
            )
          )
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformMorador(data) : null;
  },

  /**
   * Create new morador
   */
  async create(record) {
    const { data, error } = await supabase
      .from('moradores')
      .insert({
        user_id: record.user_id,
        unidade_id: record.unidade_id,
        status: record.status || 'pendente',
        is_proprietario: record.is_proprietario || false,
        data_entrada: record.data_entrada,
        data_saida: record.data_saida
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update morador
   */
  async update(id, updates) {
    // Filter only valid morador fields
    const validFields = ['unidade_id', 'status', 'is_proprietario', 'data_entrada', 'data_saida'];
    const filteredUpdates = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (validFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    });
    
    const { data, error } = await supabase
      .from('moradores')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete morador
   */
  async delete(id) {
    const { error } = await supabase
      .from('moradores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Transform raw morador data to include flattened fields for compatibility
 */
function transformMorador(raw) {
  if (!raw) return null;
  
  const profile = raw.profiles || {};
  const unidade = raw.unidades || {};
  const bloco = unidade?.blocos || {};
  const condominio = bloco?.condominios || {};
  
  return {
    // Original morador fields
    id: raw.id,
    user_id: raw.user_id,
    unidade_id: raw.unidade_id,
    status: raw.status,
    is_proprietario: raw.is_proprietario,
    data_entrada: raw.data_entrada,
    data_saida: raw.data_saida,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    
    // Flattened profile fields (for compatibility)
    nome: profile.nome || 'Sem nome',
    telefone: profile.telefone || '',
    cpf: profile.cpf || '',
    avatar_url: profile.avatar_url || '',
    
    // Flattened unidade/bloco/condominio fields
    numero_unidade: unidade.numero || '',
    tipo_unidade: unidade.tipo || 'apartamento',
    bloco_id: bloco.id || null,
    bloco_nome: bloco.nome || '',
    condominio_id: bloco.condominio_id || null,
    condominio_nome: condominio.nome || '',
    
    // Computed fields for legacy compatibility
    apelido_endereco: `${bloco.nome || ''} - ${unidade.numero || ''}`.trim(),
    abreviacao: `${bloco.nome || ''} ${unidade.numero || ''}`.trim(),
    tipo_usuario: 'morador', // Default tipo
    
    // Keep raw nested data
    _raw: raw
  };
}
