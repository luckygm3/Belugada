---
name: Belugada
description: Consultoria trabalhista especializada com geração automática de documentos
colors:
  ink: "#171717"
  action-black: "#000000"
  paper-white: "#ffffff"
  section-mist: "#f9fafb"
  border-quiet: "#e5e7eb"
  text-support: "#4b5563"
  text-faint: "#9ca3af"
  error-red: "#dc2626"
  success-green: "#16a34a"
  link-blue: "#2563eb"
  variable-indigo-bg: "#e0e7ff"
  variable-indigo-ink: "#4338ca"
typography:
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.action-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip-variable:
    backgroundColor: "{colors.variable-indigo-bg}"
    textColor: "{colors.variable-indigo-ink}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
---

# Design System: Belugada

## 1. Overview

**Creative North Star: "A Máquina Discreta"**

O Belugada é automação que trabalha em silêncio. A interface não é a estrela — o documento gerado é. Cada tela existe para que a consultora ou o RH da empresa-cliente complete a tarefa e saia com o documento em mãos; o sistema some atrás da eficiência. Isso se traduz num visual monocromático e plano: preto sobre branco, bordas de 1px, nenhuma sombra em repouso, cor apenas quando comunica estado (erro, sucesso, variável de template).

O sistema rejeita explicitamente as três armadilhas do segmento (herdadas do PRODUCT.md): o site de advocacia antigo (serifão dourado, martelo e balança), o SaaS genérico (gradientes roxos, ilustrações 3D) e o corporativo frio (azul-marinho bancário, stock photos de aperto de mão). A seriedade vem do rigor e da contenção, não de ornamento jurídico.

Os componentes são **refinados e contidos**: transições delicadas, pesos comedidos, atenção nos detalhes — a elegância discreta de papelaria fina, não a firmeza de um martelo.

**Key Characteristics:**
- Monocromático funcional: preto, branco e cinzas; cor só para estado
- Plano por padrão: profundidade por borda e tom, não por sombra
- O documento é o protagonista; a interface é a moldura
- Formulários em etapas curtas com validação específica por campo
- Dark mode de primeira classe nos painéis (variantes `dark:` em todo componente)

## 2. Colors

Paleta monocromática de trabalho onde a cor é reservada para significado: estado de validação, link, ou chip de variável.

