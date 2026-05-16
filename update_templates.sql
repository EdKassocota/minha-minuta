-- Execute este script no SQL Editor do Supabase para atualizar a tabela de templates

-- 1. Adicionar novas colunas para conteúdo e imagem de capa
ALTER TABLE public.system_templates 
ADD COLUMN content text,
ADD COLUMN cover_image_url text;

-- 2. Atualizar os dados existentes com uma imagem de capa genérica (placeholders) e conteúdo exemplo
UPDATE public.system_templates 
SET 
  content = 'Este é o conteúdo do documento. Onde existem campos como [Nome] ou [Data], o sistema irá substituir automaticamente durante a geração do documento final.',
  cover_image_url = 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=600&auto=format&fit=crop';
