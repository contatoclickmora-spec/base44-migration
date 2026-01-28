-- Primeiro, remover a política problemática que causa recursão
DROP POLICY IF EXISTS "Users can view roles in their condominio" ON public.user_roles;

-- Criar uma política simples que não cause recursão
-- Usuários podem ver suas próprias roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Manter políticas para admins usando as funções security definer existentes
-- A função is_master já existe e é security definer
-- A função has_role já existe e é security definer

-- Adicionar política para masters verem todas as roles (já existe, só verificar)
-- A política "Masters can manage all roles" já permite isso

-- Adicionar política para admins verem roles do seu condomínio usando função existente
DROP POLICY IF EXISTS "Admins can view roles in their condominio" ON public.user_roles;
CREATE POLICY "Admins can view condominio roles" 
ON public.user_roles 
FOR SELECT 
USING (
  is_master(auth.uid()) 
  OR has_role(auth.uid(), condominio_id, 'admin'::app_role)
);

-- Também corrigir a política de profiles que pode ter o mesmo problema
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Criar política simples para profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para admins/portaria verem perfis de moradores do condomínio
-- usando função security definer
CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _viewer_id = _profile_user_id  -- próprio perfil
    OR is_master(_viewer_id)       -- master vê todos
    OR EXISTS (
      -- viewer é admin/portaria e profile_user é morador do mesmo condomínio
      SELECT 1
      FROM user_roles vr
      JOIN moradores m ON m.user_id = _profile_user_id
      JOIN unidades u ON u.id = m.unidade_id
      JOIN blocos b ON b.id = u.bloco_id
      WHERE vr.user_id = _viewer_id
        AND vr.role IN ('admin', 'portaria')
        AND vr.condominio_id = b.condominio_id
    )
$$;

CREATE POLICY "Staff can view resident profiles" 
ON public.profiles 
FOR SELECT 
USING (can_view_profile(auth.uid(), user_id));