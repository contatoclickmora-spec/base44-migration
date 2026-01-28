-- Atualizar política de visualização de roles para incluir portaria
DROP POLICY IF EXISTS "Admins can view condominio roles" ON user_roles;

CREATE POLICY "Staff can view condominio roles"
ON user_roles FOR SELECT
USING (
  is_master(auth.uid()) 
  OR has_role(auth.uid(), condominio_id, 'admin')
  OR has_role(auth.uid(), condominio_id, 'portaria')
);

-- Também atualizar a função can_view_profile para incluir portaria vendo outros profiles do condomínio
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
      -- viewer é admin/portaria e profile_user tem role no mesmo condomínio
      SELECT 1
      FROM user_roles vr
      JOIN user_roles pr ON pr.user_id = _profile_user_id AND pr.condominio_id = vr.condominio_id
      WHERE vr.user_id = _viewer_id
        AND vr.role IN ('admin', 'portaria')
    )
    OR EXISTS (
      -- viewer é admin/portaria e profile_user é morador do mesmo condomínio (via moradores table)
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