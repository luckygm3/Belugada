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

## Fase — Configurações, Fase 1: Conta/Perfil + Notificações (concluída)

Objetivo: criar a página de Configurações (`/admin/configuracoes` e `/empresa/configuracoes`), estrutura compartilhada entre os dois papéis (mesmo layout/componente, conteúdo condicional por `papel`), cobrindo Conta/Perfil (nome, e-mail, senha, avatar, tema, sessões ativas) e Notificações (liga/desliga e-mail por tipo de evento) — primeira de várias fases mapeadas num documento de escopo próprio que o usuário trouxe pronto.

**Decisões fechadas com o usuário antes de codar (via perguntas diretas, não assumidas):**
- **Sessões ativas**: tabela própria `SessaoAtiva` (soft delete via `revogadaEm`) + `sessionId` embutido no JWT, revalidado contra o banco com **throttle de 5 min** (não a cada request) — mantém a estratégia `session: { strategy: "jwt" }` atual, não migrou pra `database` session/`@auth/prisma-adapter` (mudança maior, mais risco).
- **Escopo do filtro de preferência**: controla só o **envio de e-mail**. A central de notificações in-app (`Notificacao`) continua mostrando tudo pra todos, comportamento century intocado — não virou "notificação por usuário".
- **Resumo diário agrupado (digest)**: **não implementado nesta fase** — só reservado no shape do JSON (`notificacoes.digestDiario`) pra não precisar migration quando a Fase 2 fizer o batching de verdade.
- **Avatar**: bucket Supabase Storage **público** novo (`avatares`), URL pública completa salva direto em `Usuario.avatarUrl` — diferente do padrão de bucket privado + signed URL usado em `templates`/`documentos-gerados` (foto de perfil não é dado sensível como documento trabalhista).
- **Granularidade "por empresa" nas notificações do admin**: fixada em "todas as empresas" nesta fase (fica de fora do formulário) — o JSON já é extensível sem migration se quiser granularidade depois.

**Schema (`prisma/schema.prisma`)**: `Usuario` ganhou `nome String?` e `avatarUrl String?` (não existiam — só havia `emailOuLogin`, usado tanto como login quanto exibição). Novo model `SessaoAtiva` (`usuarioId` + relation `onDelete: Cascade`, `userAgent?`, `ip?`, `criadoEm`, `ultimoUso`, `revogadaEm?`, índice em `usuarioId`). Migration `20260725100618_add_perfil_e_sessoes_ativas`. Preferências de notificação **não** geraram migration — reaproveitam `Usuario.preferencias Json?` existente, mesmo padrão já documentado no schema pra tema.

**`src/lib/preferencias.ts`**: schema Zod ganhou `notificacoes: { email: z.partialRecord(TipoAtividade, boolean), digestDiario: boolean }` + `preferenciaEmailAtiva(preferencias, papel, tipo)`, que aplica defaults por papel quando o usuário nunca configurou nada (ADMIN só `VENCIMENTO_PROXIMO: true` por padrão, resto `false`; EMPRESA só enxerga o toggle de `VENCIMENTO_PROXIMO`).

**`src/auth.ts` + `src/types/next-auth.d.ts`**: `authorize()` agora cria a `SessaoAtiva` no login e devolve `nome`/`avatarUrl`/`sessionId`; callback `jwt` grava esses campos no token na primeira chamada, aceita `trigger === "update"` (disparado por `useSession().update()` no client, pra refletir troca de nome/avatar sem forçar logout), e faz a revalidação throttled da denylist fora desses dois casos. Callback `session` expõe `session.sessionId` e `session.error = "SessaoRevogada"`. Os dois `layout.tsx` (`admin`/`empresa`) passaram a checar `session.error === "SessaoRevogada"` no redirect — **gap conhecido**: essa checagem só existe nos layouts, não em rotas de API chamadas via `fetch` isoladamente, então revogar uma sessão não é instantâneo nem universal (aceitável pro requisito desta fase — "listar e encerrar" —, documentado como possível Fase 2: helper `requireSessaoValida()` nas rotas).

