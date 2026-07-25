# Resumo de Retomada — Projeto Belugada

**Como usar:** cole este arquivo inteiro (ou anexe) em qualquer outra IA, junto com a frase:

> "Estou seguindo este projeto. Aqui está o resumo completo do progresso até agora. Me ajude a continuar a partir daqui."

Isso substitui a necessidade de reexplicar o projeto do zero. Este resumo é complementar ao `guia-setup-e-roadmap-do-projeto.md` (o roadmap de 11 fases) — leia os dois juntos se possível.

---

## Sobre o projeto

Plataforma SaaS (nome: **Belugada**) para digitalizar a consultoria trabalhista da esposa do usuário (advogada). Fluxo: **Admin** (a consultoria) cadastra empresas-cliente e vincula templates de documentos; cada **Empresa-cliente** cadastra seus funcionários e o sistema gera automaticamente os documentos trabalhistas em PDF/DOCX personalizados para aquele funcionário.

Sem login de funcionário. Sem simulador de gastos. Cobrança recorrente mensal/anual (Mercado Pago, ainda não implementado).

## Stack confirmada

Next.js 16 (Turbopack) + Supabase (Postgres, Auth, Storage) + Prisma + Auth.js v5 (credentials + bcryptjs) + `@react-pdf/renderer` (planejado) + `docxtemplater` + `PizZip` + BrasilAPI/ReceitaWS (CNPJ) + ViaCEP + Resend (e-mail) + Mercado Pago (pendente) + Vercel. Tudo em free tier.

Estrutura de pastas real do projeto (`src/`):
```
src/
├── auth.ts
├── proxy.ts (não middleware.ts — deprecado no Next 16)
├── app/
│   ├── actions/
│   │   └── salvar-template.ts
│   ├── admin/
│   │   ├── layout.tsx, page.tsx
│   │   ├── empresas/ (page.tsx, nova/page.tsx, [id]/page.tsx, [id]/templates/route.ts, [id]/templates/[templateId]/route.ts)
│   │   ├── templates-padrao/ (page.tsx, [templateId]/route.ts)
│   │   └── templates-personalizados/novo/page.tsx
│   ├── api/
│   │   ├── admin/empresas/route.ts (NOVO — criado nesta sessão)
│   │   ├── admin/empresas/[id]/templates-padrao/route.ts
│   │   ├── admin/templates-padrao/route.ts
│   │   ├── auth/ (forgot-password, reset-password, [...nextauth])
│   │   ├── cep/[numero]/route.ts
│   │   ├── cnpj/[numero]/route.ts (reescrito nesta sessão — fallback BrasilAPI→ReceitaWS)
│   │   └── empresa/ (documentos/download, funcionarios/route.ts, funcionarios/[id]/gerar-documentos/route.ts)
│   ├── empresa/ (layout, page, funcionarios/novo, funcionarios/[id])
│   ├── esqueci-senha/, login/, redefinir-senha/
├── components/
│   ├── BannerCookies.tsx, BotaoWhatsapp.tsx, GerarDocumentosForm.tsx, LogoutButton.tsx,
│   │   Navbar.tsx, SelecaoTemplatesPadraoForm.tsx, template-editor.tsx, ThemeToggle.tsx,
│   │   UploadTemplateForm.tsx, UploadTemplatesPadraoForm.tsx
├── lib/
│   ├── mapearVariaveis.ts
│   ├── prisma.ts
│   ├── renderizar-template-editor.ts (contém TipTapNode, renderizarTemplateEditor, extrairVariaveisUsadas)
│   ├── supabaseAdmin.ts
│   ├── variaveis-disponiveis.ts (NOVO — lista de variáveis pra sidebar do editor)
│   └── tiptap/variable-extension.ts (extensão custom "variable" — nó atômico [[key]])
└── types/next-auth.d.ts
```

## Schema Prisma — models relevantes discutidos nesta sessão

```prisma
enum OrigemTemplate {
  UPLOAD
  EDITOR
}

model TemplateDocumento {
  id                 String          @id @default(cuid())
  nome               String
  tipo               String          // enum real: PADRAO | PERSONALIZADO
  origem             OrigemTemplate  @default(UPLOAD)
  arquivoOriginalUrl String?         // opcional (era obrigatório, corrigido nesta sessão)
  conteudo           Json?           // JSON do TipTap, usado quando origem = EDITOR
  variaveisDetectadas String[]
  empresaId          String?
  empresa            Empresa?        @relation(fields: [empresaId], references: [id])
  ativo              Boolean         // usado em filtros de listagem
  createdAt          DateTime        @default(now())
}

model Empresa {
  id                  String   @id @default(cuid())
  cnpj                String   @unique
  razaoSocial         String
  nomeFantasia        String?
  dataAbertura        DateTime?
  situacaoCadastral   String?
  naturezaJuridica    String?
  capitalSocial       Float?
  porteEmpresa        String?
  cnaePrincipal       String?
  cnaesSecundarios    String[]
  logradouro          String?
  numero              String?
  complemento         String?
  bairro              String?
  cidade              String?
  uf                  String?
  cep                 String?
  telefone            String?
  emailCorporativo    String?
  quadroSocietario    Json?
  planoContratado     String?
  dataInicioContrato  DateTime?
  dataRenovacao       DateTime?
  statusPagamento     StatusPagamento @default(ATIVO)
  responsavelNome     String?
  responsavelCargo    String?
  responsavelTelefone String?
  responsavelEmail    String?
  templatesPadraoSelecionados EmpresaTemplatePadrao[]
  usuarios     Usuario[]
  funcionarios Funcionario[]
  templates    TemplateDocumento[]
  createdAt    DateTime @default(now())
}

model Usuario {
  id           String   @id @default(cuid())
  emailOuLogin String   @unique
  senhaHash    String
  papel        Papel    // valores usados: "ADMIN" | "EMPRESA"
  empresaId    String?
  empresa      Empresa? @relation(fields: [empresaId], references: [id])
  createdAt    DateTime @default(now())
  tokenReset       String?
  tokenResetExpira DateTime?
}
```
`bcryptjs` é o pacote usado para hash de senha (não `bcrypt` nativo).

