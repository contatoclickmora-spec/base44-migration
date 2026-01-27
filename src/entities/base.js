import { supabase } from '@/integrations/supabase/client';

/**
 * Maps Base44-style field names to Supabase field names
 */
const FIELD_MAP = {
  'created_date': 'created_at',
  'updated_date': 'updated_at',
  'approval_date': 'data_aprovacao'
};

/**
 * Convert Base44-style sort string to Supabase format
 * e.g., '-created_date' -> { field: 'created_at', ascending: false }
 */
function parseSort(sortStr) {
  if (!sortStr) return null;
  const ascending = !sortStr.startsWith('-');
  const field = sortStr.replace(/^-/, '');
  const mappedField = FIELD_MAP[field] || field;
  return { field: mappedField, ascending };
}

/**
 * Creates a Supabase entity wrapper with CRUD operations
 * Compatible with Base44 API patterns
 * @param {string} tableName - The Supabase table name
 * @returns Entity object with list, filter, get, create, update, delete methods
 */
export function createEntity(tableName) {
  return {
    async list(sort = '-created_at') {
      try {
        const sortInfo = parseSort(sort) || { field: 'created_at', ascending: false };
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order(sortInfo.field, { ascending: sortInfo.ascending });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn(`[Entity ${tableName}] list failed, trying without order:`, err.message);
        // Fallback: try without ordering if field doesn't exist
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
        if (error) throw error;
        return data || [];
      }
    },

    async filter(filters = {}, sort = '-created_at', limit = null) {
      try {
        let query = supabase.from(tableName).select('*');
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const mappedKey = FIELD_MAP[key] || key;
            if (Array.isArray(value)) {
              query = query.in(mappedKey, value);
            } else {
              query = query.eq(mappedKey, value);
            }
          }
        });
        
        // Apply sorting (support Base44 format)
        if (sort) {
          const sortInfo = parseSort(sort);
          if (sortInfo) {
            query = query.order(sortInfo.field, { ascending: sortInfo.ascending });
          }
        }
        
        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn(`[Entity ${tableName}] filter failed:`, err.message);
        // Fallback: try without ordering
        let query = supabase.from(tableName).select('*');
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const mappedKey = FIELD_MAP[key] || key;
            if (Array.isArray(value)) {
              query = query.in(mappedKey, value);
            } else {
              query = query.eq(mappedKey, value);
            }
          }
        });
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  };
}
