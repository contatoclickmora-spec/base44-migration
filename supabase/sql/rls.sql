-- ============================================
-- POLÍTICAS RLS PARA TABELAS ADICIONAIS
-- Gerado automaticamente durante migração
-- ============================================

-- ============================================
-- CHAMADOS
-- ============================================

ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chamados of their condominios"
ON public.chamados FOR SELECT
USING (
  has_any_role_in_condominio(auth.uid(), condominio_id)
  OR is_master(auth.uid())
);

CREATE POLICY "Portaria and admins can manage chamados"
ON public.chamados FOR ALL
USING (
  has_role(auth.uid(), condominio_id, 'portaria'::app_role)
  OR has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

CREATE POLICY "Moradores can create chamados"
ON public.chamados FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM moradores m
    WHERE m.id = chamados.morador_id
    AND m.user_id = auth.uid()
  )
);

-- ============================================
-- FUNCIONÁRIOS
-- ============================================

ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage funcionarios"
ON public.funcionarios FOR ALL
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

CREATE POLICY "Portaria can view funcionarios"
ON public.funcionarios FOR SELECT
USING (
  has_role(auth.uid(), condominio_id, 'portaria'::app_role)
);

-- ============================================
-- ANÚNCIOS
-- ============================================

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view anuncios of their condominios"
ON public.anuncios FOR SELECT
USING (
  has_any_role_in_condominio(auth.uid(), condominio_id)
  OR is_master(auth.uid())
);

CREATE POLICY "Users can create own anuncios"
ON public.anuncios FOR INSERT
WITH CHECK (
  has_any_role_in_condominio(auth.uid(), condominio_id)
  AND autor_id::text = auth.uid()::text
);

CREATE POLICY "Users can update own anuncios"
ON public.anuncios FOR UPDATE
USING (autor_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all anuncios"
ON public.anuncios FOR ALL
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

-- ============================================
-- LOGS DO SISTEMA
-- ============================================

ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs"
ON public.logs_sistema FOR SELECT
USING (
  (condominio_id IS NULL AND is_master(auth.uid()))
  OR has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

CREATE POLICY "System can insert logs"
ON public.logs_sistema FOR INSERT
WITH CHECK (true);

-- ============================================
-- CONFIGURAÇÃO WHATSAPP
-- ============================================

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp config"
ON public.whatsapp_config FOR ALL
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

-- ============================================
-- MENSAGENS WHATSAPP
-- ============================================

ALTER TABLE public.mensagens_whatsapp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view mensagens whatsapp"
ON public.mensagens_whatsapp FOR SELECT
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR has_role(auth.uid(), condominio_id, 'portaria'::app_role)
  OR is_master(auth.uid())
);

CREATE POLICY "System can insert mensagens"
ON public.mensagens_whatsapp FOR INSERT
WITH CHECK (true);

-- ============================================
-- PERMISSÕES PERFIL
-- ============================================

ALTER TABLE public.permissoes_perfil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissoes"
ON public.permissoes_perfil FOR ALL
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role)
  OR is_master(auth.uid())
);

CREATE POLICY "Users can view permissoes"
ON public.permissoes_perfil FOR SELECT
USING (
  has_any_role_in_condominio(auth.uid(), condominio_id)
);

-- ============================================
-- RESIDÊNCIAS
-- ============================================

ALTER TABLE public.residencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view residencias of their condominios"
ON public.residencias FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM unidades u
    JOIN blocos b ON b.id = u.bloco_id
    WHERE u.id = residencias.unidade_id
    AND (
      has_any_role_in_condominio(auth.uid(), b.condominio_id)
      OR is_master(auth.uid())
    )
  )
);

CREATE POLICY "Admins can manage residencias"
ON public.residencias FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM unidades u
    JOIN blocos b ON b.id = u.bloco_id
    WHERE u.id = residencias.unidade_id
    AND (
      has_role(auth.uid(), b.condominio_id, 'admin'::app_role)
      OR is_master(auth.uid())
    )
  )
);
