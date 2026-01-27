import { supabase } from '@/integrations/supabase/client';

// Cache for profiles to avoid repeated fetches
let profilesCache = null;
let profilesCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Morador entity with optimized queries
 */
export const Morador = {
  /**
   * List all moradores with full data - OPTIMIZED
   */
  async list(sort = '-created_at') {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '');
    
    // Single optimized query with nested joins
    const { data: moradoresData, error: moradoresError } = await supabase
      .from('moradores')
      .select(`
        id, user_id, unidade_id, status, is_proprietario, 
        data_entrada, data_saida, created_at, updated_at,
        unidades:unidade_id (
          id, numero, tipo,
          blocos:bloco_id (id, nome, condominio_id)
        )
      `)
      .order(field, { ascending });
    
    if (moradoresError) throw moradoresError;
    if (!moradoresData || moradoresData.length === 0) return [];

    // Get profiles with cache
    const profiles = await this._getProfilesMap(moradoresData.map(m => m.user_id).filter(Boolean));

    return moradoresData.map(m => transformMorador(m, profiles[m.user_id]));
  },

  /**
   * Get profiles map with caching
   */
  async _getProfilesMap(userIds) {
    if (!userIds || userIds.length === 0) return {};
    
    const uniqueIds = [...new Set(userIds)];
    const now = Date.now();
    
    // Use cache if valid
    if (profilesCache && (now - profilesCacheTime) < CACHE_TTL) {
      const cached = {};
      const missing = [];
      
      uniqueIds.forEach(id => {
        if (profilesCache[id]) {
          cached[id] = profilesCache[id];
        } else {
          missing.push(id);
        }
      });
      
      if (missing.length === 0) return cached;
      
      // Fetch only missing
      const { data } = await supabase
        .from('profiles')
        .select('user_id, nome, telefone, cpf, avatar_url')
        .in('user_id', missing);
      
      (data || []).forEach(p => {
        cached[p.user_id] = p;
        profilesCache[p.user_id] = p;
      });
      
      return cached;
    }
    
    // Fresh fetch
    const { data } = await supabase
      .from('profiles')
      .select('user_id, nome, telefone, cpf, avatar_url')
      .in('user_id', uniqueIds);
    
    const map = {};
    profilesCache = {};
    profilesCacheTime = now;
    
    (data || []).forEach(p => {
      map[p.user_id] = p;
      profilesCache[p.user_id] = p;
    });
    
    return map;
  },

  /**
   * Clear profiles cache (call after updates)
   */
  clearCache() {
    profilesCache = null;
    profilesCacheTime = 0;
  },

  /**
   * Filter moradores - OPTIMIZED
   */
  async filter(filters = {}, sort = '-created_at', limit = null) {
    const ascending = !sort.startsWith('-');
    const field = sort.replace(/^-/, '');
    
    let query = supabase
      .from('moradores')
      .select(`
        id, user_id, unidade_id, status, is_proprietario,
        data_entrada, data_saida, created_at, updated_at,
        unidades:unidade_id (
          id, numero, tipo,
          blocos:bloco_id (id, nome, condominio_id)
        )
      `);

    // Apply direct filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'condominio_id') {
        query = Array.isArray(value) ? query.in(key, value) : query.eq(key, value);
      }
    });
    
    query = query.order(field, { ascending });
    if (limit) query = query.limit(limit);
    
    const { data: moradoresData, error } = await query;
    if (error) throw error;
    if (!moradoresData || moradoresData.length === 0) return [];

    const profiles = await this._getProfilesMap(moradoresData.map(m => m.user_id).filter(Boolean));
    let results = moradoresData.map(m => transformMorador(m, profiles[m.user_id]));
    
    // Filter by condominio_id post-query if specified
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
        id, user_id, unidade_id, status, is_proprietario,
        data_entrada, data_saida, created_at, updated_at,
        unidades:unidade_id (
          id, numero, tipo,
          blocos:bloco_id (id, nome, condominio_id)
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!moradorData) return null;

    const profiles = await this._getProfilesMap([moradorData.user_id].filter(Boolean));
    return transformMorador(moradorData, profiles[moradorData.user_id]);
  },

  /**
   * Get morador by user_id
   */
  async getByUserId(userId) {
    const { data: moradorData, error } = await supabase
      .from('moradores')
      .select(`
        id, user_id, unidade_id, status, is_proprietario,
        data_entrada, data_saida, created_at, updated_at,
        unidades:unidade_id (
          id, numero, tipo,
          blocos:bloco_id (id, nome, condominio_id)
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    if (!moradorData) return null;

    const profiles = await this._getProfilesMap([userId]);
    return transformMorador(moradorData, profiles[userId]);
  },

  async create(record) {
    this.clearCache();
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

  async update(id, updates) {
    this.clearCache();
    const validFields = ['unidade_id', 'status', 'is_proprietario', 'data_entrada', 'data_saida'];
    const filteredUpdates = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (validFields.includes(key)) filteredUpdates[key] = value;
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

  async delete(id) {
    this.clearCache();
    const { error } = await supabase
      .from('moradores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Transform raw morador data
 */
function transformMorador(raw, profile = null) {
  if (!raw) return null;
  
  const unidade = raw.unidades || {};
  const bloco = unidade?.blocos || {};
  
  return {
    id: raw.id,
    user_id: raw.user_id,
    unidade_id: raw.unidade_id,
    status: raw.status,
    is_proprietario: raw.is_proprietario,
    data_entrada: raw.data_entrada,
    data_saida: raw.data_saida,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    
    // Profile fields
    nome: profile?.nome || 'Sem nome',
    telefone: profile?.telefone || '',
    cpf: profile?.cpf || '',
    avatar_url: profile?.avatar_url || '',
    email: profile?.email || '',
    
    // Location fields
    numero_unidade: unidade.numero || '',
    tipo_unidade: unidade.tipo || 'apartamento',
    bloco_id: bloco.id || null,
    bloco_nome: bloco.nome || '',
    condominio_id: bloco.condominio_id || null,
    
    // Computed
    apelido_endereco: `${bloco.nome || ''} - ${unidade.numero || ''}`.trim(),
    abreviacao: `${bloco.nome || ''} ${unidade.numero || ''}`.trim(),
    tipo_usuario: 'morador'
  };
}
