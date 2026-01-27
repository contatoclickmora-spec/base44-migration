-- ============================================
-- SCHEMAS SQL INFERIDOS DO CÓDIGO BASE44
-- Gerado automaticamente durante migração
-- ============================================

-- NOTA: Algumas tabelas já existem no banco.
-- Execute apenas os CREATE que faltam.

-- ============================================
-- TIPOS ENUM
-- ============================================

-- Já existentes: app_role, package_status, resident_status, unit_type

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- condominios (JÁ EXISTE)
-- blocos (JÁ EXISTE)
-- unidades (JÁ EXISTE)
-- profiles (JÁ EXISTE)
-- moradores (JÁ EXISTE)
-- encomendas (JÁ EXISTE)
-- visitantes (JÁ EXISTE)
-- alertas_sos (JÁ EXISTE)
-- avisos (JÁ EXISTE)
-- enquetes (JÁ EXISTE)
-- enquete_opcoes (JÁ EXISTE)
-- enquete_votos (JÁ EXISTE)
-- user_roles (JÁ EXISTE)

-- ============================================
-- TABELAS ADICIONAIS (CRIAR SE NECESSÁRIO)
-- ============================================

-- Tabela de Chamados (tickets de suporte)
CREATE TABLE IF NOT EXISTS public.chamados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  morador_id UUID REFERENCES public.moradores(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'geral',
  prioridade TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'aberto',
  atendente_id UUID,
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  user_id UUID,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  documento TEXT,
  data_admissao DATE,
  data_demissao DATE,
  status TEXT DEFAULT 'ativo',
  turno TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Anúncios (Marketplace)
CREATE TABLE IF NOT EXISTS public.anuncios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2),
  categoria TEXT,
  fotos TEXT[],
  status TEXT DEFAULT 'ativo',
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS public.logs_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE SET NULL,
  usuario_id UUID,
  usuario_email TEXT,
  usuario_nome TEXT,
  tipo_acao TEXT NOT NULL,
  descricao TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  sucesso BOOLEAN DEFAULT true,
  erro_mensagem TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Configuração WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  zapi_instance_id TEXT,
  zapi_client_token TEXT,
  zapi_base_url TEXT DEFAULT 'https://api.z-api.io',
  zapi_send_text_endpoint TEXT DEFAULT '/token/{token}/send-text',
  ativo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(condominio_id)
);

-- Tabela de Mensagens WhatsApp
CREATE TABLE IF NOT EXISTS public.mensagens_whatsapp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  destinatario_id UUID,
  destinatario_nome TEXT,
  destinatario_telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo_mensagem TEXT DEFAULT 'notificacao',
  status_envio TEXT DEFAULT 'pendente',
  data_envio TIMESTAMP WITH TIME ZONE,
  enviado_por TEXT,
  erro_mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Permissões de Usuário (perfis customizados)
CREATE TABLE IF NOT EXISTS public.permissoes_perfil (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL,
  permissoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(condominio_id, perfil)
);

-- Tabela de Residências (dados adicionais de unidade)
CREATE TABLE IF NOT EXISTS public.residencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  apelido TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(unidade_id)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chamados_condominio ON public.chamados(condominio_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON public.chamados(status);
CREATE INDEX IF NOT EXISTS idx_funcionarios_condominio ON public.funcionarios(condominio_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_condominio ON public.anuncios(condominio_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_condominio ON public.logs_sistema(condominio_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_timestamp ON public.logs_sistema(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_whatsapp_condominio ON public.mensagens_whatsapp(condominio_id);
