-- Allow admins and portaria to view profiles of moradores in their condominio
-- First drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows:
-- 1. Users to view their own profile
-- 2. Admins/portaria to view profiles of moradores in their condominio
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR is_master(auth.uid())
  OR EXISTS (
    -- Check if viewer has admin/portaria role in a condominio where profile owner is a morador
    SELECT 1
    FROM public.user_roles viewer_roles
    JOIN public.moradores m ON m.user_id = profiles.user_id
    JOIN public.unidades u ON u.id = m.unidade_id
    JOIN public.blocos b ON b.id = u.bloco_id
    WHERE viewer_roles.user_id = auth.uid()
      AND viewer_roles.role IN ('admin', 'portaria')
      AND viewer_roles.condominio_id = b.condominio_id
  )
);

-- Also allow admins to view all roles in their condominio (for user management)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view roles in their condominio"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id
  OR is_master(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_roles viewer_roles
    WHERE viewer_roles.user_id = auth.uid()
      AND viewer_roles.role IN ('admin', 'master')
      AND viewer_roles.condominio_id = user_roles.condominio_id
  )
);