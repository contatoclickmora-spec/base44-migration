import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    console.log('[WHATSAPP] Processando notificação de encomenda:', payload)

    if (!payload || !payload.encomenda_id) {
      return new Response(JSON.stringify({ error: 'Payload inválido' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { encomenda_id } = payload

    // Buscar encomenda
    const { data: encomenda, error: encomendaError } = await supabase
      .from('encomendas')
      .select('*, unidades!inner(*, blocos!inner(*, condominios!inner(*)))')
      .eq('id', encomenda_id)
      .single()

    if (encomendaError || !encomenda) {
      throw new Error(`Encomenda ${encomenda_id} não encontrada`)
    }

    // Verificar se já foi notificado
    if (encomenda.status === 'notificada' || encomenda.status === 'retirada') {
      return new Response(JSON.stringify({ 
        message: 'Encomenda já notificada',
        skipped: true 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Buscar morador
    const { data: morador, error: moradorError } = await supabase
      .from('moradores')
      .select('*, profiles!inner(*)')
      .eq('unidade_id', encomenda.unidade_id)
      .eq('status', 'aprovado')
      .limit(1)
      .single()

    if (moradorError || !morador) {
      console.warn('[WHATSAPP] Morador não encontrado para unidade:', encomenda.unidade_id)
      return new Response(JSON.stringify({ 
        message: 'Morador não encontrado',
        skipped: true 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const telefone = morador.profiles?.telefone
    if (!telefone) {
      console.warn('[WHATSAPP] Morador sem telefone cadastrado')
      return new Response(JSON.stringify({ 
        message: 'Morador sem telefone',
        skipped: true 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Preparar dados da unidade
    const unidade = encomenda.unidades
    const bloco = unidade?.blocos
    const condominio = bloco?.condominios

    const enderecoCompleto = `${bloco?.nome || ''} - ${unidade?.numero || ''}`

    // Preparar payload para serviço de WhatsApp
    const notificacaoPayload = {
      condominio_id: encomenda.condominio_id,
      morador_nome: morador.profiles?.nome || 'Morador',
      morador_telefone: telefone,
      apartamento_bloco: enderecoCompleto,
      tipo_encomenda: encomenda.remetente || 'Encomenda',
      codigo_retirada: encomenda.codigo_rastreio || encomenda.id.substring(0, 8),
      data_chegada: encomenda.data_recebimento,
      observacoes: encomenda.observacao || ''
    }

    console.log('[WHATSAPP] Dados da notificação:', notificacaoPayload)

    // Atualizar status da encomenda
    const { error: updateError } = await supabase
      .from('encomendas')
      .update({ 
        status: 'notificada',
        data_notificacao: new Date().toISOString()
      })
      .eq('id', encomenda_id)

    if (updateError) {
      console.error('[WHATSAPP] Erro ao atualizar encomenda:', updateError)
    }

    // TODO: Integrar com Z-API ou outro serviço de WhatsApp
    // Por enquanto, apenas simula o envio
    console.log('[WHATSAPP] ✅ Notificação preparada para envio:', notificacaoPayload)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Notificação preparada com sucesso',
      encomenda_id: encomenda.id,
      morador_nome: morador.profiles?.nome
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    const error = err as Error
    console.error('[WHATSAPP] ❌ Erro:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
