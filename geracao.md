# Minha Minuta — Especificações Técnicas: Motor de Geração de Documentos

> Documento de referência técnica e prompt completo para implementação do fluxo de criação e geração de documentos via minutas com campos sublinhados.

---

## PARTE 1 — ESPECIFICAÇÕES TÉCNICAS

---

### 1.1 Visão Geral do Sistema

O motor de geração de documentos é composto por quatro subsistemas interdependentes:

```
┌─────────────────────────────────────────────────────────────┐
│  SUBSISTEMA A — Ingestão e Renderização                     │
│  Recebe DOCX ou texto, renderiza fielmente no browser       │
├─────────────────────────────────────────────────────────────┤
│  SUBSISTEMA B — Marcação de Campos                          │
│  Utilizador sublinha trechos → sistema cria campos nomeados │
├─────────────────────────────────────────────────────────────┤
│  SUBSISTEMA C — Gestão de Imagens e Logótipos               │
│  Extrai imagens do DOCX, permite inserir/posicionar no      │
│  editor interno, preserva na geração final                  │
├─────────────────────────────────────────────────────────────┤
│  SUBSISTEMA D — Geração e Export                            │
│  Formulário preenchido → substituição → PDF + DOCX          │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.2 Subsistema A — Ingestão e Renderização

#### Fluxo de upload DOCX

```
DOCX enviado pelo utilizador
        ↓
Backend extrai estrutura via parser DOCX
        ↓
Converte para HTML estruturado (preservando:
  parágrafos, negrito, itálico, alinhamento,
  tamanho de fonte, tabelas, listas, espaçamentos)
        ↓
HTML renderizado no editor do browser
        ↓
DOCX original guardado em storage (fonte da verdade)
```

**Prioridade absoluta:** O HTML renderizado deve ser visualmente idêntico ao DOCX original. O utilizador deve reconhecer o seu documento imediatamente.

**O que deve ser preservado na conversão DOCX → HTML:**
- Família e tamanho de fonte por parágrafo
- Negrito, itálico, sublinhado, tachado
- Alinhamento (esquerda, centro, direita, justificado)
- Espaçamento entre parágrafos e recuos
- Tabelas com estrutura de células
- Listas ordenadas e não ordenadas
- Cabeçalhos e rodapés (renderizados como secções separadas na UI)
- Imagens inline (renderizadas como `<img>` com base64 ou URL temporário assinado, com posição, dimensões e alinhamento originais preservados)
- Logótipos em cabeçalho/rodapé (tratados como imagens especiais com metadados de posição)

**O que pode ser simplificado:**
- Colunas múltiplas de página (renderizar como coluna única)
- Numeração de página automática (substituir por placeholder visual)
- Quebras de secção complexas

#### Fluxo de escrita no editor

```
Utilizador escreve no editor interno
        ↓
Editor produz HTML estruturado em tempo real
        ↓
HTML guardado como fonte da minuta
        ↓
Na geração final: HTML → DOCX via serialização reversa
```

O editor interno deve ter barra de ferramentas minimalista:
- Negrito, Itálico, Sublinhado
- Alinhamento (4 opções)
- Lista com marcadores, Lista numerada
- Tamanho de fonte (selector simples)
- A barra aparece apenas ao seleccionar texto (toolbar flutuante posicionada acima da selecção)

---

### 1.3 Subsistema B — Marcação de Campos

Este é o núcleo diferenciador do produto. Deve funcionar com zero fricção.

#### Modelo de dados de um campo

```typescript
interface MinutaField {
  id: string;                    // UUID único
  name: string;                  // "Nome do Cliente", "Data do Contrato", etc.
  type: FieldType;               // ver enum abaixo
  occurrences: FieldOccurrence[]; // todas as posições no documento
  required: boolean;
  placeholder?: string;          // texto de exemplo para o formulário
  order: number;                 // ordem de aparecimento no formulário
}

interface FieldOccurrence {
  id: string;
  startOffset: number;           // posição de caractere no texto normalizado
  endOffset: number;
  originalText: string;          // texto original sublinhado (ex: "João Manuel")
  paragraphIndex: number;        // índice do parágrafo no documento
  nodePath: string;              // selector XPath/CSS para localizar no DOM
}