---

## O que foi feito nesta sessão (em ordem)

### 1. Fase 7B — Editor de templates no site (TipTap)
Objetivo: permitir criar templates de documento direto no site, arrastando variáveis, sem precisar do Word.

- **`lib/tiptap/variable-extension.ts`**: extensão custom do TipTap (`Variable`), nó atômico (`atom: true`) que renderiza como `[[key]]`, com comando `insertVariable(label, key)`.
- **`components/template-editor.tsx`**: componente client com editor TipTap central + sidebar de variáveis arrastável (drag-and-drop nativo HTML5, sem lib extra) + input de nome + botão salvar. Sidebar hoje puxa de `VARIAVEIS_DISPONIVEIS` (lista real, não mais mock).
- **`lib/variaveis-disponiveis.ts`** (novo): lista manual de `{key, label}` espelhando as chaves que `lib/mapearVariaveis.ts` retorna. ⚠️ **Não é automático** — se adicionar campo novo em `mapearVariaveis.ts`, precisa replicar aqui manualmente.
- **`lib/renderizar-template-editor.ts`**: contém:
  - `interface TipTapNode` (tipo recursivo: `{type, attrs?, content?, text?}`)
  - `renderizarTemplateEditor(conteudoTipTap, dados)`: percorre a árvore JSON do TipTap e monta HTML, substituindo nós `variable` pelos valores reais. Cobre `paragraph`, `doc`, `heading`, `bulletList`, `orderedList`, `listItem`.
  - `extrairVariaveisUsadas(node)`: percorre a árvore e retorna array de `keys` de variáveis usadas (usado pra popular `variaveisDetectadas` no banco).
- **Schema**: adicionado `enum OrigemTemplate`, campos `origem`, `conteudo Json?`, `variaveisDetectadas` em `TemplateDocumento`. Campo `arquivoOriginalUrl` tornado opcional (`String?`) — antes era obrigatório e quebrava criação via editor.
- **`app/actions/salvar-template.ts`** (Server Action): recebe `{templateId?, nome, empresaId?, conteudoJson: string}` — **importante: `conteudo` é enviado como STRING (`JSON.stringify`) do client e faz `JSON.parse` no servidor**, não como objeto direto. Isso foi necessário pra corrigir um bug do Next.js 16 (ver seção de bugs abaixo). Internamente usa `Prisma.InputJsonValue` como cast pro campo `conteudo`, e grava `tipo: "PERSONALIZADO"`, `origem: "EDITOR"`.
- **Motor de geração** (`app/api/empresa/funcionarios/[id]/gerar-documentos/route.ts`): agora tem dois caminhos dentro do loop de templates — `if (template.origem === "EDITOR")` chama `renderizarTemplateEditor` e retorna o HTML gerado dentro do JSON de resposta (ainda **não gera PDF**, é pendência); senão segue o caminho antigo (`docxtemplater` no `.docx` de `arquivoOriginalUrl`, agora com guarda `if (!template.arquivoOriginalUrl)`).

### 2. Página da biblioteca + botão de acesso
- **`app/admin/templates-padrao/page.tsx`** (reescrita completa): agora busca `templatesPadrao` (`tipo: "PADRAO"`) e `templatesPersonalizados` (`tipo: "PERSONALIZADO"`) separadamente. A seção de padrão continua como estava (usa `UploadTemplatePadraoForm`). Abaixo, nova seção "Biblioteca de documentos personalizados" com botão **"+ Criar template"** linkando pra `/admin/templates-personalizados/novo`, e lista simples dos personalizados já salvos (nome + variáveis detectadas). **Falta**: botão de remover personalizado (não implementado — rota de delete existente pode não aceitar esse tipo).
- **`app/admin/templates-personalizados/novo/page.tsx`** (nova): página que renderiza `<TemplateEditor />`.
- **Decisão de escopo**: templates personalizados **não são vinculados a uma empresa na criação** — ficam numa "biblioteca" solta (`empresaId: null`). A vinculação empresa↔template fica pra depois, reaproveitando `admin/empresas/[id]/templates/route.ts` (ainda não ajustada pra aceitar vincular um template já existente por ID em vez de só upload novo — **pendência aberta**).

### 3. Bugs corrigidos nesta sessão
- **ESLint `no-explicit-any`** em vários pontos → substituído por interfaces tipadas (`Record<string, unknown>`, `TipTapNode`, `RespostaReceitaWs`).
- **Erro de tipo Prisma** (`conteudo` não aceita `TipTapNode` direto) → resolvido com cast `as unknown as Prisma.InputJsonValue` na hora de salvar, e `as unknown as TipTapNode` na hora de ler.
- **Campo obrigatório fantasma** (`arquivoOriginalUrl` era `String` obrigatório) → tornado `String?` no schema.
- **Erro grave do Next.js 16**: `"Cannot access key on the server. You cannot dot into a temporary client reference from a server component."` ao salvar template — o JSON aninhado do TipTap não estava sendo serializado corretamente ao cruzar a fronteira client→Server Action. **Solução aplicada**: no client, `JSON.stringify(editor.getJSON())` antes de enviar; no Server Action, `JSON.parse(conteudoJson)` ao receber. Parâmetro da action mudou de `conteudo: TipTapNode` para `conteudoJson: string`.
- **CNPJ não encontrado / rate limit BrasilAPI**: `route.ts` de `/api/cnpj/[numero]` reescrito com fallback automático: tenta BrasilAPI primeiro, se falhar (ex. `429 Too Many Requests`, confirmado em teste real com CNPJ do Banco do Brasil) tenta ReceitaWS, normalizando os campos dela pro mesmo formato da BrasilAPI (`razao_social`, `nome_fantasia`, `municipio`, `ddd_telefone_1`, etc.). Se as duas falharem, retorna `{error, naoEncontrado: true}` com status 404 — o formulário ainda não trata esse flag especificamente pra liberar preenchimento manual (**pendência aberta, mas não bloqueante** — o fallback já resolveu o caso testado).
- **Cadastro de empresa retornando 404 no POST**: descoberto que `src/app/api/admin/empresas/route.ts` (rota raiz para criar empresa) **não existia** — provavelmente apagada em algum `git reset`/revert anterior à sessão atual. Recriada do zero nesta sessão: cria `Empresa` + `Usuario` (papel `EMPRESA`) dentro de uma `prisma.$transaction`, com hash via `bcryptjs`, tratamento de erro `P2002` (CNPJ ou login duplicado) retornando mensagem amigável. **Ainda não testada pelo usuário até o fim** — este é o próximo passo imediato.

