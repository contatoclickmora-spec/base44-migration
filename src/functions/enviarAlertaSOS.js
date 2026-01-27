import { supabase } from '@/integrations/supabase/client';

/**
 * Wrapper para chamar a edge function enviarAlertaSOS
 * @param {string} tipo_emergencia - Tipo da emergência (medica, incendio, seguranca, invasao)
 */
export async function enviarAlertaSOS(tipo_emergencia) {
  try {
    const { data, error } = await supabase.functions.invoke('enviarAlertaSOS', {
      body: { tipo_emergencia }
    });

    if (error) {
      console.error('Erro ao enviar alerta SOS:', error);
      throw new Error(error.message || 'Erro ao enviar alerta de emergência');
    }

    return data;
  } catch (err) {
    console.error('Erro ao enviar alerta SOS:', err);
    throw err;
  }
}
