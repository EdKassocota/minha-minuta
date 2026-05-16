-- Configurações para o Sistema de Administradores

-- 1. Adicionar a coluna de role aos perfis
ALTER TABLE public.profiles 
ADD COLUMN role text default 'user';

-- Para que você consiga ser o primeiro admin, precisará rodar um UPDATE manual no SQL Editor:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'o_seu_email@exemplo.com'; 
-- (Nota: a tabela profiles não tem email por padrão, então use o seu ID de utilizador auth.uid)
-- O comando correto para se tornar o primeiro admin seria:
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'o_seu_email_aqui@exemplo.com');

-- 2. Actualizar as políticas da tabela profiles para que admins possam ver e editar tudo
DROP POLICY IF EXISTS "Utilizadores podem ver o seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Utilizadores podem actualizar o seu próprio perfil" ON public.profiles;

CREATE POLICY "Admins podem ver todos os perfis e os utilizadores podem ver o seu próprio" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins podem actualizar todos e os utilizadores o seu próprio" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Actualizar políticas da tabela system_templates para que admins possam adicionar templates
CREATE POLICY "Admins podem inserir templates" 
ON public.system_templates FOR INSERT 
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins podem actualizar templates" 
ON public.system_templates FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins podem apagar templates" 
ON public.system_templates FOR DELETE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
