import { supabase } from '@/integrations/supabase/client';

/**
 * Wrapper para chamar a edge function startWhatsAppDispatch
 * @param {Array} resident_ids - IDs dos moradores para enviar mensagens
 */
export async function startWhatsAppDispatch(resident_ids) {
  try {
    const { data, error } = await supabase.functions.invoke('startWhatsAppDispatch', {
      body: { resident_ids }
    });

    if (error) {
      console.error('Erro ao iniciar disparo WhatsApp:', error);
      throw new Error(error.message || 'Erro ao iniciar disparo');
    }

    return { data };
  } catch (err) {
    console.error('Erro ao iniciar disparo WhatsApp:', err);
    throw err;
  }
}
