-- Corrigir problema de recursividade infinita nas Políticas (RLS)

-- 1. Apagar as políticas que causam loop infinito
DROP POLICY IF EXISTS "Admins podem ver todos os perfis e os utilizadores podem ver o seu próprio" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem actualizar todos e os utilizadores o seu próprio" ON public.profiles;

-- 2. Criar uma função segura (Security Definer) para verificar o cargo ignorando as regras de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar as políticas utilizando a função segura
CREATE POLICY "Permitir leitura de perfis" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Permitir actualização de perfis" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

-- Actualizar também a de inserção de templates para evitar o mesmo erro
DROP POLICY IF EXISTS "Admins podem inserir templates" ON public.system_templates;
DROP POLICY IF EXISTS "Admins podem actualizar templates" ON public.system_templates;
DROP POLICY IF EXISTS "Admins podem apagar templates" ON public.system_templates;

CREATE POLICY "Admins podem inserir templates" 
ON public.system_templates FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem actualizar templates" 
ON public.system_templates FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins podem apagar templates" 
ON public.system_templates FOR DELETE 
USING (public.is_admin());
