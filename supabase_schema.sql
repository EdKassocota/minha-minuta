-- Esquema de Base de Dados para "Minha Minuta" (Supabase)
-- Execute este script no SQL Editor do seu projecto Supabase.

-- 1. Criação de tabelas
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  company text,
  plan text default 'Essencial',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE public.minutas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  content text,
  status text default 'Rascunho', -- 'Rascunho', 'Activo', 'Arquivado'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE public.minuta_fields (
  id uuid default gen_random_uuid() primary key,
  minuta_id uuid references public.minutas(id) on delete cascade not null,
  name text not null,
  field_type text not null, -- 'Texto Livre', 'Data', 'Valor (Extenso)', 'BI / NIF', 'Género'
  is_required boolean default true,
  order_index integer default 0
);

CREATE TABLE public.generated_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  minuta_id uuid references public.minutas(id) on delete set null,
  doc_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Configuração de Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minuta_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Utilizadores podem ver o seu próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Utilizadores podem actualizar o seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Gatilho para criar o perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Políticas para minutas
CREATE POLICY "Utilizadores podem gerir as suas minutas" ON public.minutas
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para minuta_fields
CREATE POLICY "Utilizadores podem gerir campos das suas minutas" ON public.minuta_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.minutas
      WHERE minutas.id = minuta_fields.minuta_id AND minutas.user_id = auth.uid()
    )
  );

-- Políticas para generated_documents
CREATE POLICY "Utilizadores podem gerir o seu histórico de documentos" ON public.generated_documents
  FOR ALL USING (auth.uid() = user_id);

-- 3. Templates Padrão do Sistema
CREATE TABLE public.system_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  fields_count integer default 0
);

ALTER TABLE public.system_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer utilizador autenticado pode ver templates" ON public.system_templates FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.system_templates (name, category, fields_count) VALUES 
('Contrato de Trabalho', 'RH', 8),
('Procuração Forense', 'Jurídico', 5),
('Contrato de Arrendamento', 'Imobiliário', 10),
('Acordo de Confidencialidade (NDA)', 'Jurídico', 6),
('Contrato de Prestação de Serviços', 'Comercial', 12),
('Recibo de Pagamento', 'Financeiro', 4);
