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
    
    // First get moradores with unidades join
    const { data: moradoresData, error: moradoresError } = await supabase
      .from('moradores')
      .select(`
        *,
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
    
    if (moradoresError) throw moradoresError;
    if (!moradoresData || moradoresData.length === 0) return [];

    // Get user_ids to fetch profiles separately
    const userIds = [...new Set(moradoresData.map(m => m.user_id).filter(Boolean))];
    
    // Fetch profiles separately (no FK constraint needed)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, nome, telefone, cpf, avatar_url')
      .in('user_id', userIds);
    
    // Create profiles map
    const profilesMap = {};
    (profilesData || []).forEach(p => {
      profilesMap[p.user_id] = p;
    });

    // Merge profiles into moradores
    return moradoresData.map(m => transformMorador(m, profilesMap[m.user_id]));
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

    // Apply direct filters (skip condominio_id - handled after)
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
    
    const { data: moradoresData, error } = await query;
    if (error) throw error;
    if (!moradoresData || moradoresData.length === 0) return [];

    // Get profiles separately
    const userIds = [...new Set(moradoresData.map(m => m.user_id).filter(Boolean))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, nome, telefone, cpf, avatar_url')
      .in('user_id', userIds);
    
    const profilesMap = {};
    (profilesData || []).forEach(p => {
      profilesMap[p.user_id] = p;
    });

    let results = moradoresData.map(m => transformMorador(m, profilesMap[m.user_id]));
    
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
    const { data: moradorData, error } = await supabase
      .from('moradores')
      .select(`
        *,
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
    if (!moradorData) return null;

    // Get profile separately
    let profile = null;
    if (moradorData.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, nome, telefone, cpf, avatar_url')
        .eq('user_id', moradorData.user_id)
        .maybeSingle();
      profile = profileData;
    }

    return transformMorador(moradorData, profile);
  },

  /**
   * Get morador by user_id
   */
  async getByUserId(userId) {
    const { data: moradorData, error } = await supabase
      .from('moradores')
      .select(`
        *,
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
    if (!moradorData) return null;

    // Get profile separately
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id, nome, telefone, cpf, avatar_url')
      .eq('user_id', userId)
      .maybeSingle();

    return transformMorador(moradorData, profileData);
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
 * @param {Object} raw - Raw morador data from database
 * @param {Object} profile - Profile data fetched separately
 */
function transformMorador(raw, profile = null) {
  if (!raw) return null;
  
  const profileData = profile || {};
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
    nome: profileData.nome || 'Sem nome',
    telefone: profileData.telefone || '',
    cpf: profileData.cpf || '',
    avatar_url: profileData.avatar_url || '',
    email: profileData.email || '',
    
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
    _raw: raw,
    _profile: profileData
  };
}