**Endpoints novos**: `PATCH /api/usuario/perfil` (nome/e-mail, 409 em e-mail duplicado), `PATCH /api/usuario/senha` (bcrypt compare + hash, mesmo custo de `reset-password`), `POST /api/usuario/avatar` (multipart, valida PNG/JPEG/WEBP até 2MB, upload no bucket público `avatares`, `getPublicUrl`), `GET /api/usuario/sessoes` + `DELETE /api/usuario/sessoes/[id]` (bloqueia revogar a própria sessão atual — usa o botão Sair pra isso).

**`src/lib/notificarPorEmail.ts`** (novo, mesma postura defensiva de `registrarAtividade` — nunca lança erro): resolve destinatários (admins + usuários da empresa do evento com a preferência ligada) e dispara via Resend (client já existia, só usado antes em reset de senha). Chamado logo depois de `registrarAtividade` nos mesmos 4 call sites (`funcionarios` CRIACAO/EDICAO/EXCLUSAO, `gerar-documentos` GERACAO_DOCUMENTO) e no cron de vencimento (`VENCIMENTO_PROXIMO`) — `registrarAtividade` em si **não mudou**.

**UI**: `src/app/admin/configuracoes/page.tsx` + `src/app/empresa/configuracoes/page.tsx` (server components, dentro dos layouts já existentes, sem layout novo) renderizam `src/components/configuracoes/ConfiguracoesView.tsx`, que orquestra `SecaoConta.tsx` (igual pros dois papéis: Perfil/Foto/Senha/Tema — reaproveita `ThemeToggle` existente sem lógica nova/Sessões ativas) e `SecaoNotificacoes.tsx` (condicional: 5 checkboxes + "resumo diário (em breve)" desabilitado pro admin, 1 checkbox só pra empresa). `Topbar.tsx` ganhou prop `avatarUrl` (troca o span de iniciais por `<img>` quando existe) e entradas novas em `TRILHAS`; `AdminSidebar.tsx`/`EmpresaLayout` ganharam o link "Configurações".

**Bugs reais encontrados e corrigidos durante o teste no navegador** (não eram do ambiente):
- `PATCH /api/usuario/perfil` marcava `emailAlterado: true` (forçando `signOut`) sempre que o campo `emailOuLogin` vinha no payload — mesmo sem o valor ter mudado, porque o client sempre manda os dois campos (nome + e-mail) juntos. Corrigido comparando contra o valor atual no banco antes de decidir se o e-mail realmente mudou.
- `z.record(z.nativeEnum(TipoAtividade), z.boolean())` em Zod v4 exige **todas** as chaves do enum presentes (record exaustivo, não parcial) — salvar só `{ VENCIMENTO_PROXIMO: false }` (empresa, que só expõe 1 checkbox) sempre dava 400. Zod v4 tem `z.partialRecord()` justamente pra esse caso (mapa parcial); troquei os dois usos (`nativeEnum` → `enum`, `record` → `partialRecord`) e confirmei em isolamento antes de reaplicar no browser.

**Testado end-to-end no navegador** (login real com credenciais de teste fornecidas pelo usuário — `teste@gmail.com`/EMPRESA e `lucas.gab.med@gmail.com`/ADMIN, banco de dev do próprio usuário, nenhum dado de produção): login nos dois papéis → `/empresa/configuracoes` e `/admin/configuracoes` renderizam com o conteúdo certo por papel (empresa só vê 1 checkbox de notificação, admin vê 5 + digest desabilitado) → editar nome salva e atualiza a Topbar sem logout (depois do fix do bug acima) → validação de senha nova <8 caracteres barra no client com mensagem inline → encerrar uma sessão antiga funciona e reflete na lista (confirmado também direto no banco: `revogadaEm` preenchida) → salvar preferências de notificação persiste corretamente pros dois papéis com os defaults certos (confirmado direto no banco, depois do fix do Zod) → dark mode alterna a classe `.dark` no wrapper certo → sem erros no console nem no servidor durante toda a sessão de teste. **Não testado**: upload de avatar de verdade (o bucket público `avatares` ainda não existe no Supabase Storage — passo manual, ver pendência abaixo — e a ferramenta de automação de navegador deste ambiente não tem capacidade de anexar arquivo a um `<input type="file">`); envio de e-mail de fato via Resend (endpoints e lógica revisados por leitura, seguem o mesmo padrão do reset de senha, mas não disparei um evento de negócio completo — cadastro de funcionário — até o fim pra confirmar o e-mail chegando).

