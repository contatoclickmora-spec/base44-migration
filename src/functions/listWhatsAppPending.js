import { supabase } from '@/integrations/supabase/client';

/**
 * Wrapper para chamar a edge function listWhatsAppPending
 */
export async function listWhatsAppPending() {
  try {
    const { data, error } = await supabase.functions.invoke('listWhatsAppPending');

    if (error) {
      console.error('Erro ao listar pendências WhatsApp:', error);
      throw new Error(error.message || 'Erro ao listar pendências');
    }

    return { data };
  } catch (err) {
    console.error('Erro ao listar pendências WhatsApp:', err);
    throw err;
  }
}
