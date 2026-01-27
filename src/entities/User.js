import { createEntity } from './base';
import { supabase } from '@/integrations/supabase/client';

const baseEntity = createEntity('profiles');

// Maps to profiles table in Supabase with auth methods
export const User = {
  ...baseEntity,
  
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.nome || user.email,
      ...profile
    };
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
};