**Fora do escopo desta fase** (fica pras próximas, conforme o documento de mapeamento do usuário): Dados da Empresa (Fase 2), Administração Geral/outros admins (Fase 2-3), Segurança e Privacidade/2FA/log de acesso completo (Fase 3), Plano e Cobrança e Aparência/Marca (Futuro).

---

## Fase — Configurações, Fase 2: Dados da Empresa + Administração Geral (concluída)

Objetivo: expandir a Configurações da Fase 1 com "Dados da Empresa" (empresa vê o próprio cadastro e edita só campos não-sensíveis) e "Administração Geral" (só admin: gerenciar outros admins + prazos padrão de alerta de vencimento, antes fixos no código) — segunda de várias fases mapeadas no mesmo documento de escopo da Fase 1.

**Recomendações dadas antes de codar (pedido explícito do usuário: "me dê sua recomendação antes de decidir")**:
- **Onde fica a edição completa de empresa pelo admin?** Recomendei manter em `/admin/empresas/[id]`, sem duplicar em Configurações — motivo estrutural: admin não tem `empresaId` (é `null` pra papel `ADMIN`), não existe "a empresa dele" pra mostrar ali. Resultado: a seção "Dados da Empresa" só renderiza pra papel `EMPRESA`.
- **Templates padrão migra pra dentro de Configurações?** Recomendei manter separado na sidebar — é área de trabalho de uso frequente (upload, organização), não ajuste pontual de conta. Nenhuma mudança de navegação feita.

**Decisão fechada com o usuário antes de codar**: criação de novo admin = **convite por e-mail com link**, não senha provisória direta (a alternativa mais simples que eu tinha sugerido). Reaproveita 100% a infraestrutura já existente do "esqueci minha senha" — mesmos campos `Usuario.tokenReset`/`tokenResetExpira`, mesma rota `POST /api/auth/reset-password`, mesma página `/redefinir-senha` — **nenhuma das três precisou mudar**. Ao convidar, o `Usuario` é criado com `senhaHash` aleatório inutilizável (login impossível até o convite ser resgatado) e `tokenReset` com validade de **7 dias** (vs. 30 min do "esqueci senha", por ser convite, não urgência).

**Schema**: `Usuario` ganhou `ativo Boolean @default(true)` (`false` = acesso revogado, checado em `authorize()`). Novo model singleton `ConfiguracaoGlobal` (`id` fixo `"global"`, `valores Json?`, `updatedAt`) — mesmo padrão Json+Zod de `Usuario.preferencias`, pensado pra caber mais ajustes globais no futuro sem migration nova; hoje só guarda `diasAlertaPadrao`. Migration `20260725103818_add_ativo_e_configuracao_global`.

**`src/lib/configuracaoGlobal.ts`** (novo): `lerDiasAlertaPadrao()` lê `ConfiguracaoGlobal` e cai pro `DIAS_ALERTA_PADRAO` fixo (`src/lib/vencimentos.ts`, não mudou) se nunca foi customizado — zero mudança de comportamento até alguém mexer na tela. Cron (`src/app/api/cron/verificar-vencimentos/route.ts`) trocou o import estático de `DIAS_ALERTA_PADRAO` por essa leitura dinâmica no topo do `GET`.

**`src/auth.ts`**: `authorize()` ganhou `if (!usuario.ativo) return null;` logo após achar o usuário — bloqueia login de conta revogada com a mesma resposta genérica de credencial inválida, sem vazar que a conta existe.