---

## Fase 8 — Sistema de Notificações internas (concluída)

Objetivo: avisar o(s) admin(s) sempre que uma empresa-cliente faz uma ação relevante (criar/editar/excluir funcionário, gerar documento), com central compartilhada (sino no header + página de relatório com filtros).

**Decisões de modelagem (com trade-off explicado ao usuário antes de implementar):**
- **Uma tabela só** (`Notificacao`), não duas (log + notificação separados). Como a central é compartilhada entre todos os admins (não por usuário), um único `lida: Boolean` na própria linha basta — não precisa de tabela de leitura por admin. A mesma tabela serve de log de atividades (relatório) e de notificação (dropdown), só varia o filtro.
- **Granularidade de "documento gerado"**: um único `tipo: GERACAO_DOCUMENTO` no enum, mas a `descricao` (texto já pronto) carrega os nomes dos templates gerados — evita precisar de um enum que cresce a cada template novo.
- **`entidade`/`entidadeId` são só informativos, sem FK real** — de propósito: uma notificação de "funcionário excluído" precisa sobreviver à exclusão do próprio funcionário; uma FK real quebraria ou exigiria cascade que apagaria o próprio histórico.
- **Escopo das ações**: a notificação cobre só as 4 ações que pertencem ao papel `EMPRESA` (criar/editar/excluir funcionário + gerar documento) — "nova empresa vinculada" ficou de fora porque quem cadastra empresa é o **admin** (`api/admin/empresas/route.ts`), não a empresa-cliente, então não se encaixa na frase central do pedido ("avisa o admin quando a empresa-cliente age").
- **Realtime (Supabase) descartado por ora** — o projeto lê o banco via Prisma, não via client do Supabase; habilitar Realtime exigiria conexão websocket + replicação só pra esse fluxo. Polling simples de 30s no dropdown resolve pra um punhado de admins internos.

**Schema (`prisma/schema.prisma`)**: novo enum `TipoAtividade` (`CRIACAO`, `EDICAO`, `EXCLUSAO`, `GERACAO_DOCUMENTO`) e model `Notificacao` (`tipo`, `descricao`, `entidade`, `entidadeId?`, `empresaId` + relation, `usuarioId?` + relation, `lida: Boolean @default(false)`, `createdAt`, índices em `empresaId`/`lida`/`createdAt`). Migration `20260724223518_add_notificacoes` já aplicada no banco.

**Auth.js (`src/auth.ts`, `src/types/next-auth.d.ts`)**: `session.user` não expunha `id` (só `papel`/`empresaId`) — adicionado `session.user.id = token.sub` no callback `session`, e `id: string` no tipo `Session.user`. Necessário pra registrar quem praticou a ação.

**Helper central (`src/lib/registrarAtividade.ts`)**: `registrarAtividade({ tipo, descricao, entidade, entidadeId?, empresaId, usuarioId? })` — cria a `Notificacao` via Prisma dentro de try/catch que só loga erro no console, nunca propaga. Chamado inline (não em transaction) logo após a escrita principal em 4 rotas:
- `POST src/app/api/empresa/funcionarios/route.ts` → `CRIACAO`
- `PUT src/app/api/empresa/funcionarios/[id]/route.ts` → `EDICAO`
- `DELETE src/app/api/empresa/funcionarios/[id]/route.ts` → `EXCLUSAO` (nome capturado antes da exclusão)
- `POST src/app/api/empresa/funcionarios/[id]/gerar-documentos/route.ts` → `GERACAO_DOCUMENTO` (uma notificação por chamada, não por documento — descrição lista os templates gerados com sucesso)

**API do admin**: `GET /api/admin/notificacoes` (filtros `empresaId`/`tipo`/`de`/`ate`/`naoLidas`, paginação `page`/`limit`, retorna `{ notificacoes, total, naoLidas }`), `PATCH /api/admin/notificacoes/[id]` (marca uma como lida), `POST /api/admin/notificacoes/marcar-todas-lidas` (marca todas as não lidas).

**UI**: `src/components/NotificationBell.tsx` (client, sino no header do admin com badge de não lidas, polling de 30s, dropdown com as últimas 8, marcar lida ao clicar, "marcar todas", link pro relatório completo — plugado em `src/app/admin/layout.tsx`). `src/app/admin/notificacoes/page.tsx` (server component, relatório completo com formulário GET de filtros — empresa/tipo/período/só não lidas — e paginação) + `src/components/NotificacoesTabela.tsx` (tabela client com botão "marcar como lida" por linha). Link "Atividades" adicionado em `src/components/AdminSidebar.tsx`. Labels e formatação de tempo relativo centralizados em `src/lib/notificacoes.ts`.

**Testado end-to-end no navegador** (fixtures criadas e removidas depois, banco real do usuário não foi afetado): login como empresa-teste → criar/editar/excluir funcionário → 3 notificações registradas corretamente no banco → login como admin-teste → sino mostrou "3 não lidas" → dropdown listou as 3 com empresa/tipo/tempo relativo corretos → marcar uma como lida decrementou o badge → "marcar todas como lidas" zerou → página `/admin/notificacoes` mostrou a tabela completa e o filtro por empresa+tipo funcionou. Sem erros no console nem no servidor.

**Não implementado (fora do escopo pedido)**: geração de documento não testada ponta a ponta via UI (exigiria template configurado pra empresa de teste) — o caminho de código é estruturalmente idêntico aos outros 3 gatilhos, já revisado por leitura. Notificação por e-mail/push não foi pedida — só central in-app.

---

## Fase 8B — Alertas de Vencimento/Renovação de Documentos (concluída)

Objetivo: avisar a empresa-cliente (e o admin) antes do prazo de um documento gerado (contrato de experiência/temporário, aviso prévio etc.) vencer — complementar à Fase 8, reaproveitando a tabela `Notificacao`.

