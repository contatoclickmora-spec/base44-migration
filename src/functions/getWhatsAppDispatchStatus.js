import { supabase } from '@/integrations/supabase/client';

/**
 * Wrapper para chamar a edge function getWhatsAppDispatchStatus
 * @param {Array} log_ids - IDs dos logs para verificar status
 */
export async function getWhatsAppDispatchStatus(log_ids) {
  try {
    const { data, error } = await supabase.functions.invoke('getWhatsAppDispatchStatus', {
      body: { log_ids }
    });

    if (error) {
      console.error('Erro ao obter status WhatsApp:', error);
      throw new Error(error.message || 'Erro ao obter status');
    }

    return { data };
  } catch (err) {
    console.error('Erro ao obter status WhatsApp:', err);
    throw err;
  }
}