**Endpoints novos**: `PATCH /api/empresa/dados` (empresa edita só endereço/telefone/responsável, via `empresaAutoEdicaoSchema` novo em `src/lib/schemas/empresa.ts` — subconjunto de `empresaEdicaoSchema`, sem razaoSocial/nomeFantasia/emailCorporativo/planoContratado/statusPagamento); `POST /api/admin/administradores` (convite, cria conta + token + e-mail via Resend, 409 se e-mail já existe); `DELETE /api/admin/administradores/[id]` (revogação soft — `ativo:false` + `sessaoAtiva.updateMany` revogando todas as sessões ativas dele, reaproveitando a denylist da Fase 1 —, bloqueia auto-revogação e bloqueia revogar o último admin ativo restante); `PATCH /api/admin/configuracoes-globais` (upsert dos prazos de alerta). Nenhum endpoint GET novo — as duas páginas de Configurações continuam buscando tudo via Prisma direto nos Server Components.

**UI**: `SecaoDadosEmpresa.tsx` (só `EMPRESA`: card só-leitura de razão social/CNPJ/plano/`BadgeStatus` de status + dois cards editáveis de endereço/responsável com um único botão Salvar) e `SecaoAdministracaoGeral.tsx` (só `ADMIN`: lista de admins com status derivado — "Você" / "Convite pendente" / "Convite expirado" / "Acesso revogado" / "Ativo", calculado na hora a partir de `ativo`+`tokenReset`+`tokenResetExpira`, sem coluna nova pra isso — + formulário de convite + campo de prazos de alerta em dias separados por vírgula). `ConfiguracoesView.tsx` passou a renderizar as duas condicionalmente por `papel`; os dois `page.tsx` de Configurações somaram as queries Prisma correspondentes ao `Promise.all` que já existia.

**Testado end-to-end no navegador** (mesmas credenciais de teste da Fase 1 — `teste@gmail.com`/EMPRESA, `lucas.gab.med@gmail.com`/ADMIN — banco de dev do usuário): como empresa, editar logradouro/telefone salva e persiste no banco (**achado no processo**: os campos já vinham preenchidos com dado real da empresa de teste — ao clicar e digitar sem selecionar tudo antes, o texto novo grudou no final do valor existente ao invés de substituir; identifiquei pelo resultado gravado no banco, corrigi selecionando o campo inteiro antes de digitar de novo, e restaurei os valores originais exatamente — não é bug do `Input`, é comportamento normal de campo de texto que eu não tinha previsto no teste); "Dados da Empresa" corretamente ausente pro admin, "Administração Geral" presente; convidar um e-mail real gerou o `Usuario` com token e status "Convite pendente" na lista (refletido via `router.refresh()`); revogar mudou o status pra "Acesso revogado" e sumiu o botão; tentar revogar a própria conta via chamada direta à API (o botão já vem oculto na UI) retornou 400 "Você não pode revogar o próprio acesso."; alterar os prazos de alerta persistiu em `ConfiguracaoGlobal.valores` (confirmado direto no banco) e o cron, disparado manualmente, rodou sem erro lendo o valor novo via `lerDiasAlertaPadrao()`. Sem erros no console nem no servidor. Fixture de convite de teste (usei o e-mail real do próprio usuário pra testar o envio) revogada e depois **removida** do banco ao final, pra não deixar um registro revogado ocupando aquele e-mail único; valor de teste dos prazos de alerta revertido pro default original `[30, 15, 7]` ao final, já que essa configuração é real, não fixture descartável.

**Não testado**: o guard de "não revogar o último admin ativo" só foi verificado por leitura de código (lógica simples: `count` de admins `ativo:true` `<= 1` bloqueia) — não montei um segundo admin ativo de verdade pra forçar esse caminho, porque exigiria uma segunda conta com senha conhecida. Entrega de e-mail de convite via Resend: rota chamada com sucesso (sem erro), mas não confirmei visualmente o e-mail chegando (mesma limitação de sandbox do Resend já registrada na Fase 1).

