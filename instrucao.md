# Minha Minuta — Guia de Design e Fluxo de Produto

> Documento de referência para desenvolvimento front-end e UX.  
> Este guia não prescreve tecnologias. Foca exclusivamente em design visual, hierarquia, comportamento de interface e fluxo de utilizador.

---

## Índice

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Sistema Visual](#2-sistema-visual)
3. [Layout e Estrutura Global](#3-layout-e-estrutura-global)
4. [Componentes Base](#4-componentes-base)
5. [Páginas Públicas](#5-páginas-públicas)
6. [Autenticação](#6-autenticação)
7. [Dashboard Principal](#7-dashboard-principal)
8. [Fluxo — Criar Minuta](#8-fluxo--criar-minuta)
9. [Fluxo — Gerar Documento](#9-fluxo--gerar-documento)
10. [Biblioteca de Templates](#10-biblioteca-de-templates)
11. [Gestão de Conta e Planos](#11-gestão-de-conta-e-planos)
12. [Estado Vazio, Erros e Feedback](#12-estado-vazio-erros-e-feedback)
13. [Versão Móvel](#13-versão-móvel)
14. [Tom de Linguagem](#14-tom-de-linguagem)

---

## 1. Filosofia de Design

### Referência visual

O produto deve assemelhar-se a software empresarial de alta qualidade — pense em interfaces como o Notion, Linear, ou painéis administrativos de ERPs modernos. Não é uma app de consumo, não é um site de marketing. É uma **ferramenta de trabalho**.

O utilizador angolano que abre a Minha Minuta está a trabalhar. Ele não quer entretenimento. Quer eficiência, clareza e confiança.

### Princípios inegociáveis

**1. Sem decoração desnecessária.**  
Nenhum elemento existe apenas para "ficar bonito". Cada pixel tem função. Se um elemento pode ser removido sem perda de informação ou usabilidade, deve ser removido.

**2. Densidade intencional.**  
O interface deve ter densidade de informação similar a ferramentas profissionais — não ao estilo marketing de "muito espaço vazio". Espaçamento generoso onde necessário, mas sem páginas semi-vazias que parecem inacabadas.

**3. Tipografia como hierarquia.**  
A tipografia é o principal instrumento de organização visual. Tamanho, peso e cor de texto comunicam importância — não ícones exagerados, não caixas coloridas sem sentido.

**4. Zero infantilização.**  
Sem ícones emoji, sem ilustrações de personagens, sem textos do tipo "Uau! Criou a sua primeira minuta! 🎉". O produto trata o utilizador como profissional.

**5. Consistência acima de criatividade.**  
Cada página deve parecer parte do mesmo produto. Paddings, alturas de linha, cores de borda — tudo definido por um sistema e nunca improvisado.

---

## 2. Sistema Visual

### 2.1 Paleta de Cores

A paleta é reduzida e funcional. Muito poucos tons, usados com disciplina.

```
Cores Primárias
───────────────
Azul Institucional   #1E3A5F   →  Cor principal. Cabeçalhos, botões primários, links activos.
Branco               #FFFFFF   →  Fundo de superfícies de conteúdo.
Cinzento Fundo       #F5F6F7   →  Fundo global da aplicação (levemente off-white).

Cores de Interface
──────────────────
Cinzento Linha       #E2E4E7   →  Divisores, bordas de tabelas, contornos de inputs.
Cinzento Texto Leve  #8A919E   →  Labels, texto secundário, placeholders.
Cinzento Texto Meio  #4B5462   →  Texto de suporte, descrições.
Preto Texto          #1A1D23   →  Texto principal.

Cores Funcionais
────────────────
Verde Estado         #1A6B3C   →  Sucesso, documentos gerados, estados activos.
Vermelho Estado      #B91C1C   →  Erros, alertas críticos.
Amarelo Aviso        #92400E   →  Avisos, limites próximos (fundo #FFFBEB).
Azul Info            #1E40AF   →  Informação, tooltips, badges de plano.
```

**Regras de uso de cor:**
- Nunca usar degradê. Cores sempre sólidas.
- O azul institucional (#1E3A5F) é usado com parcimónia — botão primário, sidebar activa, headers de tabela. Não em fundos de secções inteiras.
- Fundo da aplicação é sempre #F5F6F7. Superfícies (cards, painéis, tabelas) são #FFFFFF.
- Nunca usar mais de 3 cores distintas numa única vista.

### 2.2 Tipografia

**Tipo de letra:** Uma única família tipográfica com múltiplos pesos. Escolher uma fonte com carácter profissional — algo com personalidade discreta mas não genérica. Boa legibilidade em tamanhos pequenos é obrigatória.

**Escala tipográfica:**

```
Nível         Tamanho   Peso    Uso
─────────────────────────────────────────────────────────────
Display        22px      700    Títulos de página (h1)
Título         17px      600    Subtítulos de secção, cabeçalhos de modal
Subtítulo      14px      600    Labels de grupo, cabeçalhos de coluna
Corpo          14px      400    Texto corrente, conteúdo de campos
Suporte        13px      400    Descrições, texto secundário
Label          12px      500    Badges, tags, estados
Micro          11px      400    Notas de rodapé, timestamps, metadata
```

**Regras tipográficas:**
- Nunca usar peso abaixo de 400.
- Nunca usar tamanho abaixo de 11px.
- Altura de linha para texto corrente: 1.5.
- Altura de linha para títulos: 1.2.
- Nenhum texto em maiúsculas inteiras, excepto em labels de estado (badges) com no máximo 3 palavras.

### 2.3 Espaçamento

Sistema baseado em múltiplos de 4px:

```
4px   →  Espaçamento interno mínimo (dentro de badges)
8px   →  Padding de elementos compactos (tags, chips)
12px  →  Padding de inputs e células de tabela
16px  →  Padding interno de cards e painéis
20px  →  Gap entre elementos de formulário
24px  →  Padding lateral de secções
32px  →  Separação entre grupos de conteúdo
48px  →  Separação entre secções maiores
```

### 2.4 Bordas e Cantos

```
Border padrão:      1px solid #E2E4E7
Border de foco:     1px solid #1E3A5F  (inputs em foco)
Border de erro:     1px solid #B91C1C

Border-radius:      0px para tabelas, painéis, modais grandes
                    2px para inputs, botões, cards de lista
                    4px para badges e tags pequenas
```

**Regra fundamental:** Nada com border-radius acima de 4px. O produto não é uma app de bem-estar. É uma ferramenta profissional.

### 2.5 Sombras

Uso mínimo e funcional de sombras:

```
Sombra de painel flutuante (dropdowns, modais):
  box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)

Sombra de elemento em hover (linha de tabela, card):
  box-shadow: 0 1px 3px rgba(0,0,0,0.08)
```

Nunca usar sombras coloridas, sombras difusas exageradas, ou múltiplas camadas de sombra.

### 2.6 Ícones

- Usar um conjunto de ícones de linha fina e consistente (stroke, não filled).
- Tamanho fixo: 16px em contextos de texto, 20px em botões e acções.
- Cor: sempre herdada do texto pai ou #8A919E — nunca coloridos.
- **Nenhum ícone decorativo.** Ícones apenas onde substituem texto que seria redundante ou onde o espaço não comporta etiqueta.
- Proibido: ícones emoji, ícones preenchidos a cores vivas, ícones com bordas ou fundos.

---

## 3. Layout e Estrutura Global

### 3.1 Shell da Aplicação

A aplicação autenticada tem estrutura fixa de 3 zonas:

```
┌──────────────────────────────────────────────────────┐
│  TOPBAR  (altura: 48px, fundo: #1E3A5F)              │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│   SIDEBAR    │         ÁREA DE CONTEÚDO              │
│  (220px)     │                                       │
│              │                                       │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
```

**Topbar:**
- Fundo #1E3A5F. Altura exacta de 48px.
- Lado esquerdo: logótipo (texto "Minha Minuta" em branco, peso 600).
- Lado direito: nome do utilizador + plano actual (badge compacto) + botão de perfil (texto simples, sem avatar circular).
- Nenhum outro elemento. Sem barra de pesquisa global no topo, sem notificações com badges numéricos.

**Sidebar:**
- Fundo #FFFFFF. Borda direita 1px #E2E4E7. Largura fixa 220px.
- Navegação em lista vertical simples.
- Item activo: fundo #EEF2F8, texto #1E3A5F, barra vertical esquerda de 2px #1E3A5F.
- Item inactivo: texto #4B5462, sem fundo.
- Hover: fundo #F5F6F7.
- Altura de cada item: 36px. Padding horizontal: 16px.
- Separadores entre grupos de items: linha 1px #E2E4E7 com label de grupo em 11px maiúsculas #8A919E.
- Na base da sidebar: indicador do plano actual + link "Melhorar plano" apenas se estiver em plano gratuito ou essencial.

**Área de Conteúdo:**
- Fundo #F5F6F7.
- Padding interior: 24px em todos os lados.
- Largura máxima de conteúdo: 1100px, centrado.

### 3.2 Estrutura de Página

Cada página dentro da aplicação segue esta estrutura:

```
┌────────────────────────────────────┐
│ PAGE HEADER                        │
│  Título (22px, 700)                │
│  Descrição opcional (14px, #4B5462)│
│  Acção primária (botão, lado dir.) │
├────────────────────────────────────┤
│                                    │
│  CONTEÚDO DA PÁGINA                │
│                                    │
└────────────────────────────────────┘
```

O page header tem 48px de altura mínima, padding-bottom de 16px, borda inferior 1px #E2E4E7.

---

## 4. Componentes Base

### 4.1 Botões

**Primário:**
- Fundo #1E3A5F, texto branco, 14px, peso 500.
- Padding: 0 16px, altura 34px.
- Border-radius: 2px.
- Hover: fundo #16304F (15% mais escuro).
- Active: fundo #0F2340.
- Disabled: fundo #E2E4E7, texto #8A919E.

**Secundário:**
- Fundo #FFFFFF, borda 1px #E2E4E7, texto #1A1D23, 14px, peso 500.
- Mesmas dimensões do primário.
- Hover: fundo #F5F6F7.

**Destrutivo:**
- Fundo #FFFFFF, borda 1px #B91C1C, texto #B91C1C.
- Hover: fundo #FEF2F2.

**Ghost / Link:**
- Sem fundo, sem borda. Texto #1E3A5F, 14px.
- Underline apenas em hover.

**Regras de botões:**
- Nunca usar botões com ícone centrado sem texto em acções importantes.
- Nunca mais de 1 botão primário por vista.
- Grupos de botões: botão primário sempre à direita.

### 4.2 Inputs e Campos de Formulário

```
Label:      12px, peso 500, #1A1D23, margin-bottom 4px
Input:      altura 34px, borda 1px #E2E4E7, padding 0 10px,
            fundo #FFFFFF, texto #1A1D23, 14px
Foco:       borda #1E3A5F, sem outline externo, sem sombra colorida
Erro:       borda #B91C1C + mensagem de erro 12px #B91C1C abaixo
Disabled:   fundo #F5F6F7, texto #8A919E
Placeholder: #8A919E
```

**Select (dropdown):**  
Igual ao input, com indicador de seta à direita (ícone simples, não estilizado). O dropdown abre como painel com sombra padrão, itens de 34px de altura.

**Textarea:**  
Borda idêntica ao input. Resize apenas vertical. Mínimo 80px de altura.

**Checkbox e Radio:**  
Tamanho 14px. Estilo nativo com override mínimo: borda #E2E4E7, quando marcado fundo #1E3A5F. Sem animações.

### 4.3 Tabelas

Tabelas são o componente central da aplicação — usadas na listagem de minutas, histórico de documentos, gestão de utilizadores.

```
Estrutura:
─ Header: fundo #F5F6F7, texto 12px peso 600 #4B5462, maiúsculas
─ Linhas: fundo #FFFFFF, borda-inferior 1px #E2E4E7, altura 44px
─ Hover de linha: fundo #F9FAFB
─ Padding de célula: 0 12px
─ Primeira coluna: texto peso 500 #1A1D23 (nome/título)
─ Colunas secundárias: texto peso 400 #4B5462
─ Coluna de acções: sempre a última, alinhada à direita
```

Acções em linha: mostrar apenas no hover da linha, em texto simples separados por "|" ou como botões ghost compactos. Nunca botões cheios dentro de linhas de tabela.

### 4.4 Badges e Estados

```
Estado       Texto          Fundo       Borda
─────────────────────────────────────────────────
Activo       #1A6B3C        #F0FDF4     #BBF7D0
Rascunho     #4B5462        #F5F6F7     #E2E4E7
Gerado       #1E40AF        #EFF6FF     #BFDBFE
Arquivado    #8A919E        #F5F6F7     #E2E4E7
Erro         #B91C1C        #FEF2F2     #FECACA
```

Badges: padding 2px 8px, 11px, peso 500, border-radius 2px. Texto sempre em maiúsculas.

### 4.5 Modais

```
Overlay:   rgba(0,0,0,0.4)
Painel:    fundo #FFFFFF, largura max 560px, border-radius 2px
           sombra: 0 4px 24px rgba(0,0,0,0.15)
Header:    padding 20px 24px, borda inferior 1px #E2E4E7
           título 17px peso 600, botão fechar (×) à direita
Body:      padding 24px
Footer:    padding 16px 24px, borda superior 1px #E2E4E7
           botões alinhados à direita
```

Sem animações de entrada complexas. Fade simples de 150ms.

### 4.6 Notificações Toast

Aparecem no canto inferior direito.  
- Largura 320px, padding 12px 16px.
- Borda esquerda de 3px na cor do estado (verde/vermelho/amarelo).
- Fundo #FFFFFF, sombra padrão.
- Desaparecem após 4 segundos sem interacção.
- Texto conciso: máximo 2 linhas.

---

## 5. Páginas Públicas

### 5.1 Landing Page

A landing page não é um site de marketing exuberante. É uma página de produto — directa, densa de informação útil.

**Estrutura:**

```
HEADER FIXO
─ Logo à esquerda (texto, não imagem)
─ Links de navegação: Funcionalidades · Preços · Entrar
─ Botão "Começar grátis" (primário, compacto)
─ Fundo #FFFFFF, borda inferior 1px #E2E4E7

HERO
─ Fundo #F5F6F7, padding vertical 72px
─ Layout duas colunas: texto à esquerda, screenshot/mockup à direita
─ Título: máximo 2 linhas, 36px, peso 700
─ Subtítulo: 17px, #4B5462, máximo 3 linhas
─ CTA: "Começar grátis" (primário) + "Ver exemplo" (ghost)
─ Sob os CTAs: linha discreta — "Sem cartão de crédito · Grátis para sempre"

BARRA DE LOGOS/PROVA SOCIAL
─ Linha simples: "Usado por advogados, escritórios e empresas em Angola"
─ Nomes de categorias profissionais em texto, sem logos de empresas

FUNCIONALIDADES
─ 3 colunas, fundo branco
─ Cada coluna: título 17px, descrição 14px
─ Sem ícones grandes. Apenas um número ou símbolo textual à esquerda do título.

COMO FUNCIONA
─ 3 passos numerados em linha
─ Numeração grande (48px, #E2E4E7) como elemento visual
─ Cada passo: título + descrição curta + screenshot pequeno

PREÇOS
─ 3 colunas (Essencial / Profissional / Escritório) + coluna de comparação
─ Design de tabela, não de "cards de plano" com sombras
─ Destaque no plano Profissional: borda superior 2px #1E3A5F

FOOTER
─ Simples. 2 colunas: links e contacto.
─ Fundo #1A1D23, texto #8A919E
```

---

## 6. Autenticação

### 6.1 Registo e Login

Layout centrado, painel branco de largura fixa (420px) sobre fundo #F5F6F7.

```
┌─────────────────────────────────┐
│  Logo (texto, centrado)         │
│                                 │
│  "Entrar na sua conta"          │
│  (17px, peso 600)               │
│                                 │
│  [Campo: Email]                 │
│  [Campo: Password]              │
│                                 │
│  [Botão primário: Entrar]       │
│                                 │
│  Esqueceu a password?           │
│  ─────────────────────────      │
│  Não tem conta? Registar-se     │
└─────────────────────────────────┘
```

**Regras:**
- Sem ilustrações, sem frases motivacionais, sem fundo decorativo.
- Validação inline: ao sair do campo (blur), não ao digitar.
- Após login: redirecionar para Dashboard.
- Mensagens de erro: texto simples abaixo do campo em questão. Nunca banner vermelho no topo da página.

### 6.2 Registo

Campos: Nome completo · Email · Password · Confirmação de password.  
Um único passo — sem wizard de onboarding no registo.  
Após registo: mostrar modal de boas-vindas simples (sem animações) com 2 opções: "Criar primeira minuta" ou "Ver templates".

---

## 7. Dashboard Principal

### 7.1 Visão Geral

O dashboard é a primeira coisa que o utilizador vê após login. Deve comunicar em 2 segundos: o que ele tem, o que pode fazer.

**Layout:**

```
PAGE HEADER
"Dashboard"   [Botão: Nova Minuta]

┌──────────────────────────────────────────────────┐
│  MÉTRICAS RÁPIDAS (linha de 4 blocos)            │
│  Minutas criadas | Documentos gerados |          │
│  Este mês | Último documento gerado              │
└──────────────────────────────────────────────────┘

┌──────────────────┐  ┌───────────────────────────┐
│  MINUTAS         │  │  ACTIVIDADE RECENTE        │
│  RECENTES        │  │  (últimos documentos       │
│  (últimas 5)     │  │  gerados, lista simples)   │
│                  │  │                            │
└──────────────────┘  └───────────────────────────┘
```

**Blocos de métricas:**
- Fundo #FFFFFF, borda 1px #E2E4E7.
- Número grande (28px, peso 700, #1A1D23).
- Label abaixo (12px, #8A919E).
- Sem ícones coloridos, sem variações de cor por bloco.

**Minutas recentes:**
- Lista simples, não cards. Cada item: nome da minuta + data de criação + badge de estado + link "Gerar documento".
- Rodapé da secção: link "Ver todas as minutas →"

**Actividade recente:**
- Lista cronológica. Cada item: nome do documento gerado + minuta de origem + data + links "Download PDF" e "Download DOCX".

### 7.2 Estado Vazio (Novo Utilizador)

Quando não há minutas criadas, o dashboard mostra uma única mensagem central:

```
Ainda não tem minutas.

Pode começar por um template pronto ou criar a sua própria minuta.

[Explorar templates]   [Criar minuta]
```

Sem ilustrações. Sem personagem. Sem confetti.

---

## 8. Fluxo — Criar Minuta

Este é o fluxo mais crítico do produto. Deve ser simples, sem passos desnecessários.

### 8.1 Passo 1 — Origem do Conteúdo

Após clicar "Nova Minuta", abre modal com duas opções apresentadas como escolha binária limpa:

```
┌──────────────────────────────────────────┐
│  Como quer começar?                      │
│                                          │
│  ┌─────────────────┐ ┌────────────────┐  │
│  │                 │ │                │  │
│  │  Escrever       │ │  Fazer upload  │  │
│  │  do zero        │ │  de DOCX       │  │
│  │                 │ │                │  │
│  └─────────────────┘ └────────────────┘  │
│                                          │
│  Ou escolher um template da biblioteca   │
└──────────────────────────────────────────┘
```

As duas opções principais: blocos lado a lado, borda 1px #E2E4E7, sem fundo colorido, texto centrado. Hover: borda #1E3A5F.

### 8.2 Passo 2a — Editor de Texto

Se o utilizador escolheu "escrever do zero":

- Editor de texto limpo, sem barra de ferramentas complexa.
- Ferramentas disponíveis: negrito, itálico, alinhamento, lista, separador. Nada mais.
- A barra de ferramentas aparece apenas ao seleccionar texto (toolbar flutuante), não está sempre visível.
- Fundo do editor: #FFFFFF, borda 1px #E2E4E7, padding 24px.
- Área de escrita sem distrações.

### 8.2 Passo 2b — Upload de DOCX

Se o utilizador escolheu upload:

- Área de drop grande, estilo drag-and-drop: borda 1px dashed #E2E4E7, texto centrado, fundo #F5F6F7.
- Após upload: documento é renderizado no editor, pronto para edição.
- Nenhum passo intermédio de "processando...". Se o processamento demora, mostrar apenas uma barra de progresso linear discreta.

### 8.3 Passo 3 — Definição de Campos Editáveis

Esta é a etapa de maior complexidade técnica e deve ter o design mais cuidado.

**Layout:**

```
┌────────────────────────┬──────────────────────┐
│                        │  CAMPOS DEFINIDOS    │
│   DOCUMENTO            │  ──────────────────  │
│   (renderizado)        │  Lista dos campos    │
│                        │  criados até agora   │
│   Selecciona texto     │                      │
│   → painel lateral     │  [+ Adicionar campo] │
│   activa               │                      │
└────────────────────────┴──────────────────────┘
```

**Comportamento:**

1. Utilizador selecciona um trecho de texto no documento (como faria num processador de texto).
2. Aparece um tooltip compacto imediatamente acima da selecção com o botão "Definir como campo" — 1 único botão, nada mais.
3. Ao clicar: abre painel lateral direito com:
   - Campo: "Nome do campo" (ex: "Nome do Cliente")
   - Dropdown: "Tipo de campo" (Nome, Data, BI, NIF, Valor, Género, Número por extenso, Texto livre)
   - Checkbox: "Campo obrigatório"
   - Botão "Guardar campo"
4. O trecho seleccionado fica marcado no documento com fundo #EEF2F8 e uma pequena etiqueta com o nome do campo.
5. Ao passar o rato sobre uma marcação existente: tooltip com o nome do campo + botão de remover (×).

**Lista de campos definidos (painel direito):**
- Lista simples com nome do campo, tipo e ícone de remoção.
- Drag para reordenar a ordem de aparecimento no formulário futuro.
- Nenhuma cor excessiva. Fundo #F5F6F7, itens com borda #E2E4E7.

### 8.4 Passo 4 — Guardar Minuta

Após definir os campos, painel inferior fixo aparece:

```
[Nome da minuta: ________________]   [Pasta: ──▼]   [Guardar minuta]
```

- Campo de nome inline, sem modal separado.
- Selector de pasta simples (dropdown).
- Ao clicar "Guardar minuta": feedback imediato via toast verde no canto inferior direito.
- Redireccionamento para a página da minuta criada.

---

## 9. Fluxo — Gerar Documento

### 9.1 Acesso

A partir de qualquer lista de minutas, cada linha tem o link "Gerar documento" visível em hover.  
Ou a partir do botão "Gerar" dentro da página de detalhe da minuta.

### 9.2 Formulário de Geração

Abre em página dedicada (não modal — o formulário pode ser longo):

```
PAGE HEADER
← Voltar   "Gerar documento — [Nome da Minuta]"

┌──────────────────────────────────────────────┐
│  Preencha os campos abaixo                   │
│                                              │
│  Nome do Cliente *                           │
│  [________________________]                  │
│                                              │
│  Número do BI *                              │
│  [________________________]                  │
│                                              │
│  Data do Contrato *                          │
│  [  dd / mm / aaaa  ]                        │
│                                              │
│  Valor do Contrato *                         │
│  [_______] AOA   → "Três mil kwanzas"       │
│                                              │
│  …                                           │
│                                              │
│  [Cancelar]              [Gerar Documento]   │
└──────────────────────────────────────────────┘
```

**Campos inteligentes — comportamento visual:**

- **Data:** input de texto com máscara dd/mm/aaaa. Ao preencher, mostra abaixo em cinzento: "12 de Maio de 2025". Sem calendário popup (complexidade desnecessária em mobile).
- **Valor:** campo numérico. Ao preencher, mostra abaixo: "Três mil e quinhentos kwanzas" (conversão automática, em tempo real).
- **Género:** dropdown compacto: "Masculino / Feminino". O sistema aplica as formas correctas no documento automaticamente.
- **BI:** campo de texto com validação de formato ao sair do campo.
- **NIF:** idem.

### 9.3 Geração e Download

Após clicar "Gerar Documento":

1. Botão muda para estado "A gerar..." com indicador de carregamento linear simples.
2. Em menos de 5 segundos (idealmente): aparece painel de resultado.

```
┌──────────────────────────────────────────────┐
│  Documento gerado com sucesso.               │
│                                              │
│  [Descarregar PDF]   [Descarregar DOCX]      │
│                                              │
│  ─────────────────────────────────────────   │
│  Gerar outro com esta minuta                │
│  Voltar ao dashboard                        │
└──────────────────────────────────────────────┘
```

- Os dois botões de download são os elementos mais visíveis desta vista.
- O documento é imediatamente guardado no histórico.
- Se o utilizador está no plano gratuito: mostrar nota discreta: "Este documento inclui marca d'água. Actualize para remover."

---

## 10. Biblioteca de Templates

### 10.1 Layout

```
PAGE HEADER
"Templates"
"Comece por um dos nossos documentos pré-configurados."

┌─────────────────────────────────────────────────┐
│  FILTROS:  Todos · Jurídico · RH · Comercial ·  │
│            Imobiliário · Financeiro              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TABELA DE TEMPLATES                            │
│  Nome · Categoria · Campos · Acção              │
│  ───────────────────────────────────────────    │
│  Contrato de Trabalho   RH   8 campos   Usar    │
│  Procuração             Jur  5 campos   Usar    │
│  Contrato Arrendamento  Imob 10 campos  Usar    │
│  …                                              │
└─────────────────────────────────────────────────┘
```

Os templates são apresentados em tabela, não em grid de cards. É uma lista de trabalho, não uma montra.

**Ao clicar "Usar":**  
Modal de confirmação compacto: "Usar este template como base?" + opções "Usar directamente" (ir directo ao formulário de geração) e "Editar antes de usar" (abrir no editor de minutas).

---

## 11. Gestão de Conta e Planos

### 11.1 Página de Conta

Acessível via sidebar ou menu de utilizador no topo.

Estrutura em separadores:

```
Perfil  |  Plano e Faturação  |  Segurança  |  Equipa (só Escritório)
```

**Separador Perfil:**  
Formulário simples: nome, email, empresa. Botão guardar.

**Separador Plano e Faturação:**

```
Plano actual: PROFISSIONAL
Renovação: 14 de Junho de 2025
Minutas usadas: 34 / 100

[Mudar plano]   [Cancelar subscrição]

─────────────────────────────────────
Histórico de pagamentos (tabela)
Data | Plano | Valor | Estado | Recibo
```

**Página de Upgrade:**  
Tabela comparativa dos planos. Sem cards com sombras exageradas. O plano actual marcado com borda #1E3A5F. Botão de upgrade claro em cada coluna.

### 11.2 Separador Equipa (Plano Escritório)

Tabela de utilizadores:

```
Nome | Email | Função | Estado | Acções
─────────────────────────────────────────
Ana Luísa   ana@emp.ao   Editor   Activo   Remover
Carlos M.   cm@emp.ao    Leitor   Pendente Reenviar convite
```

Botão "Convidar utilizador" abre modal simples com campo de email e selector de função.

---

## 12. Estado Vazio, Erros e Feedback

### Estados Vazios

Cada lista que pode estar vazia deve ter um estado vazio específico:

```
Minutas: "Ainda não criou nenhuma minuta. [Criar minuta]"
Histórico: "Nenhum documento gerado ainda. [Ver minutas]"
Resultados de pesquisa: "Nenhum resultado para '[termo]'."
```

Regra: mensagem em 1-2 linhas + 1 link/botão de acção. Sem ilustrações.

### Erros de Formulário

- Mostrar erros abaixo de cada campo específico (não banner global).
- Texto 12px, cor #B91C1C.
- Mensagens directas: "Este campo é obrigatório." / "Formato de BI inválido." / "Email já registado."

### Erros de Sistema

Para erros inesperados (falha de rede, erro de servidor):  
Toast vermelho no canto inferior direito: "Ocorreu um erro. Tente novamente." com botão "Tentar novamente" quando aplicável.

### Confirmações Destrutivas

Antes de eliminar uma minuta ou revogar acesso: modal de confirmação simples.

```
"Eliminar esta minuta?"
"Esta acção não pode ser revertida. Os documentos já gerados não serão afectados."

[Cancelar]   [Eliminar]
```

O botão "Eliminar" é destrutivo (borda vermelha, texto vermelho) — não preenchido a vermelho.

---

## 13. Versão Móvel

### Princípios

- A aplicação funciona em mobile mas a experiência prioritária é desktop/tablet.
- Em mobile: sidebar colapsa em menu hambúrguer no topo.
- Tabelas transformam-se em listas de cards verticais em viewports abaixo de 768px.
- O editor de minutas em mobile é simplificado: sem painel lateral, os campos são definidos num passo separado após o conteúdo.

### Fluxo móvel simplificado para Criar Minuta:

1. Tap "Nova Minuta" → escolha de origem (ecrã simples, dois botões empilhados)
2. Editor de texto (ecrã completo, sem painéis laterais)
3. Tap "Definir campos" → lista de trechos do texto onde pode marcar campos (scroll)
4. Nomear e guardar

### Fluxo móvel para Gerar Documento:

1. Escolher minuta (lista)
2. Formulário vertical (campos empilhados, inputs de altura generosa para touch)
3. Botão "Gerar" fixo na base do ecrã
4. Ecrã de resultado com botões de download proeminentes

---

## 14. Tom de Linguagem

### Princípios

- Português europeu formal, adaptado ao contexto angolano.
- Directo e funcional. Sem gíria, sem entusiasmo forçado.
- Tratar sempre o utilizador por "você" (não "tu", não "o utilizador").

### Exemplos de linguagem correcta

| ❌ Evitar | ✅ Usar |
|---|---|
| "Uau! A sua minuta foi criada! 🎉" | "Minuta guardada com sucesso." |
| "Ops! Algo correu mal 😅" | "Erro ao guardar. Tente novamente." |
| "Ainda não tem nenhum documento. Comece a sua jornada!" | "Ainda não gerou nenhum documento." |
| "Actualize já e desbloqueie superpoderes!" | "Este recurso está disponível no Plano Profissional." |
| "Carregue o seu ficheiro aqui ✨" | "Faça o upload do ficheiro DOCX." |

### Microcópia de interface

- Botões: verbos de acção no imperativo — "Guardar", "Gerar", "Cancelar", "Entrar", "Continuar".
- Labels de campos: substantivos directos — "Nome completo", "Data do contrato", "Valor".
- Mensagens de estado: frase completa, terminada com ponto final.
- Tooltips: frases curtas sem ponto final — "Campos editáveis nesta minuta".

---

*Fim do documento.*  
*Versão 1.0 — Minha Minuta — Guia de Design e Fluxo*
