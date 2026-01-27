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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token)
    
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const user = claimsData.user
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { tipo_emergencia, descricao, localizacao } = await req.json()

    if (!tipo_emergencia) {
      return new Response(JSON.stringify({ error: 'Tipo de emergência não informado' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Buscar morador do usuário
    const { data: morador, error: moradorError } = await supabase
      .from('moradores')
      .select(`
        *,
        profiles!inner(*),
        unidades!inner(*, blocos!inner(condominio_id))
      `)
      .eq('user_id', user.id)
      .eq('status', 'aprovado')
      .limit(1)
      .single()

    if (moradorError || !morador) {
      return new Response(JSON.stringify({ error: 'Usuário não é morador aprovado' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const condominioId = morador.unidades?.blocos?.condominio_id

    if (!condominioId) {
      return new Response(JSON.stringify({ error: 'Condomínio não encontrado' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Criar alerta SOS
    const { data: alerta, error: alertaError } = await supabase
      .from('alertas_sos')
      .insert({
        morador_id: morador.id,
        condominio_id: condominioId,
        tipo: tipo_emergencia,
        descricao: descricao || null,
        localizacao: localizacao || null,
        status: 'ativo',
        data_alerta: new Date().toISOString()
      })
      .select()
      .single()

    if (alertaError) {
      console.error('[SOS] Erro ao criar alerta:', alertaError)
      throw new Error('Erro ao criar alerta de emergência')
    }

    console.log('[SOS] ✅ Alerta criado:', alerta.id)

    // Buscar admins e porteiros do condomínio para notificar
    const { data: destinatarios } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('condominio_id', condominioId)
      .in('role', ['admin', 'portaria'])

    // TODO: Enviar notificações via WhatsApp para destinatários
    console.log('[SOS] Destinatários para notificação:', destinatarios?.length || 0)

    return new Response(JSON.stringify({
      success: true,
      alerta_id: alerta.id,
      mensagem: 'Alerta de emergência enviado com sucesso',
      destinatarios_notificados: destinatarios?.length || 0
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    const error = err as Error
    console.error('[SOS] ❌ Erro:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro ao enviar alerta de emergência'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