**Fora do escopo desta fase** (conforme pedido): plano/cobrança com autoatendimento, 2FA, log de acesso, aparência/marca customizável.

---

## Fase — Configurações, Fase 3: Segurança e Privacidade (concluída)

Objetivo: 2FA (TOTP), log de acesso individual e revisão de consentimento de cookies dentro de Configurações — disponível pra admin e empresa igualmente (diferente da Fase 2, aqui **sem** condicional por papel). Pedido explícito de solidez, não só cosmético, porque reforça o discurso de confiança jurídica do produto (CPF/RG de funcionários).

**Recomendação de 2FA dada antes de codar**: TOTP via app autenticador (não SMS) — padrão aberto, sem provedor terceiro pago, sem dependência nativa (`otpauth` + `qrcode`, isomórficas, nenhuma das duas estava instalada). Reforços de solidez incluídos por conta própria: segredo TOTP **criptografado em repouso** (AES-256-GCM, chave nova `AUTH_2FA_SECRET`, mesmo padrão de pendência do `CRON_SECRET`/`AUTH_2FA_SECRET` — adicionar no Vercel antes do deploy); segredo só persiste **depois** de confirmar um código válido (evita configuração "pendurada"); 8 códigos de backup mostrados uma única vez, hasheados com bcrypt (mesmo tratamento da senha); desativar exige senha atual (uma sessão sequestrada não desliga sozinha).

**O Credentials provider não suporta múltiplas etapas nativamente — solução usada**: `CredentialsSignin` (reexportado por `next-auth`, confirmado em `@auth/core/errors.d.ts`) permite lançar uma subclasse com `code` customizado dentro de `authorize()`, que chega no client como `res.code` via `signIn(..., { redirect: false })` (`SignInResponse` tem `{error, code, ...}` — conferido no tipo antes de implementar). Duas subclasses: `PrecisaSegundoFatorError` (`code: "precisa_2fa"` — senha certa, 2FA ativo, nenhum código enviado ainda: é o primeiro passo esperado, não uma falha) e `SegundoFatorInvalidoError` (`code: "codigo_2fa_invalido"` — essa sim é falha real).

**Schema**: `Usuario` ganhou `totpSecretCriptografado String?`, `totpAtivado Boolean @default(false)`, `totpCodigosBackup String[] @default([])`. Novo model `LogAcesso` (`usuarioId?`, `sucesso Boolean`, `motivoFalha String?`, `userAgent?`, `ip?`, `criadoEm`) — deliberadamente **não** registra tentativa pra e-mail que não existe no banco (reduz ruído de bots e não dá sinal de enumeração de contas) e **não** registra o passo intermediário `precisa_2fa` (é esperado em todo login com 2FA, logar isso encheria o histórico de "falhas" falsas). Sem geolocalização — só IP/user-agent brutos, conforme pedido explícito de não vazar dado sensível desnecessário. Migration `20260725110230_add_2fa_e_log_acesso`.

**Novos módulos em `src/lib/`**: `criptografia.ts` (AES-256-GCM, chave derivada de `AUTH_2FA_SECRET` via SHA-256); `doisFatores.ts` (`gerarSegredo`, `gerarUri`, `validarCodigoTotp` com janela ±30s, `gerarCodigosBackup`, `validarSegundoFator` — tenta TOTP primeiro, depois cada backup, consumindo o hash usado); `registrarLogAcesso.ts` (mesma postura defensiva de `registrarAtividade.ts`, nunca lança erro); `dispositivo.ts` (`descreverDispositivo`/`formatarDataHora`, **extraído** de dentro de `SecaoConta.tsx`, que passou a importar de lá — eliminou duplicação em vez de copiar de novo pro Log de acesso).

**`src/auth.ts`**: `credentials` ganhou `codigoTotp: {}` (opcional); `capturarContexto(request)` local reaproveitada pra `SessaoAtiva` e `LogAcesso`; `authorize()` agora loga falha em `conta_revogada`/`senha_incorreta`/`2fa_invalido` (nunca em e-mail inexistente ou no passo `precisa_2fa`) e só cria `SessaoAtiva` + loga sucesso depois do segundo fator validado (quando aplicável).

