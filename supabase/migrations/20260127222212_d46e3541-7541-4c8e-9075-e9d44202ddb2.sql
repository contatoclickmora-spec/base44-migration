-- Permitir que admins gerenciem roles do seu próprio condomínio
-- (masters já podem gerenciar todos)

-- Drop existing policies on user_roles to recreate them
DROP POLICY IF EXISTS "Masters can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their condominio" ON public.user_roles;

-- Recreate with better policies
CREATE POLICY "Masters can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (is_master(auth.uid()));

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to manage roles in their condominio (except master role)
CREATE POLICY "Admins can manage roles in their condominio" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), condominio_id, 'admin'::app_role) 
  AND role != 'master'::app_role
)
WITH CHECK (
  has_role(auth.uid(), condominio_id, 'admin'::app_role) 
  AND role != 'master'::app_role
);

-- Also update moradores policy to allow admins to insert new moradores
-- First check current policies
DROP POLICY IF EXISTS "Admins can insert moradores" ON public.moradores;

CREATE POLICY "Admins can insert moradores" 
ON public.moradores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM unidades u
    JOIN blocos b ON b.id = u.bloco_id
    WHERE u.id = moradores.unidade_id
    AND (
      has_role(auth.uid(), b.condominio_id, 'admin'::app_role) 
      OR is_master(auth.uid())
    )
  )
);