-- Actualizações de Schema para o Motor de Geração (ref: geracao.md)

-- Tabela de Pastas (Folders)
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilizadores gerem as suas pastas" ON public.folders FOR ALL USING (auth.uid() = user_id);

-- Alterações na tabela minutas (adicionar novas colunas se não existirem)
ALTER TABLE public.minutas 
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id),
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'editor' CHECK (source_type IN ('upload','editor','template')),
  ADD COLUMN IF NOT EXISTS original_docx_key VARCHAR(500),
  ADD COLUMN IF NOT EXISTS content_html TEXT,
  ADD COLUMN IF NOT EXISTS content_normalized TEXT;

-- Alterações na tabela minuta_fields (ajustar colunas)
ALTER TABLE public.minuta_fields 
  ADD COLUMN IF NOT EXISTS placeholder VARCHAR(200);

-- Nova tabela: Ocorrências de cada campo no documento
CREATE TABLE public.field_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.minuta_fields(id) ON DELETE CASCADE,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  original_text VARCHAR(500) NOT NULL,
  paragraph_index INTEGER NOT NULL,
  node_path TEXT NOT NULL
);
ALTER TABLE public.field_occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilizadores gerem ocorrências" ON public.field_occurrences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.minuta_fields mf
      JOIN public.minutas m ON mf.minuta_id = m.id
      WHERE mf.id = field_occurrences.field_id AND m.user_id = auth.uid()
    )
  );

-- Nova tabela: Imagens das minutas
CREATE TABLE public.minuta_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID NOT NULL REFERENCES public.minutas(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  original_name VARCHAR(200),
  width_emu INTEGER NOT NULL DEFAULT 0,
  height_emu INTEGER NOT NULL DEFAULT 0,
  width_px INTEGER NOT NULL,
  height_px INTEGER NOT NULL,
  placement JSONB NOT NULL,
  is_logo BOOLEAN DEFAULT false,
  html_node_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.minuta_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilizadores gerem imagens" ON public.minuta_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.minutas m
      WHERE m.id = minuta_images.minuta_id AND m.user_id = auth.uid()
    )
  );

-- Alterações em generated_documents (ou criar document_generations como pede o documento)
-- Como a tabela generated_documents já existe, vamos expandi-la
ALTER TABLE public.generated_documents 
  ADD COLUMN IF NOT EXISTS field_values JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pdf_key VARCHAR(500),
  ADD COLUMN IF NOT EXISTS docx_key VARCHAR(500);

-- Tabela para overrides de imagem em gerações
CREATE TABLE public.generation_image_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES public.generated_documents(id) ON DELETE CASCADE,
  minuta_image_id UUID NOT NULL REFERENCES public.minuta_images(id),
  replacement_storage_key VARCHAR(500) NOT NULL,
  width_px INTEGER,
  height_px INTEGER
);
ALTER TABLE public.generation_image_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilizadores gerem overrides de imagem" ON public.generation_image_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.generated_documents gd
      WHERE gd.id = generation_image_overrides.generation_id AND gd.user_id = auth.uid()
    )
  );