enum FieldType {
  TEXT = "text",                 // texto livre
  NAME = "name",                 // nome próprio (capitalização automática)
  DATE = "date",                 // data com extenso automático
  BI = "bi",                     // Bilhete de Identidade angolano
  NIF = "nif",                   // Número de Identificação Fiscal
  AMOUNT = "amount",             // valor monetário com extenso em AOA/USD
  NUMBER_WORDS = "number_words", // número convertido para extenso
  GENDER = "gender",             // Masculino/Feminino → concordância automática
  EMAIL = "email",
  PHONE = "phone",
  ADDRESS = "address",
}
```

#### Modelo de dados de uma minuta

```typescript
interface Minuta {
  id: string;
  userId: string;
  name: string;
  category?: string;
  folderId?: string;
  sourceType: "upload" | "editor" | "template";
  originalDocxUrl?: string;      // storage URL do DOCX original
  contentHtml: string;           // HTML estruturado do documento
  contentNormalized: string;     // texto plano para busca de ocorrências
  fields: MinutaField[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Fluxo de marcação pelo utilizador

**Passo 1 — Selecção de texto**

O utilizador selecciona um trecho de texto no documento renderizado exactamente como faria no Word (click e arraste, ou double-click para seleccionar palavra).

Ao soltar a selecção (evento `mouseup` / `touchend`):
- Sistema verifica se a selecção tem conteúdo (length > 0)
- Sistema verifica se a selecção não está dentro de uma marcação já existente
- Se válido: aparece o **tooltip de marcação**

**Passo 2 — Tooltip de marcação**

```
┌─────────────────────────────────┐
│  Definir como campo editável    │
│                                 │
│  Nome: [_____________________]  │
│  Tipo: [Texto livre        ▼]   │
│                                 │
│  [Cancelar]        [Confirmar]  │
└─────────────────────────────────┘
```

- Posicionado imediatamente acima da selecção, centrado
- Foco automático no campo "Nome"
- Dropdown de tipo com as opções do enum FieldType
- Pressionar Enter confirma
- Pressionar Escape cancela e deselecciona

**Passo 3 — Detecção de ocorrências repetidas**

Após confirmar o campo, o sistema:

1. Normaliza o texto seleccionado (trim, lowercase para comparação)
2. Varre todo o documento em busca de ocorrências idênticas
3. Se encontrar mais de 1 ocorrência:

```
┌────────────────────────────────────────────────┐
│  Encontrámos 4 ocorrências de "João Manuel"    │
│  no documento.                                 │
│                                                │
│  Marcar todas automaticamente?                 │
│                                                │
│  [Marcar apenas esta]    [Marcar todas (4)]    │
└────────────────────────────────────────────────┘
```

4. As ocorrências marcadas ficam destacadas no documento com fundo `#EEF2F8` e sublinhado `#34649A`
5. Cada ocorrência tem um pequeno badge com o nome do campo

**Passo 4 — Gestão de campos no painel lateral**

O painel direito (280px) mostra a lista de campos definidos:

```
CAMPOS DEFINIDOS (3)
─────────────────────────────────
⠿  Nome do Cliente        Nome
    4 ocorrências
─────────────────────────────────
⠿  Data do Contrato       Data
    1 ocorrência
─────────────────────────────────
⠿  Valor Mensal           Valor
    2 ocorrências
─────────────────────────────────
+ Adicionar campo manualmente
```

- `⠿` = handle de drag-and-drop para reordenar
- Clicar num campo: destaca todas as suas ocorrências no documento
- Hover num campo: aparece ícone de edição (lápis) e remoção (×)
- Remover campo: remove todas as marcações do documento e pede confirmação se tiver ocorrências

---

### 1.5 Subsistema D — Geração e Export

#### Modelo de dados de uma geração

```typescript
interface DocumentGeneration {
  id: string;
  minutaId: string;
  userId: string;
  fieldValues: Record<string, ProcessedFieldValue>; // fieldId → valor processado
  status: "pending" | "processing" | "ready" | "error";
  pdfUrl?: string;
  docxUrl?: string;
  createdAt: Date;
}

interface ProcessedFieldValue {
  raw: string;             // valor digitado pelo utilizador
  display: string;         // valor formatado para exibição no documento
  extensions?: {
    extenso?: string;      // "três mil e quinhentos kwanzas"
    dateExtenso?: string;  // "12 de Maio de 2025"
    genderForms?: GenderForms;
  };
}
```

#### Processamento de campos inteligentes

```typescript
// CAMPO TIPO: DATE
// Input: "12/05/2025"
// Output display: "12 de Maio de 2025"
// Output extenso: "doze de Maio de dois mil e vinte e cinco"

// CAMPO TIPO: AMOUNT (valor monetário)
// Input: "3500"
// Output display: "3.500,00 AOA"
// Output extenso: "três mil e quinhentos kwanzas"

// CAMPO TIPO: NUMBER_WORDS
// Input: "42"
// Output: "quarenta e dois"

// CAMPO TIPO: GENDER
// Input: "Feminino"
// No documento: todos os tokens de género são substituídos
// Ex: "o/a Senhor(a)" → "a Senhora"
// Ex: "do/da" → "da"
// Ex: "contratado/contratada" → "contratada"

// CAMPO TIPO: NAME
// Input: "joão manuel da silva"
// Output: "João Manuel da Silva"

// CAMPO TIPO: BI (Angola)
// Formato esperado: 00XXXXXXXXXXX (validação de formato angolano)
// Exibição: tal como digitado, após validação

// CAMPO TIPO: NIF
// Validação numérica, 9-10 dígitos
```

#### Fluxo de preenchimento e preview em tempo real

```
Utilizador abre minuta
        ↓
Sistema carrega contentHtml + fields da minuta
        ↓
Renderiza layout:
  ┌──────────────────┬──────────────────────────────┐
  │   FORMULÁRIO     │   PREVIEW DO DOCUMENTO       │
  │   (380px)        │   (restante da largura)      │
  │                  │                              │
  │  Nome do Cliente │   ...o contrato celebrado    │
  │  [__________]    │   entre [Nome do Cliente]    │
  │                  │   e a empresa...             │
  │  Data            │                              │
  │  [__________]    │                              │
  └──────────────────┴──────────────────────────────┘
        ↓
Utilizador digita num campo
        ↓
Sistema processa valor (extenso, formatação, género)
        ↓
Preview actualiza em tempo real:
  - Os placeholders [Nome do Cliente] são substituídos
  - Todas as ocorrências são actualizadas simultaneamente
  - Campos não preenchidos mantêm placeholder visual destacado
```

**Preview em tempo real — implementação:**
- O contentHtml da minuta tem os campos marcados como `<span data-field-id="uuid" class="mm-field">texto original</span>`
- Ao digitar no formulário, o JS substitui o `innerText` de todos os spans com o mesmo `data-field-id`
- Nenhuma chamada ao servidor durante o preenchimento — tudo client-side
- Chamada ao servidor apenas no momento de "Gerar Documento"

#### Geração final — pipeline no servidor

```
POST /api/generate
{ minutaId, fieldValues }
        ↓
Servidor carrega DOCX original (ou reconstrói de HTML)
        ↓
Para cada campo, para cada ocorrência:
  - Localiza posição no DOCX (via offsets guardados)
  - Substitui texto preservando formatação original do run
  - Aplica processamento inteligente (extenso, género, etc.)
        ↓
Serializa DOCX modificado
        ↓
Converte DOCX para PDF via LibreOffice headless
        ↓
Aplica marca d'água se plano gratuito
        ↓
Guarda ambos em storage
        ↓
Retorna { pdfUrl, docxUrl, generationId }
        ↓
Frontend apresenta ecrã de resultado com botões de download
```

#### Preservação de formatação na substituição

Este é o ponto técnico mais crítico. Quando o utilizador sublinha "João Manuel" no DOCX, esse texto pode estar distribuído por múltiplos `<w:r>` (runs) no XML, cada um com formatação diferente (negrito, tamanho, fonte). A substituição deve:

1. Identificar todos os runs que contêm o texto do campo
2. Manter a formatação `<w:rPr>` do primeiro run
3. Substituir o conteúdo textual
4. Eliminar os runs residuais que faziam parte do mesmo campo

---

### 1.4 Subsistema C — Gestão de Imagens e Logótipos

#### 1.4.1 Extracção de imagens de DOCX enviado

Quando um DOCX é processado, o sistema deve extrair todas as imagens presentes e preservar os seus metadados de posicionamento.

**Modelo de dados de uma imagem da minuta:**

```typescript
interface MinutaImage {
  id: string;
  minutaId: string;
  storageKey: string;          // chave no storage do ficheiro de imagem
  mimeType: string;            // "image/png" | "image/jpeg" | "image/svg+xml" | etc.
  originalName?: string;       // nome do ficheiro dentro do DOCX (ex: "image1.png")
  widthEmu: number;            // largura original em EMU (1 inch = 914400 EMU)
  heightEmu: number;           // altura original em EMU
  widthPx: number;             // largura calculada em px para renderização no browser
  heightPx: number;            // altura calculada em px
  placement: ImagePlacement;
  isLogo: boolean;             // true se detectada em cabeçalho ou primeira posição do documento
  htmlNodeId: string;          // id do <img> correspondente no contentHtml
}

type ImagePlacement =
  | { type: "inline"; paragraphIndex: number; runIndex: number }
  | { type: "header"; headerType: "default" | "first" | "even" }
  | { type: "footer"; footerType: "default" | "first" | "even" }
  | { type: "floating"; anchorParagraphIndex: number; xPosPt: number; yPosPt: number; wrapType: "square" | "tight" | "none" };
```

**Fluxo de extracção:**

```
DOCX recebido
      ↓
Descompactar (ZIP) → aceder a word/media/
      ↓
Para cada imagem em word/media/:
  - Ler ficheiro binário
  - Determinar mimeType (por extensão e magic bytes)
  - Calcular widthPx e heightPx a partir dos EMUs no XML
  - Determinar placement (inline, header, footer, floating)
  via análise do document.xml, header1.xml, footer1.xml
  - Guardar imagem em storage com key única
  - Criar registo MinutaImage
      ↓
No HTML gerado:
  - Imagens inline: <img data-image-id="uuid" src="[url_assinada]"
      style="width:Xpx; height:Ypx;" data-placement="inline">
  - Imagens em cabeçalho: renderizadas na secção de cabeçalho do HTML
  - Imagens floating: renderizadas com position:relative e margens aproximadas
```

**Detecção automática de logótipo:**

O sistema marca `isLogo: true` automaticamente quando a imagem:
- Está no cabeçalho do documento (header XML), OU
- É a primeira imagem do documento E está num parágrafo antes do primeiro texto substantivo, OU
- Tem aspect ratio típico de logótipo (largura ≥ 2× a altura) E está no terço superior do documento

Esta detecção é heurística — o utilizador pode sempre corrigir manualmente na UI.

---

#### 1.4.2 Renderização de imagens no editor

Após extracção, as imagens são renderizadas no editor com fidelidade visual:

- Imagens inline: aparecem no fluxo de texto, na posição exacta, com as dimensões originais (escaladas para caber na largura do editor se necessário, mantendo proporção).
- Imagens em cabeçalho: renderizadas numa secção de cabeçalho separada acima do corpo do documento, com fundo `#F9FAFB` e borda inferior `1px #E2E4E7`, marcada com label "Cabeçalho".
- Imagens em rodapé: idem, secção abaixo do corpo, marcada com label "Rodapé".
- Imagens floating: renderizadas com posicionamento aproximado; indicação visual de que o posicionamento exacto será preservado no DOCX gerado.

Ao passar o rato sobre qualquer imagem no editor: aparece um mini-toolbar com:
- "Substituir imagem" (abre selector de ficheiro)
- "Redimensionar" (handles de redimensionamento nos cantos)
- "Remover"

---

#### 1.4.3 Upload de logótipo no editor interno

Quando o utilizador escreve do zero no editor interno (sourceType === "editor"), deve poder inserir um logótipo ou qualquer imagem.

**Botão na toolbar do editor:** "Inserir imagem" — ícone de imagem, sempre visível na toolbar (não apenas ao seleccionar texto).

**Ao clicar "Inserir imagem":**

```
┌──────────────────────────────────────────────────┐
│  Inserir imagem                                  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │                                          │   │
│  │   Arraste o ficheiro aqui                │   │
│  │   ou clique para seleccionar             │   │
│  │                                          │   │
│  │   PNG, JPG, SVG — máx. 5MB              │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Posição no documento:                           │
│  ○ No cursor (inline no texto)                   │
│  ○ Cabeçalho da página                           │
│  ○ Rodapé da página                              │
│                                                  │
│  Alinhamento:  [Esquerda ▼]                      │
│  Largura:      [Auto ▼]  (ou px manual)          │
│                                                  │
│  [Cancelar]              [Inserir]               │
└──────────────────────────────────────────────────┘
```

**Opções de posição:**

- **No cursor (inline):** imagem inserida na posição actual do cursor no texto. O utilizador pode depois clicar e arrastar para reposicionar.
- **Cabeçalho da página:** imagem inserida na zona de cabeçalho. Se já existir um cabeçalho, a imagem é adicionada a ele. Ao escolher esta opção, mostrar preview da zona de cabeçalho.
- **Rodapé da página:** idem para rodapé.

**Opções de alinhamento:** Esquerda, Centro, Direita (aplica-se ao parágrafo que contém a imagem).

**Opções de largura:**
- Auto (mantém dimensões originais, limitado à largura do documento)
- 25%, 50%, 75%, 100% da largura da página
- Valor manual em px

**Após inserção:** A imagem aparece no editor na posição escolhida. Handles de redimensionamento nos 4 cantos. Clique fora deselecciona.

---

#### 1.4.4 Fluxo de substituição de logótipo

Caso frequente: o utilizador tem um template com o logótipo da empresa A e quer usá-lo com o logótipo da empresa B.

No painel lateral de campos, secção separada abaixo dos campos de texto:

```
IMAGENS DO DOCUMENTO (1)
─────────────────────────────────
🖼  Logótipo (cabeçalho)
    logo_empresa.png · 240×80px
    [Substituir]  [Remover]
─────────────────────────────────
+ Inserir imagem
```

"Substituir": abre selector de ficheiro. A nova imagem substitui a original mantendo as mesmas dimensões e posição. O utilizador pode optar por "Manter dimensões originais" ou "Usar dimensões do novo ficheiro".

Esta substituição é guardada na minuta — todas as gerações futuras usarão a nova imagem, a menos que o utilizador a substitua novamente.

---

#### 1.4.5 Preservação de imagens na geração final

No pipeline de geração do servidor (Módulo 4A), após a substituição de campos de texto:

```
Para cada imagem registada na minuta:

  SE imagem foi substituída pelo utilizador:
    - Usar nova imagem do storage
    - Aplicar dimensões conforme escolha do utilizador
  SENÃO:
    - Usar imagem original do storage

  SE sourceType === "upload":
    - Reescrever o relacionamento rId no DOCX
    - Substituir o ficheiro em word/media/
    - Preservar EMUs originais (ou recalcular se redimensionada)
    - Preservar tipo de placement (inline / header / footer / floating)

  SE sourceType === "editor":
    - Serializar imagem como w:drawing inline ou em header/footer XML
    - Calcular EMUs a partir das dimensões em px definidas no editor
    - Aplicar alinhamento como w:jc no parágrafo pai
```

**Regra crítica:** Imagens nunca são campos do formulário — são elementos fixos ou substituíveis manualmente. Não aparecem no formulário de preenchimento. A sua gestão é feita exclusivamente no editor da minuta.

---

#### 1.4.6 Tratamento de formatos de imagem

| Formato | Upload aceite | Renderização browser | No DOCX gerado |
|---|---|---|---|
| PNG | Sim | `<img>` nativo | Preservado como PNG |
| JPG/JPEG | Sim | `<img>` nativo | Preservado como JPEG |
| SVG | Sim | `<img>` com src SVG | Convertido para PNG antes de inserir no DOCX |
| GIF | Sim (apenas 1.º frame) | `<img>` nativo | Convertido para PNG |
| WEBP | Sim | `<img>` nativo | Convertido para PNG |
| BMP | Não | — | — |
| TIFF | Não | — | — |

Tamanho máximo por imagem: 5MB. Se superior: rejeitar com mensagem "A imagem excede o tamanho máximo de 5MB."

Validação de tipo: verificar magic bytes, não apenas extensão do ficheiro.

---

#### 1.4.7 Adições ao schema da base de dados

```sql
-- Imagens das minutas
CREATE TABLE minuta_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID NOT NULL REFERENCES minutas(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  original_name VARCHAR(200),
  width_emu INTEGER NOT NULL DEFAULT 0,
  height_emu INTEGER NOT NULL DEFAULT 0,
  width_px INTEGER NOT NULL,
  height_px INTEGER NOT NULL,
  placement JSONB NOT NULL,        -- { type, paragraphIndex, ... }
  is_logo BOOLEAN DEFAULT false,
  html_node_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Substituições de imagem por geração (opcional — para quando o utilizador
-- substitui uma imagem apenas numa geração específica, não na minuta toda)
CREATE TABLE generation_image_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES document_generations(id) ON DELETE CASCADE,
  minuta_image_id UUID NOT NULL REFERENCES minuta_images(id),
  replacement_storage_key VARCHAR(500) NOT NULL,
  width_px INTEGER,
  height_px INTEGER
);
```

---

#### 1.4.8 Adições ao endpoint de upload

O endpoint `POST /api/upload/docx` passa a retornar também:

```json
{
  "contentHtml": "...",
  "contentNormalized": "...",
  "originalDocxKey": "...",
  "images": [
    {
      "id": "uuid",
      "storageKey": "images/uuid.png",
      "previewUrl": "https://storage.../signed-url",
      "widthPx": 240,
      "heightPx": 80,
      "placement": { "type": "header", "headerType": "default" },
      "isLogo": true,
      "htmlNodeId": "img-uuid"
    }
  ],
  "metadata": {
    "pageCount": 2,
    "wordCount": 450,
    "hasImages": true,
    "imageCount": 1,
    "hasTables": true
  }
}
```

---

#### 1.4.9 Adições ao endpoint de criação de minuta

O endpoint `POST /api/minutas` passa a aceitar também o array `images` com os registos de imagem retornados pelo upload, para que sejam persistidos associados à minuta.

---

```sql
-- Minutas
CREATE TABLE minutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  folder_id UUID REFERENCES folders(id),
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('upload','editor','template')),
  original_docx_key VARCHAR(500),   -- storage key do DOCX original
  content_html TEXT NOT NULL,        -- HTML renderizável
  content_normalized TEXT NOT NULL,  -- texto plano para busca
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campos de cada minuta
CREATE TABLE minuta_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID NOT NULL REFERENCES minutas(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  required BOOLEAN DEFAULT true,
  placeholder VARCHAR(200),
  field_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ocorrências de cada campo no documento
CREATE TABLE field_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES minuta_fields(id) ON DELETE CASCADE,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  original_text VARCHAR(500) NOT NULL,
  paragraph_index INTEGER NOT NULL,
  node_path TEXT NOT NULL
);

-- Gerações de documentos
CREATE TABLE document_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID NOT NULL REFERENCES minutas(id),
  user_id UUID NOT NULL REFERENCES users(id),
  field_values JSONB NOT NULL,       -- { fieldId: { raw, display, extensions } }
  status VARCHAR(20) DEFAULT 'pending',
  pdf_key VARCHAR(500),
  docx_key VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pastas (organização)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 1.6 API Endpoints Necessários

```
POST   /api/minutas                    Criar nova minuta
GET    /api/minutas                    Listar minutas do utilizador
GET    /api/minutas/:id                Detalhe de uma minuta
PUT    /api/minutas/:id                Actualizar minuta
DELETE /api/minutas/:id                Eliminar minuta

POST   /api/minutas/:id/fields         Adicionar campo
PUT    /api/minutas/:id/fields/:fid    Actualizar campo
DELETE /api/minutas/:id/fields/:fid    Remover campo
PUT    /api/minutas/:id/fields/reorder Reordenar campos

POST   /api/upload/docx                Upload e parsing de DOCX → HTML + extracção de imagens
POST   /api/upload/image               Upload de imagem avulsa (editor interno)

GET    /api/generations                Histórico de gerações
GET    /api/generations/:id/download/pdf   Download PDF
GET    /api/generations/:id/download/docx  Download DOCX

GET    /api/minutas/:id/images              Listar imagens de uma minuta
PUT    /api/minutas/:id/images/:iid         Actualizar metadados de imagem (isLogo, placement, dimensões)
POST   /api/minutas/:id/images/:iid/replace Upload de imagem substituta
DELETE /api/minutas/:id/images/:iid         Remover imagem da minuta

GET    /api/templates                  Listar templates disponíveis
POST   /api/templates/:id/clone        Clonar template para minuta do utilizador
```

---

### 1.7 Controlo de Limites por Plano

```typescript
const PLAN_LIMITS = {
  free: {
    minutas: 1,
    generations: 5,
    watermark: true,
  },
  essencial: {
    minutas: 5,
    generations: Infinity,
    watermark: false,
  },
  profissional: {
    minutas: 100,
    generations: Infinity,
    watermark: false,
    customLogo: true,
    folders: true,
  },
  escritorio: {
    minutas: 500,
    generations: Infinity,
    watermark: false,
    customLogo: true,
    folders: true,
    teamMembers: 10,
    sharedLibrary: true,
  }
};
```

Verificar limites em middleware antes de: criar minuta, gerar documento.  
Retornar erro `402 Payment Required` com campo `upgradeRequired: true` quando limite atingido.

---

---

## PARTE 2 — PROMPT COMPLETO PARA ANTIGRAVITY

---

Copia e cola o seguinte prompt na ferramenta de IA:

---

```
Implementa o motor de geração de documentos da plataforma SaaS "Minha Minuta".

Este é o fluxo central do produto: o utilizador cria minutas a partir de documentos DOCX 
ou texto escrito, sublinha os campos editáveis, e depois gera novos documentos preenchendo 
um formulário. O sistema entrega o documento final em PDF e DOCX.

---

## CONTEXTO DO PRODUTO

Plataforma SaaS de automação documental para o mercado angolano. 
Stack já definido pelo backend-specialist. Implementa apenas o motor descrito abaixo.

---

## MÓDULO 1 — INGESTÃO DE DOCUMENTOS

### 1A. Endpoint de upload DOCX

Cria o endpoint `POST /api/upload/docx`.

Recebe um ficheiro `.docx` via multipart/form-data.

Processa o ficheiro e retorna:
```json
{
  "contentHtml": "<html estruturado fiel ao original>",
  "contentNormalized": "texto plano sem formatação",
  "originalDocxKey": "storage/uuid.docx",
  "metadata": {
    "pageCount": 2,
    "wordCount": 450,
    "hasImages": false,
    "hasTables": true
  }
}
```

Requisitos da conversão DOCX → HTML:
- Preservar: família e tamanho de fonte por parágrafo e run, negrito/itálico/sublinhado, alinhamento (esquerda/centro/direita/justificado), espaçamento entre parágrafos, recuos, tabelas com estrutura de células, listas ordenadas e não ordenadas.
- Cada parágrafo tem atributo `data-para-index="N"` (índice sequencial).
- Cada run de texto tem atributo `data-run-id="uuid"`.
- Texto de cada nó tem atributo `data-char-start="N" data-char-end="N"` com offset no texto normalizado.
- Imagens são convertidas para base64 inline.
- Guardar DOCX original em storage com key gerada.

### 1B. Editor interno

O editor interno (para quando o utilizador escreve do zero) produz o mesmo formato HTML estruturado com os mesmos atributos de data-para-index e data-run-id.

Toolbar flutuante (aparece apenas ao seleccionar texto, posicionada acima da selecção):
- Negrito, Itálico, Sublinhado
- Alinhamento: esquerda, centro, direita, justificado
- Lista com marcadores, Lista numerada
- Selector de tamanho de fonte: 10, 11, 12, 14, 16, 18, 20, 24

---

## MÓDULO 2 — MARCAÇÃO DE CAMPOS

### 2A. Comportamento de selecção

No documento renderizado, quando o utilizador faz uma selecção de texto (mouseup / touchend):

1. Verificar se a selecção tem length > 0.
2. Verificar se a selecção não intersecta uma marcação já existente.
3. Se válido: calcular os offsets da selecção no texto normalizado do documento.
4. Mostrar o tooltip de marcação.

### 2B. Tooltip de marcação

Renderizar um tooltip posicionado imediatamente acima da selecção, centrado horizontalmente.

Conteúdo:
- Input de texto: "Nome do campo" com foco automático
- Dropdown: "Tipo" com as opções: Texto livre, Nome próprio, Data, Bilhete de Identidade, NIF, Valor monetário, Número por extenso, Género, Email, Telefone, Morada
- Checkbox: "Campo obrigatório" (marcado por defeito)
- Botões: "Cancelar" (ghost) e "Confirmar" (primário)
- Enter confirma, Escape cancela

Ao confirmar:
1. Guardar o campo com os seus offsets no texto normalizado.
2. Proceder à detecção de ocorrências repetidas.

### 2C. Detecção de ocorrências repetidas

Após confirmar o campo:

1. Normalizar o texto seleccionado (trim, sem case).
2. Varrer contentNormalized em busca de ocorrências idênticas.
3. Calcular os offsets de cada ocorrência.

Se existir mais de 1 ocorrência:
- Mostrar modal: "Encontrámos N ocorrências de '[texto]' no documento. Marcar todas automaticamente?"
- Botões: "Marcar apenas esta" e "Marcar todas (N)"

Para cada ocorrência marcada:
- Guardar FieldOccurrence com { start_offset, end_offset, original_text, paragraph_index, node_path }.
- Aplicar marcação visual no DOM: `<span data-field-id="uuid" data-occurrence-id="uuid" class="mm-field-mark">`.

### 2D. Estilo visual das marcações

Texto marcado no documento:
- Fundo: #EEF2F8
- Borda inferior: 2px solid #34649A
- Badge sobre o trecho: 10px, fundo #34649A, texto branco, texto = nome do campo

Ao passar o rato sobre uma marcação:
- Badge expande mostrando: [nome do campo] [ícone editar] [ícone ×]
- Clicar × remove a marcação específica
- Clicar lápis abre o tooltip de edição do campo

### 2E. Painel lateral de campos (280px, lado direito)

Header: "Campos definidos (N)"

Lista de campos na ordem definida:
- Handle de drag-and-drop (ícone ⠿) à esquerda
- Nome do campo (14px, peso 500)
- Badge do tipo (12px)
- Linha secundária: "N ocorrência(s)" (12px, #6E6E6E)
- Ícones de acção no hover: editar (lápis), remover (×)

Clicar num campo: destaca todas as suas ocorrências no documento com outline adicional.

Botão no fundo do painel: "+ Adicionar campo manualmente" (abre o tooltip de marcação sem selecção, pedindo ao utilizador que clique no documento para indicar a posição)

### 2F. Guardar minuta

Barra fixa no fundo do ecrã (48px de altura):
- Campo inline: "Nome da minuta" 
- Dropdown: "Pasta" (se plano com pastas)
- Botão primário: "Guardar minuta"

Ao guardar:
- Validar que tem pelo menos 1 campo definido
- Validar que o nome não está vazio
- POST /api/minutas com { name, folderId, sourceType, contentHtml, contentNormalized, fields, occurrences }
- Toast de sucesso: "Minuta guardada."
- Redirigir para /minutas/:id

---

## MÓDULO 3 — FORMULÁRIO E PREVIEW EM TEMPO REAL

### 3A. Layout da página de geração

URL: /minutas/:id/gerar

Layout em duas colunas:

```
┌─────────────────────┬───────────────────────────────────┐
│  FORMULÁRIO (380px) │  PREVIEW DO DOCUMENTO             │
│  fixo, com scroll   │  (largura restante, scroll)       │
│  independente       │                                   │
└─────────────────────┴───────────────────────────────────┘
```

Em mobile (< 768px): colunas empilhadas, formulário em cima, preview em baixo.

### 3B. Formulário

Header do formulário:
- Nome da minuta (17px, peso 600)
- "Preencha os campos abaixo"

Para cada campo da minuta (na ordem definida):

Label: nome do campo + asterisco se required
Input: conforme tipo:
  - TEXT, NAME, ADDRESS, EMAIL, PHONE → input de texto simples
  - DATE → input de texto com máscara dd/mm/aaaa
  - BI → input de texto com máscara de BI angolano (validação de formato ao blur)
  - NIF → input de texto numérico (validação ao blur)
  - AMOUNT → input numérico com selector AOA/USD à direita
  - NUMBER_WORDS → input numérico
  - GENDER → dropdown: "Masculino" / "Feminino"

Sob cada campo inteligente, linha de preview em cinzento (#6E6E6E, 12px, itálico):
  - DATE: "12 de Maio de 2025" (aparece ao preencher)
  - AMOUNT: "Três mil e quinhentos kwanzas" (aparece ao preencher)
  - NUMBER_WORDS: "quarenta e dois" (aparece ao preencher)
  - GENDER: "Concordância automática aplicada"

Botão fixo na base do formulário: "Gerar Documento" (primário, largura total do painel)

### 3C. Preview em tempo real

O contentHtml da minuta tem os campos marcados como:
`<span data-field-id="uuid" class="mm-field-mark">texto original</span>`

Ao utilizador digitar num campo do formulário:
1. Processar o valor no cliente (extenso, formatação, género) — sem chamada ao servidor.
2. Actualizar o innerText de todos os `span[data-field-id="uuid"]` no preview simultaneamente.
3. Campos não preenchidos: manter o texto original com fundo #EEF2F8 e borda inferior #34649A.
4. Campos preenchidos: fundo #F0FDF4, borda inferior #1A6B3C, texto em preto normal.

Processamento client-side obrigatório:
  - Datas: "12/05/2025" → "12 de Maio de 2025"
  - Valores: "3500" → "3.500,00 AOA" + extenso "três mil e quinhentos kwanzas"
  - Género feminino: substituir padrões "o/a"→"a", "do/da"→"da", "Senhor(a)"→"Senhora", "contratado/contratada"→"contratada", "trabalhador/trabalhadora"→"trabalhadora"
  - Nome próprio: capitalizar cada palavra excepto preposições (de, da, do, e)
  - Número por extenso: converter inteiro para texto em português de Angola

### 3D. Validação antes de gerar

Ao clicar "Gerar Documento":
1. Verificar todos os campos required estão preenchidos. Se não: marcar campos em falta com borda vermelha e mensagem "Campo obrigatório." Fazer scroll até ao primeiro campo em falta.
2. Verificar validações de formato (BI, NIF, email). Se inválido: mensagem específica abaixo do campo.
3. Verificar limite do plano do utilizador. Se atingido: modal de upgrade.
4. Se tudo válido: POST /api/generate.

---

## MÓDULO 4 — GERAÇÃO NO SERVIDOR

### 4A. Endpoint de geração

`POST /api/generate`

Body:
```json
{
  "minutaId": "uuid",
  "fieldValues": {
    "field-uuid-1": { "raw": "João Manuel da Silva", "type": "name" },
    "field-uuid-2": { "raw": "12/05/2025", "type": "date" },
    "field-uuid-3": { "raw": "150000", "type": "amount", "currency": "AOA" }
  }
}
```

Pipeline no servidor:

1. Carregar minuta e validar que pertence ao utilizador.
2. Verificar limite de gerações do plano.
3. Processar todos os valores (extenso, género, formatação) — mesma lógica do cliente mas autoritativa.
4. Criar registo DocumentGeneration com status "processing".
5. Retornar imediatamente { generationId, status: "processing" }.
6. Processar em background:
   a. Carregar DOCX original de storage (ou construir de HTML se sourceType === "editor").
   b. Para cada campo, para cada ocorrência:
      - Localizar a posição no DOCX usando nodeId e offsets
      - Substituir o texto preservando a formatação do run original (w:rPr)
      - Lidar com campos que abrangem múltiplos runs: fundir runs, preservar formatação do primeiro
   c. Serializar DOCX modificado.
   d. Se plano free: injectar marca d'água em cada página (texto diagonal "MINHA MINUTA - Versão Gratuita", 30% opacidade, cinzento).
   e. Converter DOCX para PDF usando LibreOffice headless.
   f. Guardar ambos em storage.
   g. Actualizar registo com status "ready" e URLs.
   h. Notificar frontend via WebSocket ou polling.

### 4B. Polling de status

O frontend faz polling a `GET /api/generations/:id` a cada 1.5 segundos até status === "ready" ou "error".

Máximo de 60 segundos de espera. Se ultrapassar: mostrar mensagem de erro com botão "Tentar novamente".

### 4C. Ecrã de resultado

Quando status === "ready", substituir o layout de formulário/preview pelo ecrã de resultado:

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Documento gerado.                                 │
│                                                    │
│  [  Descarregar PDF  ]   [  Descarregar DOCX  ]   │
│                                                    │
│  ──────────────────────────────────────────────   │
│                                                    │
│  Gerar outro com esta minuta                      │
│  Voltar às minutas                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

- Os dois botões de download são os elementos mais proeminentes.
- "Descarregar PDF": abre URL de download com header Content-Disposition: attachment.
- "Descarregar DOCX": idem para DOCX.
- Geração é guardada no histórico automaticamente.
- Se plano free: nota discreta abaixo dos botões: "Este documento inclui marca d'água. Actualize o plano para remover."

---

## MÓDULO 5 — PROCESSAMENTO INTELIGENTE DE CAMPOS

Implementa as seguintes funções utilitárias (usadas tanto no cliente como no servidor):

### numberToWords(n: number, currency?: 'AOA' | 'USD'): string
Converte número inteiro para extenso em português angolano.
Exemplos:
- 1 → "um"
- 42 → "quarenta e dois"  
- 1500 → "mil e quinhentos"
- 3500 → "três mil e quinhentos"
- 150000 → "cento e cinquenta mil"
- 1000000 → "um milhão"
Com currency AOA: "três mil e quinhentos kwanzas"
Com currency USD: "três mil e quinhentos dólares americanos"

### dateToExtensoPT(dateStr: string): string
Converte "dd/mm/aaaa" para "D de MesExtenso de AAAA" em português.
Meses: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro.
Exemplo: "12/05/2025" → "12 de Maio de 2025"

### applyGenderConcordance(html: string, gender: 'M' | 'F'): string
Substitui padrões de género no HTML do documento.
Padrões a substituir (case-insensitive):
- "o/a" → "o" (M) ou "a" (F)
- "do/da" → "do" ou "da"
- "ao/à" → "ao" ou "à"
- "pelo/pela" → "pelo" ou "pela"
- "no/na" → "no" ou "na"
- "Senhor(a)" → "Senhor" ou "Senhora"
- "Sr.(a)" → "Sr." ou "Sra."
- "(o/a)" → padrão com parênteses também tratado
- Palavras com padrão "palavra1/palavra2": substituir pela forma correcta

### capitalizeName(name: string): string
Capitaliza nome próprio: primeira letra de cada palavra em maiúsculas, excepto: "de", "da", "do", "dos", "das", "e", "a", "o".
Exemplo: "joão manuel da silva" → "João Manuel da Silva"

### validateBI(bi: string): boolean
Valida formato de BI angolano. Formato aceite: sequência alfanumérica conforme padrão do MININT angolano.

### validateNIF(nif: string): boolean
Valida NIF angolano: numérico, 9 ou 10 dígitos.

---

## MÓDULO 7 — GESTÃO DE IMAGENS E LOGÓTIPOS

### 7A. Extracção de imagens do DOCX

No endpoint `POST /api/upload/docx`, após converter o conteúdo para HTML, extrair todas as imagens:

1. Descompactar o DOCX (ZIP) e aceder à pasta `word/media/`.
2. Para cada ficheiro de imagem:
   - Ler bytes e determinar mimeType via magic bytes (não apenas extensão).
   - Aceitar: PNG, JPG, SVG, GIF (1.º frame), WEBP. Rejeitar BMP e TIFF.
   - Rejeitar ficheiros acima de 5MB com erro `IMAGE_TOO_LARGE`.
   - Ler dimensões em EMU do `document.xml` (atributo `cx`/`cy` do elemento `wp:extent`).
   - Converter EMU → px: `px = emu / 9525` (considerando 96 DPI).
   - Determinar `placement`:
     - Se referenciada em `word/header*.xml` → `{ type: "header", headerType: "default"|"first"|"even" }`
     - Se referenciada em `word/footer*.xml` → `{ type: "footer", ... }`
     - Se `wp:anchor` no document.xml → `{ type: "floating", xPosPt, yPosPt, wrapType }`
     - Caso contrário → `{ type: "inline", paragraphIndex, runIndex }`
   - Guardar imagem em storage com key `images/{minutaId}/{uuid}.{ext}`.
   - Gerar URL assinada com expiração de 24 horas para preview.
3. Detecção automática de logótipo (`isLogo: true`) se qualquer condição for verdadeira:
   - Placement é `header`
   - É a primeira imagem do documento E está num parágrafo antes do parágrafo 3
   - Aspect ratio: `widthPx >= 2 * heightPx` E está no primeiro quarto do documento
4. No HTML gerado, cada imagem é inserida como:
   `<img data-image-id="{uuid}" src="{url_assinada}" style="width:{W}px;height:{H}px;" data-placement='{json}' />`
5. Retornar array `images` na resposta do endpoint (ver especificação 1.4.8).

### 7B. Renderização de imagens no editor

Ao renderizar o documento no editor:

- Imagens inline: renderizar `<img>` no fluxo de texto, na posição correcta, com dimensões originais (escalar se largura > largura do editor, mantendo proporção).
- Cabeçalho: renderizar zona de cabeçalho separada acima do corpo. Fundo `#F9FAFB`, borda inferior `1px #E2E4E7`, label "Cabeçalho" em 11px `#8A919E` no canto superior esquerdo.
- Rodapé: idem abaixo do corpo, label "Rodapé".
- Floating: renderizar em posição aproximada com `position: relative` e indicação visual "Posicionamento fixo no DOCX" ao hover.

Ao passar o rato sobre qualquer imagem no editor, mostrar mini-toolbar com 3 opções:
- "Substituir" → abre selector de ficheiro (aceita PNG, JPG, SVG, WEBP, GIF — máx 5MB)
- "Redimensionar" → activa handles nos 4 cantos; ao largar actualiza widthPx/heightPx proporcionalmente
- "Remover" → remove a imagem do documento (pede confirmação: "Remover esta imagem permanentemente?")

### 7C. Inserção de imagem no editor interno

Botão "Inserir imagem" visível permanentemente na toolbar do editor (não apenas ao seleccionar texto).

Ao clicar, abrir modal com:
- Zona de drag-and-drop / selector de ficheiro (PNG, JPG, SVG, WEBP, GIF — máx 5MB)
- Após selecção do ficheiro: mostrar preview da imagem no modal
- Selector de posição:
  - "No cursor (inline no texto)" — posição actual do cursor
  - "Cabeçalho da página" — zona de cabeçalho
  - "Rodapé da página" — zona de rodapé
- Selector de alinhamento: Esquerda / Centro / Direita
- Selector de largura: Auto / 25% / 50% / 75% / 100% / Valor em px (input numérico)
- Botões: "Cancelar" (ghost) e "Inserir" (primário)

Ao confirmar inserção:
1. Upload do ficheiro para `POST /api/upload/image` → retorna `{ imageId, storageKey, previewUrl, widthPx, heightPx }`.
2. Inserir `<img data-image-id="{imageId}" ...>` na posição escolhida no editor.
3. Criar registo MinutaImage com o placement correspondente à posição escolhida.

### 7D. Painel lateral de imagens

No painel lateral direito (abaixo da lista de campos de texto), secção colapsável:

```
IMAGENS DO DOCUMENTO  ▾
─────────────────────────────────────
🖼  Logótipo           cabeçalho
    logo.png · 240×80px · PNG
    [Substituir]   [Remover]
─────────────────────────────────────
🖼  Imagem inline      pág. 1
    assinatura.png · 120×60px · PNG
    [Substituir]   [Remover]
─────────────────────────────────────
[+ Inserir imagem]
─────────────────────────────────────
```

"Substituir" em qualquer imagem: abre selector de ficheiro. Após upload:
- Mostrar modal: "Manter dimensões originais (240×80px) ou usar dimensões do novo ficheiro (320×90px)?"
- Substituição é gravada na minuta — todas as gerações futuras usarão a nova imagem.

"Inserir imagem" no fundo do painel: abre o mesmo modal de inserção do 7C, com posição pré-seleccionada como "No cursor".

### 7E. Preservação de imagens na geração final

No pipeline de geração do servidor (após substituição de campos de texto), processar imagens:

```
Para cada MinutaImage da minuta:

  1. Determinar qual ficheiro usar:
     - Se existe registo de substituição → usar storage_key da substituição
     - Senão → usar storage_key original da MinutaImage

  2. Se imagem é SVG, GIF ou WEBP → converter para PNG antes de inserir no DOCX
     (usar biblioteca de conversão de imagens no servidor)

  3. SE sourceType === "upload":
     - Localizar o rId da imagem no document.xml original
     - Substituir o ficheiro em word/media/ pelo novo ficheiro
     - Actualizar Content_Types.xml se mimeType mudou
     - Se dimensões mudaram: actualizar cx/cy (EMU) no wp:extent correspondente

  4. SE sourceType === "editor":
     - Para cada imagem com placement.type === "inline":
       Serializar como w:drawing > wp:inline no parágrafo correcto
       Calcular EMU: emu = px * 9525
       Aplicar alinhamento como w:jc no parágrafo pai
     - Para cada imagem com placement.type === "header":
       Inserir em word/header1.xml como w:drawing
     - Para cada imagem com placement.type === "footer":
       Inserir em word/footer1.xml como w:drawing
     - Criar relacionamentos rId em word/_rels/document.xml.rels
     - Registar Content_Types.xml

  5. Garantir que todas as imagens estão em word/media/ antes de reempacotar o DOCX
```

**Regra crítica:** Imagens nunca são campos do formulário. Não aparecem no formulário de preenchimento. São elementos fixos ou substituíveis manualmente no editor da minuta.

### 7F. Endpoint de upload de imagem avulsa

`POST /api/upload/image`

Recebe ficheiro de imagem via multipart/form-data.

Validações:
- Tipo: PNG, JPG, SVG, WEBP, GIF (magic bytes)
- Tamanho: máx 5MB — retornar erro `{ error: "IMAGE_TOO_LARGE", maxBytes: 5242880 }` se exceder

Processamento:
- Guardar em storage com key `images/temp/{userId}/{uuid}.{ext}`
- Calcular dimensões reais em px
- Retornar:
```json
{
  "imageId": "uuid",
  "storageKey": "images/temp/userId/uuid.png",
  "previewUrl": "https://storage.../signed-url-24h",
  "widthPx": 240,
  "heightPx": 80,
  "mimeType": "image/png"
}
```

---

## MÓDULO 6 — CONTROLO DE PLANOS

Middleware de verificação de plano a aplicar antes de:
- Criar minuta: verificar se utilizador não atingiu limite de minutas do plano
- Gerar documento: verificar se utilizador não atingiu limite de gerações (plano free: máx 5)

Quando limite atingido, retornar:
```json
{
  "error": "PLAN_LIMIT_REACHED",
  "limit": 5,
  "current": 5,
  "resource": "generations",
  "upgradeRequired": true,
  "message": "Atingiu o limite do plano gratuito. Actualize para continuar."
}
```

Frontend ao receber este erro: mostrar modal de upgrade com os 3 planos pagos e botão "Ver planos".

---

## REQUISITOS NÃO FUNCIONAIS

- A conversão DOCX → HTML deve concluir em menos de 5 segundos para documentos até 50 páginas.
- O preview em tempo real deve actualizar em menos de 50ms após cada tecla (processamento client-side, sem rede).
- A geração final (DOCX + PDF) deve concluir em menos de 15 segundos para documentos até 20 páginas.
- Os ficheiros gerados devem ser eliminados do storage após 30 dias.
- URLs de download devem ser URLs assinadas com expiração de 1 hora (não expostas publicamente).
- Todos os endpoints autenticados devem verificar que o recurso pertence ao utilizador autenticado (tenant isolation).
- DOCX originais e gerados são guardados em storage privado, nunca em URLs públicas.

---

## O QUE NÃO IMPLEMENTAR NESTE MÓDULO

- Autenticação e gestão de utilizadores (já existe)
- Pagamentos e gestão de subscrições (módulo separado)
- Dashboard e listagem de minutas (já implementado)
- Biblioteca de templates (módulo separado)
- Gestão de equipa (Plano Escritório — módulo separado)
```

---

*Fim do documento.*  
*Versão 1.1 — Minha Minuta — Especificações do Motor de Geração de Documentos*