**Gap descoberto ao investigar**: não existia nenhuma variável de data-limite — `mapearVariaveis.ts` só tinha `data_nascimento`/`data_admissao`, e `Funcionario` não tinha campo de término de contrato. Adicionado `Funcionario.dataTerminoContrato DateTime?` + campo "Data de término do contrato (se houver)" na Etapa 3 do `FuncionarioForm.tsx` + variável `data_termino_contrato` em `mapearVariaveis.ts`/`variaveis-disponiveis.ts`.

**Decisões de modelagem:**
- **Campo escalar em `DocumentoGerado`** (`dataVencimento DateTime?`) pra data em si — é 1:1 inerente ao documento, resolvida e congelada (snapshot) no momento da geração via `src/lib/obterDataVencimento.ts` (mapeia a variável configurada no template pro campo `Date` real do Funcionario — não reaproveita `mapearVariaveis.ts` porque esse formata pra string de exibição, aqui precisa do `Date` bruto).
- **Tabela separada `AlertaVencimentoEnviado`** (`documentoGeradoId`, `diasAntecedencia`, `@@unique([documentoGeradoId, diasAntecedencia])`) pra controle de idempotência — é genuinamente 1:N (até 3 marcos por documento) e a unique constraint garante no banco que o cron nunca duplica alerta, mesmo rodando 2x.
- **Marcos configuráveis**: constante global `DIAS_ALERTA_PADRAO = [30, 15, 7]` (`src/lib/vencimentos.ts`), com override opcional por template via `TemplateDocumento.diasAlertaVencimento: Int[]`.
- **Onde marcar a variável de vencimento**: não nos fluxos de criação (evita duplicar UI em 3 lugares) — um item "Configurar vencimento" no menu (⋮) de cada card em `BibliotecaTemplates.tsx`, abrindo `ConfigurarVencimentoModal.tsx`, que só oferece as variáveis já detectadas naquele template (`PATCH /api/admin/templates-padrao/[id]/route.ts`, novo arquivo).
- **Só notificação in-app nesta fase** — decisão do usuário; e-mail via Resend fica pra depois (hoje o Resend está em domínio sandbox `onboarding@resend.dev`, ver `forgot-password/route.ts`, precisa de domínio verificado antes de mandar e-mail de produto pra cliente real).
- **Empresa não tinha nenhum sino antes** — `NotificationBell.tsx` (Fase 8) foi generalizado com prop `escopo: "admin" | "empresa"`. Escopo empresa usa rotas próprias (`/api/empresa/notificacoes`, `[id]`, `marcar-todas-lidas`) que forçam `empresaId = session.user.empresaId` e `tipo: VENCIMENTO_PROXIMO` — nunca reaproveita as rotas do admin, pra garantir que uma empresa nunca veja/marque notificação de outra. Plugado em `src/app/empresa/layout.tsx`.

**Schema**: `TipoAtividade` ganhou `VENCIMENTO_PROXIMO`; `Notificacao` ganhou `diasAntecedencia Int?` (só preenchido nesse tipo, usado pra colorir urgência sem reprocessar texto); `TemplateDocumento` ganhou `variavelVencimento String?` + `diasAlertaVencimento Int[]`; `DocumentoGerado` ganhou `dataVencimento DateTime?` + índice; novo model `AlertaVencimentoEnviado`. Migration `20260724233119_add_alertas_vencimento` aplicada.

**Cron**: `vercel.json` (novo arquivo) com `crons: [{ path: "/api/cron/verificar-vencimentos", schedule: "0 9 * * *" }]` — 1x/dia, dentro do limite do plano Hobby gratuito. Rota em `src/app/api/cron/verificar-vencimentos/route.ts`, protegida por header `Authorization: Bearer $CRON_SECRET` (Vercel injeta esse header automaticamente quando a env var `CRON_SECRET` existe no projeto). **Adicionei `CRON_SECRET` ao `.env` local** (valor aleatório gerado nesta sessão) — **pendência: adicionar a mesma env var no painel do Vercel antes do deploy**, senão o cron em produção sempre retorna 401.

**UI de exibição**: sino do admin agora busca duas listas em paralelo ao abrir (`?tipo=VENCIMENTO_PROXIMO` e `?tipoExcluido=VENCIMENTO_PROXIMO`, esse último parâmetro é novo na rota GET) e renderiza duas seções — "Prazos próximos" em cima, "Atividade recente" embaixo — sem duplicar item. Badge de urgência (`BadgeUrgencia` em `NotificationBell.tsx`, reaproveita cores de `BadgeStatus.tsx`): vermelho (`bg-red-50 text-red-700`) se `diasAntecedencia <= 7`, âmbar (`bg-amber-50 text-amber-700`) se 15/30. Página `/admin/notificacoes` ganhou "Vencimento próximo" no filtro de tipo automaticamente (deriva de `ROTULOS_TIPO_ATIVIDADE`, não precisou tocar no código do filtro).

**Testado end-to-end** (fixtures descartáveis, banco real não afetado): empresa + 2 funcionários (um vencendo em 5 dias, outro em 20) + template com `variavelVencimento` configurado + 2 `DocumentoGerado` com `dataVencimento`. Cron disparado manualmente via `curl` com o `CRON_SECRET` real → criou 4 notificações (3 marcos pro de 5 dias, 1 marco pro de 20 dias) → rodado de novo, 0 novas (idempotência confirmada) → sem header/com header errado, 401. Testado no navegador: badges de urgência com as cores certas (verificado via DOM, não só visual), modal "Configurar vencimento" abre pré-preenchido e salva (`PATCH` confirmado no banco), sino do admin mostra as duas seções sem duplicar, sino da empresa mostra só os próprios alertas de vencimento (sem ver atividade genérica nem dado de outra empresa), marcar como lida decrementa o badge nos dois escopos. Sem erros no console nem no servidor.

**Bug pré-existente encontrado, não corrigido aqui (sinalizado à parte)**: o botão "Remover" na biblioteca de templates chama `DELETE /api/admin/templates-padrao/[id]`, rota que não existe — provavelmente 404 sempre que clicado. Anterior a esta sessão, fora do escopo do pedido de vencimentos.