**Endpoints novos**: `POST /api/usuario/2fa/iniciar` (gera segredo + QR via `qrcode`, não persiste nada), `POST /api/usuario/2fa/confirmar` (valida o código, só então gera backup codes + criptografa + persiste, retorna os códigos em texto puro uma vez), `POST /api/usuario/2fa/desativar` (exige `senhaAtual`). Log de acesso e revisão de cookies **não** ganharam endpoint GET — lidos via Prisma direto nos Server Components (mesmo padrão de sessões da Fase 1); revisão de cookies reaproveita **sem nenhuma mudança** o `POST /api/consentimento-cookies` já existente da fase de LGPD.

**UI**: `SecaoDoisFatores.tsx` (máquina de estados `inativo → configurando → backup → ativo`, QR + segredo manual + confirmação, tela de backup codes com aviso, desativar com campo de senha inline), `SecaoLogAcesso.tsx` (lista somente-leitura, motivo de falha traduzido pro usuário), `SecaoConsentimentoCookies.tsx` (mesmas 3 categorias do `BannerCookies.tsx`, lendo o cookie no mount, mostrando "última atualização" a partir do `ConsentimentoCookies` mais recente). As três entram **sempre** (sem condicional de papel) em `ConfiguracoesView.tsx`, logo após `SecaoConta`. `src/app/login/page.tsx` reescrito como formulário em 2 passos (`etapa: "credenciais" | "codigo"`).

**Testado end-to-end no navegador** (login real, banco de dev do usuário): login normal sem 2FA continuou funcionando depois da mudança em `authorize()` → ativação de 2FA: QR renderiza, gerei um código TOTP válido via script local usando a mesma lib `otpauth` (sem app autenticador físico neste ambiente) → confirmação gerou 8 códigos de backup → logout/login pediu a etapa de código → código errado (`000000`) mostrou erro e ficou na etapa 2, **sem** virar entrada fantasma de "precisa_2fa" no log → login com um código de backup funcionou e **consumiu** o código (7 de 8 restantes, confirmado no banco) → tentar reusar o mesmo backup code falhou corretamente → login normal com TOTP fresco funcionou → desativar com senha errada bloqueou ("Senha atual incorreta."), com senha certa desativou → log de acesso mostrou exatamente as 5 tentativas reais (2 sucesso, 2 falha de código, nenhuma fantasma) com dispositivo/IP/data corretos → revisão de cookies: desmarcar/marcar Analytics e salvar atualizou o cookie (`document.cookie` conferido) e disparou o POST existente com sucesso. Sem erros de console; os `[auth][error] CredentialsSignin` que aparecem no log do servidor são esperados — é o próprio Auth.js logando cada rejeição de `authorize()`, incluindo as que eu provoquei de propósito pra testar (não é bug).

**Não testado**: 2FA com um app autenticador de verdade (Google Authenticator/Authy) — só validado via geração programática do mesmo algoritmo TOTP, já que este ambiente de navegador não tem celular/app pra escanear o QR de fato; a lógica é padrão RFC 6238 e a mesma lib faz geração e validação, então o risco residual é baixo, mas vale um teste manual seu com o celular antes de confiar 100%.

**Fora de escopo desta fase** (conforme pedido): plano/cobrança com autoatendimento, aparência/marca customizável, relatório administrativo de log de acesso de todos os usuários. Também não implementado (não pedido, mas vale registrar): rate limiting/bloqueio automático após N tentativas de login falhas (o log de acesso só *mostra* as tentativas, não bloqueia sozinho); reenvio de convite/reset de 2FA por um admin em nome de outro usuário (se alguém perder o celular *e* os códigos de backup, fica de fora até o suporte intervir manualmente no banco).

---

## Fase — Trilha de Auditoria por Documento (concluída)