### Primary
- **Action Black** (#000000): a cor de ação. Todo botão primário é preto sólido com texto branco. A raridade de qualquer outra cor forte faz do preto a autoridade da página.
- **Ink** (#171717): texto principal sobre fundo claro. Quase-preto que evita o contraste duro do #000 em blocos longos de leitura.

### Neutral
- **Paper White** (#ffffff): fundo de cards, formulários e superfícies de conteúdo.
- **Section Mist** (#f9fafb): fundo alternado de seções na landing (`gray-50`), cria ritmo sem introduzir cor.
- **Border Quiet** (#e5e7eb): bordas de 1px em cards, inputs e divisores — a única fonte de profundidade em repouso.
- **Text Support** (#4b5563): texto secundário e descrições (`gray-600`).
- **Text Faint** (#9ca3af): placeholders e estados vazios (`gray-400`). Nunca usar para texto de corpo — falha o contraste AA.

### Tertiary (cores de estado — só quando comunicam)
- **Error Red** (#dc2626): mensagens de validação e ações destrutivas.
- **Success Green** (#16a34a): confirmação de validação (CPF/CNPJ válido, "Salvo com sucesso").
- **Link Blue** (#2563eb): links de ação inline ("Baixar").
- **Variable Indigo** (#e0e7ff fundo / #4338ca texto): exclusivo dos chips de variável `[[campo]]` no editor de templates — a assinatura visual do produto.

### Named Rules
**A Regra do Preto Solitário.** O preto é a única cor de ação. Se um segundo botão na mesma tela também for preto sólido, um dos dois está errado — o secundário usa borda com fundo branco.

**A Regra do Estado.** Vermelho, verde, azul e índigo aparecem somente quando comunicam estado ou função. Cor decorativa é proibida.

## 3. Typography

**Display Font:** Arial (com Helvetica, sans-serif de fallback)
**Body Font:** Arial (mesma família em pesos variados)

**Character:** Uma família única e neutra em dois pesos (400/700) — a tipografia não opina, organiza. *Nota de implementação: Geist Sans/Mono estão declaradas em `layout.tsx` mas nunca aplicadas ao `<body>`; o corpo renderiza Arial via `globals.css`. Decidir entre ativar Geist ou assumir Arial é uma pendência aberta de design.*

### Hierarchy
- **Headline** (700, clamp(2.25rem, 5vw, 3rem), 1.15): hero da landing. Uma por página.
- **Title** (700, 1.5rem, 1.3): título de página nos painéis (`text-2xl font-bold`).
- **Section** (600, 1rem, 1.4): título de card/seção (`font-semibold`).
- **Body** (400, 1rem, 1.6): texto corrente. Máximo de 72ch por linha.
- **Label** (500, 0.875rem, 1.4): labels de formulário (`text-sm font-medium`), sempre acima do input.

### Named Rules
**A Regra do Peso.** Hierarquia se faz com peso e tamanho, nunca com cor ou itálico. Se um texto precisa se destacar, ele fica bold — não colorido.

## 4. Elevation

Plano por padrão. Superfícies em repouso são planas, separadas por bordas de 1px (**Border Quiet**) e alternância de tom de fundo (branco sobre mist). Sombras não existem em repouso; aparecem apenas como resposta a estado — modal aberto, dropdown flutuante — e mesmo então discretas e difusas.

### Named Rules
**A Regra da Borda.** Se dois elementos precisam se separar, a resposta é uma borda de 1px ou espaço — nunca uma sombra.

## 5. Components

Refinados e contidos: cada componente faz o mínimo visual necessário e responde com transições delicadas.

### Buttons
- **Shape:** cantos suavemente arredondados (6px)
- **Primary:** preto sólido (#000), texto branco, padding 8px 16px (`px-4 py-2`), texto em peso normal
- **Secondary:** fundo branco, borda 1px Border Quiet, texto Ink
- **Hover / Focus:** transição de opacidade/fundo suave (150–200ms ease-out); foco visível com anel de contraste
- **Disabled:** opacidade 50%, cursor padrão — usado extensivamente durante estados `carregando`
- **Loading:** o texto do botão muda para o gerúndio ("Salvando...", "Buscando...", "Cadastrando...") — nunca spinner sozinho

### Cards / Containers
- **Corner Style:** 8px (`rounded-lg`)
- **Background:** Paper White; `dark:bg-gray-800` no dark mode
- **Shadow Strategy:** nenhuma (ver Elevation)
- **Border:** 1px Border Quiet; `dark:border-gray-700`
- **Internal Padding:** 24px (`p-6`)

### Inputs / Fields
- **Style:** borda 1px, fundo branco, 6px de raio, padding 8px 12px (`px-3 py-2`)
- **Label:** sempre acima, 0.875rem peso 500
- **Focus:** anel/borda de foco padrão do navegador reforçado — nunca remover outline sem substituto
- **Error:** mensagem específica por campo abaixo do input, texto Error Red 0.75rem; o erro geral aparece no topo do formulário
- **Validação ao vivo:** CPF/CNPJ validam com debounce de 400ms e feedback ✅/❌ imediato

### Chips (variáveis de template)
- **Style:** fundo Variable Indigo, texto índigo escuro, 6px de raio, padding 2px 8px, peso 500
- **Função:** representam nós atômicos `[[variavel]]` no editor TipTap — arrastáveis da sidebar para o documento

### Navigation
- **Landing:** navbar horizontal clara com CTA à direita; vira hambúrguer no mobile
- **Painéis:** navegação simples por layout de seção; título de página `text-2xl font-bold` seguido de cards empilhados (`space-y-6`, largura máxima `max-w-2xl`/`max-w-3xl`)

### Formulários em etapas (componente-assinatura)
Fluxos longos (cadastro de empresa, funcionário) quebram em etapas numeradas ("Etapa X de N") com um card por etapa, botões Voltar/Continuar, e validação por etapa antes de avançar. O padrão de estado `dados`/`rascunho` permite cancelar edições sem efeito colateral.

## 6. Do's and Don'ts

### Do:
- **Do** usar preto sólido (#000) como única cor de ação; secundários usam borda 1px + fundo branco.
- **Do** manter superfícies planas com bordas de 1px; profundidade por tom, não por sombra.
- **Do** dar feedback textual de carregamento no próprio botão ("Salvando...").
- **Do** validar por campo com mensagem específica abaixo do input, em Error Red.
- **Do** incluir variantes `dark:` em todo componente novo dos painéis.
- **Do** garantir contraste AA (4.5:1) em todo texto de corpo — Text Support (#4b5563) é o cinza mais claro permitido para texto informativo.

### Don't:
- **Don't** usar a estética de "site de advocacia antigo": serifas douradas, mármore, martelo/balança, tom rebuscado (anti-referência do PRODUCT.md).
- **Don't** usar a estética de "SaaS genérico": gradientes roxos, ilustrações 3D flutuantes, glassmorphism (anti-referência do PRODUCT.md).
- **Don't** usar a estética de "corporativo frio": azul-marinho bancário, stock photos de aperto de mão (anti-referência do PRODUCT.md).
- **Don't** introduzir cor decorativa — cor sem função de estado viola a Regra do Estado.
- **Don't** usar Text Faint (#9ca3af) para texto de corpo; é exclusivo de placeholders e estados vazios.
- **Don't** adicionar sombras a cards em repouso, side-stripes coloridas (`border-left` > 1px) ou texto em gradiente.