**Não implementado (fora do escopo desta fase)**: e-mail (decisão explícita do usuário, só in-app por ora); página de relatório completo do lado da empresa (só o sino, que é o que foi pedido).

---

## Fase — Design system unificado (admin → empresa) (concluída)

Objetivo: aplicar na área da empresa exatamente o mesmo design system já usado no admin (navy/teal/slate, `.painel-admin`) — sem inventar visual novo, sem copiar funcionalidade administrativa.

**Achado ao investigar (antes de qualquer código):** `DESIGN.md` está desatualizado — descreve um sistema monocromático preto/branco antigo que não existe mais no código. O projeto tem **três gerações de estilo** coexistindo em `globals.css`: `.landing-pacta` (petróleo/dourado, site público), `.app-interno` (também petróleo/dourado — documentado no próprio CSS como "compartilhado entre admin e empresa", mas é o sistema **anterior**, já superado no admin), e `.painel-admin` (navy/teal/slate — o atual, definido via `@theme` com tokens reais do Tailwind: `bg-navy-*`, `text-slate-*`, semânticos `bg-surface`/`text-ink`/`border-border`, `text-h1`…`text-caption`, `rounded-pa-*`, `shadow-pa-*`). A empresa não usava nenhum dos três — era Tailwind cru (`bg-gray-900` etc.), pré-datando até o `.app-interno`. O trabalho foi migrar empresa de Tailwind cru para `.painel-admin`, igual ao admin.

**Achado sobre dark mode (comunicado ao usuário antes de mexer):** o mecanismo (`@custom-variant dark` baseado em classe `.dark`, não `prefers-color-scheme`) está declarado, mas **não há nenhum `ThemeToggle` no código hoje**, nada aplica a classe `.dark` em lugar nenhum, e os tokens navy/teal/slate do `.painel-admin` não têm nenhum valor alternativo de dark mode — os componentes `ui/*` também não têm variantes `dark:`. Ou seja, dark mode não está funcionalmente implementado no admin hoje, apesar do mecanismo existir. Decisão: empresa ficou com o mesmo suporte (nenhum além do `@custom-variant` declarado) — não reimplementei nem inventei dark mode novo só pra empresa. Fica como pendência separada se quiser implementar de verdade (afetaria admin e empresa juntos).

**Estrutura compartilhada criada:** `src/components/Sidebar.tsx` — componente genérico `{ links, hrefInicio, idPrefix }`, usado tanto por `AdminSidebar.tsx` (agora um wrapper fino) quanto diretamente por `src/app/empresa/layout.tsx`. Os primitivos `src/components/ui/*` (Button, Card, Input, BadgeStatus, ProgressBar, Toast, Spinner) já eram agnósticos de papel — só passaram a ser usados pela empresa também, nada foi movido.

**Arquivos reescritos:**
- `src/app/empresa/layout.tsx` — classe `.painel-admin` no wrapper raiz (não existia), `Sidebar` compartilhado.
- `src/app/empresa/page.tsx` + novo `src/components/FuncionariosTabela.tsx` — listagem com linha clicável (mesmo padrão de `EmpresasTabela.tsx` do admin), `BadgeStatus`, `Card`, `Button`.
- `src/components/FuncionarioForm.tsx` — wizard de 5 etapas todo migrado pra `Card`/`Input`/`Button`, com `ProgressBar` mostrando o avanço e uma transição Motion de entrada por etapa.
- `src/app/empresa/funcionarios/[id]/page.tsx` — cabeçalho com tokens (`text-h1`, `text-ink-muted`).
- `src/components/GerarDocumentosForm.tsx` — **conectou o `GeracaoDocumentosProgress.tsx`**, que já existia pronto no design novo mas só era usado numa página de QA isolada (`/preview/geracao-documentos`, comentário "apagar depois de aprovado" — apagada nesta fase, já que a condição do próprio comentário foi cumprida).
- `src/components/ExcluirFuncionarioButton.tsx` — modal reescrito com o mesmo padrão Motion (fade + scale) de `ConfigurarVencimentoModal.tsx`.
- `src/components/ui/BadgeStatus.tsx` — adicionados os estados `EM_GERACAO`/`EXPIRADO` de `StatusDocumentacao`, que faltavam (só usados pela empresa).
- `src/components/BotaoWhatsapp.tsx` — só a variante `inline` (usada na empresa) ganhou `rounded-pa-md`; a variante `fixo` (FAB da landing) não foi tocada, fora do escopo.

**Bug real encontrado e corrigido durante o teste no navegador** (não era só ambiente de teste): `FuncionarioForm.tsx` usava `<AnimatePresence mode="wait">` pra animar a troca de etapas. Isso trava a etapa seguinte até o callback de conclusão da animação de **saída** da etapa anterior disparar — em qualquer situação que atrase esse callback (aba em segundo plano, dispositivo lento, o que quer que seja), o usuário fica **preso vendo a etapa antiga indefinidamente**, mesmo já tendo clicado "Continuar". Descobri isso ao testar no navegador (a "Etapa 2" nunca renderizava). Corrigido removendo `AnimatePresence`/`exit` — cada etapa agora só anima a **entrada** (fade + slide), a anterior desmonta na hora. Sem risco de travar o fluxo de cadastro, que é core do produto.

**Testado end-to-end no navegador** (fixtures descartáveis, banco real não afetado): cadastro completo de funcionário pelas 5 etapas (incluindo o novo bug acima, pego e corrigido no processo) → funcionário aparece na listagem → clique na linha abre o detalhe → excluir funcionário abre modal, confirma, redireciona → nenhuma regressão no admin (sidebar compartilhado, `/admin/empresas`, `/admin/templates-padrao` — mesmas cores, mesma estrutura, sem erros). Typecheck e ESLint limpos no projeto inteiro.

**Nota sobre verificação neste ambiente:** o pane do navegador aqui não compõe/renderiza frames (erro explícito do próprio tool de screenshot), então transições CSS em andamento ficam presas no frame inicial quando consultadas via `getComputedStyle` — cheguei a investigar isso a fundo antes de perceber que era o ambiente, não o código (confirmado clonando o elemento: um clone sem histórico de animação calculava o valor final correto). Isso não afeta o funcionamento real em um navegador comum.