Objetivo: histórico append-only vinculado a cada `DocumentoGerado` individual (geração, downloads, substituições) — documentos gerados podem virar prova em relação de trabalho, então diferente do log de atividades geral (`Notificacao`, mutável), esse precisa ser imutável pela interface. Mais uma tela de timeline por documento, acessível pela empresa dona e por qualquer admin.

**Três achados no processo de explorar que mudaram o formato da entrega:**
- **Gap real (mas parcial) de versionamento de template**: `src/app/actions/salvar-template.ts` faz `update()` no mesmo `TemplateDocumento` quando `templateId` é informado — templates de origem EDITOR são editados em lugar, sem histórico (UPLOAD não tem esse problema, nunca é reescrito). Resolvido com a alternativa que o usuário já tinha sugerido: hash SHA-256 do conteúdo do template no momento da geração, guardado na própria entrada de auditoria — prova qual versão foi usada sem precisar de versionamento formal.
- **Falha de autorização pré-existente**: `GET /api/empresa/documentos/download` recebia um `caminho` cru do Storage e não conferia se o documento pertencia à empresa logada — qualquer empresa autenticada podia montar a URL e baixar documento de outra empresa. Corrigida como efeito colateral necessário (precisava do `documentoId` de qualquer forma pra saber o que auditar): rota relocalizada pra `src/app/api/documentos/[id]/download/route.ts`, agora autoriza `papel === ADMIN || empresaId bate` antes de gerar a signed URL.
- **Admin não tinha nenhum caminho de navegação até funcionários/documentos de uma empresa** — confirmado com o usuário antes de ampliar escopo: adicionada uma lista mínima (nome + cargo, sem busca/filtro) em `admin/empresas/[id]/page.tsx`, linkando pra uma página nova por funcionário que lista os documentos gerados.

**Decisão de modelo de dados**: tabela nova `AuditoriaDocumento`, separada de `Notificacao` (que é mutável — `lida` é atualizado em lugar; o requisito aqui é o oposto). `documentoGeradoId` e `usuarioId` são referências informativas, sem `@relation` — mesmo padrão já documentado no schema pra `Notificacao.entidade`/`entidadeId`: uma FK real com cascade apagaria a prova junto com o documento excluído; sem cascade, bloquearia pra sempre a exclusão de um funcionário que já gerou qualquer documento (comportamento hoje permitido). Sem FK enforced, a trilha sobrevive à exclusão do documento ou do usuário. `usuarioNome` é snapshot (não muda se a pessoa trocar de nome depois). Migration `20260725113034_add_auditoria_documento`.

**`src/lib/auditoriaDocumento.ts`** (novo): `hashConteudo()` (SHA-256), `registrarEventoAuditoria()` (defensivo, nunca lança — mesma postura de `registrarAtividade`/`registrarLogAcesso`, usado pra `DOWNLOAD`/`SUBSTITUIDO`), e `criarDocumentoGeradoComAuditoria()` — diferente dos outros dois eventos, a criação do `DocumentoGerado` **e** a entrada `GERACAO` fundadora acontecem juntas dentro de `prisma.$transaction()`: um documento nunca existe sem o registro que prova como nasceu. Fora da transação (best-effort), qualquer `DocumentoGerado` anterior do mesmo funcionário+template recebe um evento `SUBSTITUIDO` apontando pro novo — a regeneração já criava uma linha nova por padrão (confirmado lendo `baixar-todos/route.ts`, que já comentava "as anteriores continuam no banco como histórico"), só faltava instrumentar isso como evento auditável.

**Pontos instrumentados**: os dois caminhos de geração (EDITOR e UPLOAD) em `gerar-documentos/route.ts` passaram a usar `criarDocumentoGeradoComAuditoria` em vez do `documentoGerado.create` inline duplicado; a nova rota de download registra `DOWNLOAD`; `baixar-todos/route.ts` registra um `DOWNLOAD` por documento efetivamente incluído no zip.

