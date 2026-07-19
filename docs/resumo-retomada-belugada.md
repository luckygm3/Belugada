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

## Pendências abertas (ordem sugerida de prioridade)

1. **Testar o cadastro de empresa de ponta a ponta** com a nova rota `api/admin/empresas/route.ts` — confirmar se `Papel` aceita exatamente o literal `"EMPRESA"` (se o TS reclamar, o enum tem outro nome de valor).
2. **Conversão HTML/DOCX → PDF** (Gotenberg) — pendência mais antiga e mais importante, compartilhada entre Fase 7 (upload) e Fase 7B (editor). Duas tentativas anteriores falharam:
   - CloudConvert: descartado (10 conversões/dia no free tier).
   - Gotenberg self-hosted no Render: deploy deu "Ran out of memory" (imagem `gotenberg/gotenberg:8` carrega Chromium+LibreOffice, estoura 512MB do free tier). Correção identificada e **não testada**: trocar para imagem `gotenberg/gotenberg:8-libreoffice` (só LibreOffice) e remover a flag `--libreoffice-auto-start=true`.
   - Recomendação: implementar em passos pequenos com commit após cada parte funcional (ex. commit só depois do Gotenberg aparecer "Live" no Render, antes de tocar no código Next.js).
3. **Botão de remover template personalizado** na biblioteca (`templates-padrao/page.tsx`) — não implementado, incerteza se a rota de delete existente aceita `tipo: PERSONALIZADO`.
4. **Vínculo template personalizado ↔ empresa específica** — hoje templates do editor ficam soltos (`empresaId: null`); falta decidir/implementar onde essa vinculação acontece (provavelmente dentro da tela de edição de empresa, reaproveitando ou ajustando `admin/empresas/[id]/templates/route.ts`).
5. **Flag `naoEncontrado` do fallback de CNPJ** — o front (`nova/page.tsx`) hoje só checa `!res.ok` e mostra "CNPJ não encontrado", sem liberar preenchimento manual. Se quiser esse UX melhorado, precisa ajustar o form.
6. Seguir roadmap normal: Fase 8 (Notificações), Fase 9 (Cobrança Mercado Pago), Fase 10 (Polimento), Fase 11 (Lançamento) — todas ainda não iniciadas.

---

## Preferência de trabalho do usuário (aplicar sempre)

- Explicar o **raciocínio de forma breve antes** do código (não despejar tudo de uma vez sem contexto) — pedido explícito pra economizar tokens/tempo.
- Ao criar **arquivo novo**: sempre mandar primeiro o comando de terminal (`New-Item ...`, sintaxe **PowerShell**, o usuário está no Windows) pra criar o arquivo, depois o código completo pra colar — nunca só "cole isso no caminho X".
- Ao editar arquivo existente com mudança pontual: pode indicar trecho a trocar, mas ser explícito sobre em qual arquivo/bloco exatamente (já houve confusão sobre "qual JSX" — sempre nomear o arquivo).
- Evitar assumir nomes de campos/enums que não foram confirmados — pedir o arquivo real (schema, route, component) antes de escrever código que depende deles, pra não gerar rodadas de erro de tipo.
- Ao final de cada fase/etapa relevante concluída, fechar a resposta com resumo do escopo do projeto + fase atual + próximo passo (o usuário alterna entre múltiplas IAs por limitação de orçamento).