**Não implementado (fora do escopo desta fase, por decisão explícita ou por já não fazer sentido)**: dark mode de verdade (ver achado acima); corrigir o botão "Remover" quebrado na biblioteca de templates (bug pré-existente, sinalizado como task separada na Fase 8B, ainda pendente).

---

## Fase — Redesenho de densidade e estrutura de layout (admin + empresa) (concluída)

Objetivo: o design não era "vazio por falta de dado" — era a estrutura da página que criava vazio (tabela estreita, formulário pequeno centralizado, header só com o sino). Pedido explícito do usuário, com prints anexados mostrando o problema. Não mudar cor/identidade — só estrutura/densidade, no estilo dashboards modernos (Linear/Notion).

**Componentes novos, compartilhados por admin e empresa (nenhuma duplicação de layout por área):**
- `src/components/Topbar.tsx` — header com breadcrumb (mapa de rotas → trilha, ex. "Admin / Empresas"), o `NotificationBell` (que já existia) e um chip de identidade do usuário (avatar com inicial + e-mail da sessão). Plugado nos dois `layout.tsx`, recebendo `nomeUsuario={session.user.email}` do server component. Resolve a queixa #3 (sino sozinho).
- `src/components/ui/StatCard.tsx` — card de resumo com badge de ícone em navy/teal/âmbar/vermelho (primeiro uso real da paleta fora da sidebar/botões — resolve a queixa #4). Usado no dashboard do admin (que já tinha 3 números soltos em `<Card>` cru — padronizados aqui) e nas duas listagens principais.
- `src/components/ui/EmptyState.tsx` — decidido **no nível da página**, não dentro do componente de tabela: quando a lista está vazia, a página troca a `Card`+tabela inteira por um card maior (ícone + título + descrição + CTA), em vez de uma tabela estreita com uma linha "nenhum item". Ataca o vazio de verdade, porque antes o vazio existia até com dados (a tabela nunca preenchia a tela).

**Páginas atualizadas:** `admin/page.tsx` (dashboard, StatCards com ícone), `admin/empresas/page.tsx` + `EmpresasTabela.tsx`, `empresa/page.tsx` + `FuncionariosTabela.tsx` — todas ganharam: linha de `StatCard`s com métricas reais (não decorativas — ex. "Pagamentos atrasados", "Documentação pendente"), `EmptyState` no lugar da linha vazia, cabeçalho de tabela mais denso (uppercase + tracking, células com mais padding interno — `p-4` em vez de `p-3`), avatar de iniciais por linha (navy no admin, teal na empresa, mais uma aplicação funcional da paleta).

**`FuncionarioForm.tsx` virou duas colunas**: o wizard continua à esquerda (mesma largura de antes), a lateral direita ganha um painel "Etapas" sticky — checklist com as 5 etapas, a atual destacada em navy, as concluídas com check em teal, e uma dica contextual por etapa. Usa o espaço horizontal que antes era só vazio, com informação real (progresso), não decoração.

**Escopo consciente — não mexido nesta fase**: `admin/notificacoes/page.tsx`, `admin/templates-padrao/page.tsx` (já tinha grid de cards, menos crítico) e a página de detalhe do funcionário/gerar-documentos não ganharam `StatCard`/`EmptyState` — só herdaram o `Topbar` novo automaticamente (via layout). Extensão natural pra uma próxima fase, os componentes já existem prontos pra reaproveitar.

**Testado end-to-end no navegador** (fixtures descartáveis, banco real não afetado, no servidor que o próprio usuário já tinha rodando): dashboard do admin com 3 StatCards, `/admin/empresas` com StatCards + tabela densa + avatares, `/empresa` com EmptyState (0 funcionários) → cadastro completo pelas 5 etapas com o painel lateral atualizando corretamente etapa a etapa (destaque + check + dica) → listagem passa a mostrar StatCards reais (1/1/0). Sem erros de console (confirmado em aba nova, isolada do buffer acumulado de sessões anteriores) nem no servidor. Typecheck e ESLint limpos.

**Bug de sobreposição corrigido antes desta fase, relevante pro handoff**: `src/components/ui/Input.tsx` tinha o label flutuante colidindo com o `placeholder` nativo (CPF) e com o hint nativo `dd/mm/aaaa` de campos `type="date"` — corrigido passando `placeholder` só quando o campo está focado, e forçando `flutuando = true` sempre em campos de data. Reportado pelo usuário via screenshot, confirmado e corrigido no mesmo turno.

---

## Fase — Tema dark em todo o sistema, exceto landing (concluída)

Objetivo: dark mode completo no admin e na empresa, com a landing (e login) permanecendo sempre claros, mesmo com o SO em dark mode. Persistência entre sessões.

**Decisão de arquitetura (a pergunta técnica central do pedido)**: não usei route groups `(marketing)`/`(app)` — o isolamento já existe estruturalmente (landing = `app/page.tsx` com `.landing-pacta`; admin/empresa = layouts próprios com `.painel-admin`; `app/layout.tsx` raiz é neutro, só tem `SessionProvider`). A regra que garante isolamento total: a classe `.dark` **nunca vai em `<html>`/`<body>`** — eles persistem entre navegações client-side do Next e vazariam pra fora das rotas internas. Ela vive só na própria div `.painel-admin` (dona por `src/components/PainelAdminShell.tsx`), que simplesmente não existe na árvore da landing/login. Testado na prática: com o SO forçado em `prefers-color-scheme: dark` **e** o cookie de tema em `dark`, a landing renderizou 100% clara (confirmado via `getComputedStyle`, não só visualmente).

**Persistência**: cookie (`pacta-tema`, não localStorage puro) — os layouts do admin/empresa já são Server Components (`await auth()`), então o cookie é lido no servidor e a classe certa sai já no primeiro HTML, sem flash. Por navegador, não por conta de usuário (sem coluna nova no banco) — suficiente pro caso de uso, sem sincronizar entre dispositivos.

**Por que a maior parte da UI ganhou dark mode sem tocar em componente nenhum**: o `.painel-admin` já era construído sobre variáveis CSS semânticas (`--color-surface`, `--color-ink`, `--color-border` etc.), não cores cravadas. Um único bloco novo em `globals.css` (`.painel-admin.dark { --color-surface: var(--color-slate-800); ... }`) cobriu Card, Input, tabelas, modais, formulários — tudo que já usava os tokens. A sidebar (navy-900) ficou igual nos dois temas, de propósito.

**O que precisou de edição pontual**: só os ~20 lugares que usavam cor crua da paleta em vez do token semântico (badges de status, tons do StatCard, avatares de iniciais, links `text-navy-600`, hovers `bg-slate-50/100`, barra do ProgressBar) — mapeados via grep no projeto inteiro, cada um ganhou o par `dark:` equivalente na mesma paleta navy/teal/slate/status já existente (nenhuma cor nova). Lista completa dos arquivos no diff desta sessão.

**Simplificação que saiu de brinde**: `EmpresasTabela.tsx`/`FuncionariosTabela.tsx` usavam Motion (`whileHover={{ backgroundColor: "#f7f9fb" }}`) pro hover da linha — um hex cravado, animado via JS, que não teria como reagir ao tema sem plumbing extra. Troquei por `className="hover:bg-surface-alt"` (CSS puro): mesmo visual em modo claro (era exatamente o valor de `--color-surface-alt`), e passa a se adaptar ao dark automaticamente, com menos código.

**Toggle**: `src/components/ThemeToggle.tsx`, no Topbar ao lado do chip do usuário — como sugerido no pedido.

**Novos arquivos**: `src/lib/tema.ts` (constante do cookie), `src/components/PainelAdminShell.tsx` (client, dono da classe `.dark` + `TemaContext`), `src/components/ThemeToggle.tsx`.

**Fora do escopo, por decisão explícita**: login, esqueci-senha, redefinir-senha usam um terceiro sistema visual (`.app-interno`, herdado) — não são nem a landing nem "área interna autenticada", não mexi neles. `UploadTemplateForm.tsx`/`UploadTemplatesPadraoForm.tsx` são componentes órfãos (não importados em nenhuma página) — não fazem parte do fluxo real, não foram tocados.

**Testado no navegador** (fixtures descartáveis, banco real não afetado, no servidor que o usuário já tinha rodando): toggle liga/desliga corrigindo variáveis CSS em tempo real (confirmado via `getComputedStyle`, não só visual) → cookie gravado → navegação completa (nova request ao servidor) mantém o tema sem flash → badges de status, avatares de iniciais e distintivos de template com as cores certas nos dois temas (conferido via `getComputedStyle`, valores batendo exatamente com os tokens navy-900/teal-900/green-950 etc. esperados) → **landing testada com SO em dark + cookie em dark simultaneamente, permaneceu 100% clara**. Sem erros de console nem servidor. Typecheck e ESLint limpos.

---

## Fase — Consentimento de cookies (LGPD) + preferências vinculadas à conta (concluída)

Objetivo: banner de consentimento de cookies compatível com LGPD (só na landing) + fazer a preferência de tema (e futuras) seguir a conta do usuário entre dispositivos, não só o navegador.

**Trade-off 1 — onde guardar o consentimento**: solução híbrida. Cookie (`pacta-consentimento`) pra leitura rápida no cliente (decide se mostra o banner, sem round-trip ao banco) **+** tabela `ConsentimentoCookies` no banco, um registro por escolha feita (não sobrescreve — histórico completo), com colunas booleanas explícitas (`essenciais`/`preferencias`/`analytics`), não JSON — um registro de auditoria se beneficia de ser auto-descritivo no schema. Não criei uma tabela *só* de consentimento anônimo porque o Belugada não tem cadastro self-service (é a Beatriz que cadastra as empresas-cliente) — não existe um momento de "visitante virou usuário" pra vincular depois; `usuarioId` fica opcional e quase sempre null.

**Trade-off 2 — onde guardar preferência de conta**: `Usuario.preferencias Json?`, não tabela separada — configuração interna por usuário, ninguém vai precisar filtrar/consultar por preferência específica pra alguma decisão de negócio. Cresce por chave sem migration a cada preferência nova (idioma, filtros salvos...). Tipado e validado em `src/lib/preferencias.ts` via Zod, não na estrutura do banco.

**Sincronização (Parte 2)**: `admin/layout.tsx` e `empresa/layout.tsx` agora leem `Usuario.preferencias` do banco (Server Component, sem custo perceptível) — se a conta tem tema salvo, ele vence o cookie local; senão cai pro cookie/padrão. `PainelAdminShell.alternar()` grava nos dois lugares ao trocar (cookie pra não piscar na próxima navegação + `PATCH /api/usuario/preferencias` pra acompanhar a conta). Testado de propósito: forcei o cookie local pra `light` numa sessão já logada com preferência `dark` salva na conta — a página renderizou em dark mesmo assim (banco venceu o cookie divergente, confirmando o requisito 4 literalmente).

**Banner (Parte 1)**: `src/components/BannerCookies.tsx` reescrito — antes só salvava um booleano no localStorage e tinha um botão só. Agora: Aceitar todos / Recusar não essenciais / Personalizar (3 categorias, Essenciais sempre travada em "on"), estilizado com o sistema visual da própria landing (`.landing-pacta`, petróleo/dourado — não usa `.painel-admin`, é área não-autenticada). Link "Preferências de cookies" no rodapé (`FooterPacta.tsx`) reabre o banner a qualquer momento via evento customizado (`EVENTO_ABRIR_PREFERENCIAS_COOKIES`) — direito de revogar consentimento tão fácil quanto o de dar. Nova página `/politica-de-cookies` com texto placeholder, linkada no banner e no rodapé.

**⚠️ Texto jurídico ainda não revisado**: a política de cookies em `src/app/politica-de-cookies/page.tsx` é um placeholder tecnicamente razoável (categorias, direitos LGPD, contato), não aconselhamento legal — **precisa de revisão da Beatriz antes de qualquer lançamento em produção**, como você já esperava.

**Bug real encontrado e corrigido durante o teste** (não era ambiente, era lógica de verdade): sessões JWT do Auth.js não revalidam contra o banco a cada request — um usuário excluído enquanto ainda tem uma sessão ativa no navegador continua "logado" no token. Isso quebrava `POST /api/consentimento-cookies` (FK violation ao tentar vincular um `usuarioId` que não existe mais) e teria quebrado `PATCH /api/usuario/preferencias` do mesmo jeito. Corrigido: a rota de consentimento tenta gravar sem o vínculo de usuário se a FK falhar (nunca perde o registro de auditoria por causa de uma referência solta); a rota de preferências retorna 401 "sessão inválida" em vez de deixar o Prisma estourar um erro cru.

**Testado end-to-end no navegador** (fixtures descartáveis, banco real não afetado): banner aparece na primeira visita → "Personalizar" mostra as 3 categorias com Essenciais travada → salvar grava cookie **e** cria linha em `ConsentimentoCookies` (`usuarioId: null`, confirmado direto no banco) → login → trocar tema grava cookie **e** `PATCH` retorna 200, `Usuario.preferencias` no banco reflete `{"tema":"dark"}` → cookie local forçado pra `light` numa sessão logada com `dark` salvo → banco venceu, página renderizou dark mesmo assim → landing seguiu 100% clara em todos os momentos. Sem erros de console/servidor no fim. Typecheck e ESLint limpos.

**Nota técnica sobre o ambiente desta sessão**: o servidor dev que você tinha rodando manualmente ficou com o Prisma Client desatualizado depois da migration (esperado — só um restart resolve; fiz isso com sua autorização) e, separadamente, o cache do Turbopack (`.next/`) tinha uma versão do client compilada de antes da migration, que sobreviveu ao primeiro restart — precisei limpar `.next/` também. Se um dia você mudar o schema do Prisma com o `npm run dev` já rodando, o caminho mais confiável é: parar o servidor, `npx prisma generate`, apagar a pasta `.next`, subir de novo.

---

## Pendências abertas (ordem sugerida de prioridade)

0. **Configurar `CRON_SECRET` no painel do Vercel** (Project Settings → Environment Variables) com o mesmo valor usado localmente, antes do próximo deploy — senão `/api/cron/verificar-vencimentos` roda mas sempre retorna 401 em produção.
0a. **Revisão jurídica da política de cookies** (`/politica-de-cookies`) antes de lançar — texto placeholder tecnicamente razoável, não é aconselhamento legal.
0c. **Botão "Remover" quebrado na biblioteca de templates** (`DELETE /api/admin/templates-padrao/[id]` não existe) — sinalizado como task separada na sessão da Fase 8B, ainda não corrigido.
0d. **Extensão do redesenho de densidade pras páginas não cobertas**: `admin/notificacoes`, `admin/templates-padrao`, detalhe do funcionário/gerar-documentos — `StatCard`/`EmptyState` já existem prontos, é só aplicar.
1. **Testar o cadastro de empresa de ponta a ponta** com a nova rota `api/admin/empresas/route.ts` — confirmar se `Papel` aceita exatamente o literal `"EMPRESA"` (se o TS reclamar, o enum tem outro nome de valor).
2. **Conversão HTML/DOCX → PDF** (Gotenberg) — pendência mais antiga e mais importante, compartilhada entre Fase 7 (upload) e Fase 7B (editor). Duas tentativas anteriores falharam:
   - CloudConvert: descartado (10 conversões/dia no free tier).
   - Gotenberg self-hosted no Render: deploy deu "Ran out of memory" (imagem `gotenberg/gotenberg:8` carrega Chromium+LibreOffice, estoura 512MB do free tier). Correção identificada e **não testada**: trocar para imagem `gotenberg/gotenberg:8-libreoffice` (só LibreOffice) e remover a flag `--libreoffice-auto-start=true`.
   - Recomendação: implementar em passos pequenos com commit após cada parte funcional (ex. commit só depois do Gotenberg aparecer "Live" no Render, antes de tocar no código Next.js).
3. **Botão de remover template personalizado** na biblioteca (`templates-padrao/page.tsx`) — não implementado, incerteza se a rota de delete existente aceita `tipo: PERSONALIZADO`.
4. **Vínculo template personalizado ↔ empresa específica** — hoje templates do editor ficam soltos (`empresaId: null`); falta decidir/implementar onde essa vinculação acontece (provavelmente dentro da tela de edição de empresa, reaproveitando ou ajustando `admin/empresas/[id]/templates/route.ts`).
5. **Flag `naoEncontrado` do fallback de CNPJ** — o front (`nova/page.tsx`) hoje só checa `!res.ok` e mostra "CNPJ não encontrado", sem liberar preenchimento manual. Se quiser esse UX melhorado, precisa ajustar o form.
6. ~~Fase 8 (Notificações)~~ **concluída** (ver seção acima). Seguir roadmap: Fase 9 (Cobrança Mercado Pago), Fase 10 (Polimento), Fase 11 (Lançamento) — ainda não iniciadas.

---

## Preferência de trabalho do usuário (aplicar sempre)

- Explicar o **raciocínio de forma breve antes** do código (não despejar tudo de uma vez sem contexto) — pedido explícito pra economizar tokens/tempo.
- Ao criar **arquivo novo**: sempre mandar primeiro o comando de terminal (`New-Item ...`, sintaxe **PowerShell**, o usuário está no Windows) pra criar o arquivo, depois o código completo pra colar — nunca só "cole isso no caminho X".
- Ao editar arquivo existente com mudança pontual: pode indicar trecho a trocar, mas ser explícito sobre em qual arquivo/bloco exatamente (já houve confusão sobre "qual JSX" — sempre nomear o arquivo).
- Evitar assumir nomes de campos/enums que não foram confirmados — pedir o arquivo real (schema, route, component) antes de escrever código que depende deles, pra não gerar rodadas de erro de tipo.
- Ao final de cada fase/etapa relevante concluída, fechar a resposta com resumo do escopo do projeto + fase atual + próximo passo (o usuário alterna entre múltiplas IAs por limitação de orçamento).