**UI**: `ListaDocumentosGerados.tsx` (compartilhado, tabela simples com link pra cada documento — adicionado tanto em `empresa/funcionarios/[id]/page.tsx` quanto na página nova do admin, porque nenhuma das duas tinha histórico de gerações passadas antes, só a mais recente via `baixar-todos`); `DocumentoAuditoriaView.tsx` (server, cabeçalho + timeline cronológica com ícone por tipo de evento + snapshot de variáveis colapsável via `<details>` nativo, sem JS) + `BotaoBaixarDocumento.tsx` (client); páginas `empresa/documentos/[id]` (autoriza dono) e `admin/documentos/[id]` (autoriza qualquer admin, mostra nome da empresa).

**Testado end-to-end no navegador** (login real, banco de dev do usuário, funcionário de teste com histórico de 20+ documentos de sessões anteriores): documento antigo (gerado antes desta feature existir) abre com timeline vazia sem erro → baixar registra `DOWNLOAD` com sucesso, aparece na timeline → gerar de novo só "Ficha Cadastral" pro mesmo funcionário criou a entrada `GERACAO` (com `templateHash` e as 24 variáveis de `mapearVariaveis` no snapshot, confirmado direto no banco) **e** marcou `SUBSTITUIDO` em **todos** os 8 documentos anteriores desse funcionário+template (não só o mais recente — decisão consciente: tecnicamente todos deixaram de ser a versão vigente quando o novo foi gerado) → link "Ver documento novo" navega certo → tentar baixar um `documentoId` de outra empresa via fetch direto → 403 (fix de autorização confirmado); acessar a página de detalhe do mesmo documento → 404 (bloqueio também na página, não só na API) → como admin: lista nova em `admin/empresas/[id]` mostra o funcionário, navega até os documentos, abre o detalhe (mostra nome da empresa, que a versão da empresa não mostra) e consegue baixar (200 OK, sem estar vinculado à empresa) → `baixar-todos` (zip) gerou 3 entradas `DOWNLOAD` simultâneas, uma por documento incluído (confirmado no banco). Sem erros no console nem no servidor durante toda a sessão de teste.

**Não testado**: nenhum caso de falha da transação de criação em si (ex.: erro de rede no meio do `$transaction`) — a garantia é estrutural (Postgres cuida do atomic rollback), não foi forçado um cenário de falha real.

**Fora de escopo desta fase** (conforme pedido): relatórios agregados de auditoria (ex.: "todos os documentos alterados este mês"). Sistema de versionamento formal de template (histórico completo de revisões) — o hash por geração resolve a necessidade de prova sem isso. Extensão de `baixar-todos` pra admin. Bloquear exclusão de funcionário/documento que já tenha trilha de auditoria — comportamento de exclusão continua como já era; se quiser essa trava no futuro (defensável do ponto de vista jurídico — não apagar evidência), é mudança deliberada separada.

---

## Pendências abertas (ordem sugerida de prioridade)

0e. **Criar o bucket público `avatares` no Supabase Storage** (dashboard → Storage → New bucket → marcar Public) — sem isso, `POST /api/usuario/avatar` sempre falha com "Falha ao salvar a imagem no Storage." Depois de criado, testar o upload manualmente (a automação de navegador usada nesta sessão não conseguiu anexar arquivo).
0f. **Auditar contas com `emailOuLogin` sem `@`** (logins simples tipo `admin`) antes de confiar no disparo de e-mail em produção — `notificarPorEmail` engole o erro do Resend silenciosamente se o "e-mail" não for válido, então some sem aviso.
0g. **Configurar `AUTH_2FA_SECRET` no painel do Vercel** (mesmo valor usado localmente) antes do próximo deploy — sem isso, `criptografar()`/`descriptografar()` (usados pra ativar/validar 2FA) lançam erro em produção. Mesma categoria de pendência do `CRON_SECRET` abaixo.
0h. **Testar 2FA com um app autenticador de verdade** (Google Authenticator/Authy) — só foi validado nesta sessão via geração programática de código TOTP (sem celular físico no ambiente de teste). Lógica é RFC 6238 padrão, risco residual baixo, mas vale confirmar na prática.

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
