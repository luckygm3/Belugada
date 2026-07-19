# Guia de Setup + Roadmap do Projeto — Plataforma de Documentos

**Como usar este arquivo:** este documento foi feito para ser **portátil**. Salve-o no seu computador. Se em algum momento seus créditos com a Claude acabarem, você pode colar o conteúdo inteiro (ou anexar o arquivo) em qualquer outra IA — ChatGPT, Gemini, outro Claude, etc. — junto com a frase:

> "Estou seguindo este roadmap para construir minha plataforma. Estou na Fase X, Passo Y. Me ajude a continuar a partir daqui."

E a IA terá contexto suficiente para continuar exatamente de onde você parou, sem precisar reexplicar o projeto do zero.

> Nota honesta: eu (Claude) não tenho uma "memória" que se transporta entre IAs diferentes — cada IA só sabe o que está escrito na conversa ou nos arquivos que você mostra a ela. Por isso este arquivo existe: ele *é* a memória do projeto, e funciona com qualquer IA, não só comigo.

---

## Escopo confirmado do projeto

- Site institucional de divulgação + login + recuperação de senha
- Painel **Admin**: cadastro de empresas (dados de CNPJ + login/senha + templates de documento vinculados), acesso a todos os documentos gerados, notificações de atividade
- Painel **Empresa**: cadastro de funcionário → geração automática de ~30 documentos em PDF
- Admin pode **anexar documentos personalizados por empresa** (arquivo .docx com campos `[[variavel]]`), que entram junto na geração de PDF ao lado dos 30 padrão; para trocar, remove e sobe outro arquivo
- **Sem** login/acesso para o funcionário
- **Sem** simulador de gastos
- Cobrança recorrente mensal/anual com desconto no anual
- Consultoria inicial feita pela sua esposa (processo manual, fora da plataforma, define quais templates cada empresa usa)

Documento de planejamento completo (briefing + brainstorming + wireframes): `planejamento-plataforma-documentos.md` (já entregue anteriormente).

---

## FASE 0 — Preparar o computador

Você só faz isso uma vez. Depois de pronto, nunca mais precisa repetir (a não ser que troque de computador).

### 0.1 — Instalar o Node.js (motor que roda o projeto)

**Windows:**
1. Acesse **nodejs.org**
2. Baixe a versão **LTS** (recomendada, mais estável)
3. Rode o instalador, clique em "Next" em tudo, deixe as opções padrão
4. Reinicie o computador (ou pelo menos feche e abra o terminal de novo)
5. Abra o **PowerShell** (procure "PowerShell" no menu Iniciar) e digite:
   ```
   node -v
   npm -v
   ```
   Se aparecer um número de versão em cada linha (ex. `v22.x.x`), funcionou.

**macOS:**
1. Acesse **nodejs.org**
2. Baixe a versão **LTS** (arquivo `.pkg`)
3. Rode o instalador, avance em tudo
4. Abra o app **Terminal** e digite:
   ```
   node -v
   npm -v
   ```

### 0.2 — Instalar o Git (controle de versão do código)

**Windows:** baixe em **git-scm.com**, instale mantendo as opções padrão.
**macOS:** geralmente já vem instalado; se não, baixe em **git-scm.com** ou instale via `brew install git` se já tiver o Homebrew.

Verifique em qualquer terminal:
```
git --version
```

Configure sua identidade (troque pelos seus dados):
```
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
```

### 0.3 — Instalar o VS Code (onde você vai editar o código)

Baixe em **code.visualstudio.com**, instale normalmente.

Extensões recomendadas (instale pelo ícone de blocos na barra lateral esquerda do VS Code):
- **ESLint**
- **Prisma**
- **Tailwind CSS IntelliSense**
- **GitLens**

### 0.4 — Criar as contas gratuitas que você vai precisar

Todas gratuitas, criar com o mesmo e-mail para facilitar:

1. **GitHub** (github.com) — onde o código vai ficar salvo e versionado
2. **Vercel** (vercel.com) — hospedagem do site; ao criar a conta, escolha "Continue with GitHub" para já conectar
3. **Supabase** (supabase.com) — banco de dados, login e armazenamento de PDF; também dá pra entrar com GitHub
4. **Resend** (resend.com) — envio de e-mails de notificação e lembrete
5. **Mercado Pago Developers** (mercadopago.com.br/developers) — quando chegar a hora de implementar cobrança

### 0.5 — Ferramenta de IA para codar

Como você vai construir o site com apoio de IA, vale configurar isso desde já:

- **Claude Code** — trabalha direto nos arquivos do seu projeto, no terminal ou num app próprio, e consegue rodar comandos, criar arquivos e testar o código junto com você.

Deixo essa recomendação abaixo. É a opção mais natural para seguir este roadmap na prática, arquivo por arquivo.

---

## FASE 1 — Fundação do projeto

- [ ] Criar o projeto Next.js na sua máquina (`npx create-next-app@latest`)
- [ ] Subir o projeto para um repositório novo no GitHub
- [ ] Conectar o repositório na Vercel (deploy automático a cada alteração)
- [ ] Criar um projeto novo no Supabase e guardar as chaves de conexão (URL + chaves de API) num arquivo `.env.local` (nunca subir esse arquivo pro GitHub — o próprio Next.js já ignora por padrão)
- [ ] Instalar e configurar o Prisma, conectando no banco do Supabase
- [ ] Fazer o primeiro deploy "hello world" só para confirmar que Vercel + GitHub + Supabase estão todos conversando entre si

**Critério de conclusão da fase:** você abre uma URL pública (ex. `seuprojeto.vercel.app`) e vê uma página simples no ar.

---

## FASE 2 — Modelagem do banco de dados

- [ ] Criar no `schema.prisma` as tabelas: `Usuario` (admin/empresa), `Empresa`, `Funcionario`, `TemplateDocumento` (com campo `tipo`: padrão ou personalizado, e `empresa_id` opcional), `DocumentoGerado`
- [ ] Usar como referência os campos já listados nas seções 2.3, 2.4 e 2.5 do documento de planejamento (dados de CNPJ, dados de funcionário e templates)
- [ ] Rodar a primeira migration (`npx prisma migrate dev`)
- [ ] Conferir as tabelas criadas direto no painel do Supabase

**Critério de conclusão:** todas as tabelas existem no banco e você consegue ver isso visualmente no Supabase.

---

## FASE 3 — Autenticação

- [ ] Configurar Auth.js com login por e-mail/usuário + senha
- [ ] Implementar hash de senha (nunca salvar senha em texto puro)
- [ ] Implementar redirecionamento automático por papel: `admin` → `/admin`, `empresa` → `/empresa`
- [ ] Implementar fluxo de recuperação de senha (solicitar → e-mail com link → redefinir)
- [ ] Proteger as rotas `/admin/*` e `/empresa/*` para que só o papel correto acesse

**Critério de conclusão:** você consegue criar um usuário admin de teste, fazer login, deslogar, e testar o "esqueci minha senha" recebendo o e-mail de verdade.

---

## FASE 4 — Página institucional

- [ ] Montar a landing page (hero, como funciona, planos, FAQ, rodapé) seguindo o wireframe da seção 3.1
- [ ] Montar o menu de navegação responsivo (vira hambúrguer no mobile)
- [ ] Implementar o banner de cookies
- [ ] Montar a página de FAQ com acordeão
- [ ] Adicionar botão/link do WhatsApp

**Critério de conclusão:** site público navegável e responsivo, sem nenhuma área logada ainda.

---

## FASE 5 — Painel Admin: cadastro de empresas

- [ ] Tela de cadastro de empresa em etapas (CNPJ → revisão dos dados → acesso → plano → templates vinculados), conforme seção 3.5
- [ ] Integrar a busca automática de dados via BrasilAPI a partir do CNPJ
- [ ] Implementar upload dos templates padrão (os ~30 documentos, arquivos que a sua esposa vai fornecer) e salvar no Storage do Supabase
- [ ] Implementar upload de **documentos personalizados por empresa** (.docx com `[[variaveis]]`): ao subir o arquivo, rodar uma varredura simples de texto (regex) procurando o padrão `[[algo]]` e exibir a lista encontrada na tela para conferência
- [ ] Implementar o botão de remover template personalizado (para "trocar", o fluxo é remover + subir novo)
- [ ] Ao concluir o cadastro, gerar login/senha e enviar por e-mail para a empresa
- [ ] Dashboard do admin com cards de resumo (empresas ativas, funcionários cadastrados, documentos pendentes)

**Critério de conclusão:** admin consegue cadastrar uma empresa de teste do zero e essa empresa recebe as credenciais por e-mail.

---

## FASE 6 — Painel Empresa: cadastro de funcionário

- [ ] Formulário em etapas (dados pessoais → endereço → dados trabalhistas → dependentes → revisão), conforme seção 3.7
- [ ] Validação de CPF em tempo real
- [ ] Preenchimento automático de endereço via CEP (ViaCEP)
- [ ] Listagem de funcionários cadastrados com status de documentação

**Critério de conclusão:** empresa de teste consegue cadastrar um funcionário completo e ver ele na lista.

---

## FASE 7 — Motor de geração de documentos

Esta é a fase mais importante e a que exige mais atenção da sua esposa (definição do conteúdo dos ~30 documentos).

- [ ] Reunir com sua esposa o conteúdo/modelo de cada um dos ~30 documentos padrão
- [ ] Criar os templates padrão em `@react-pdf/renderer`, com campos dinâmicos vindos dos dados do funcionário/empresa
- [ ] Implementar o pipeline dos **documentos personalizados** (.docx enviados por empresa): usar `docxtemplater` para substituir os `[[campos]]` pelos dados reais do funcionário, gerando um `.docx` preenchido
- [ ] Implementar a conversão do `.docx` preenchido em PDF (via API do CloudConvert no free tier, ou Gotenberg se já estiver hospedado)
- [ ] Implementar o botão "Gerar documentos" que dispara a geração de todos de uma vez (os ~30 padrão + os personalizados daquela empresa)
- [ ] Implementar tela de progresso ("Gerando documentos... 12/30")
- [ ] Salvar cada PDF gerado no Storage do Supabase, vinculado ao funcionário
- [ ] Implementar download individual e download em lote (.zip)
- [ ] Dar ao admin acesso de leitura a todos os documentos de qualquer empresa

**Critério de conclusão:** ao cadastrar um funcionário de teste, os ~30 PDFs são gerados corretamente com os dados certos, e tanto a empresa quanto o admin conseguem baixá-los.

### ⚠️ Pendência reaberta: conversão para PDF

Duas tentativas foram feitas depois da Fase 7 validada, e o código resultante foi **revertido via git** por ter ficado bugado — voltamos ao estado "documento gerado em `.docx`, sem conversão pra PDF ainda". Lições pra próxima tentativa:

1. **CloudConvert** foi descartado primeiro: plano gratuito é de só 10 conversões/dia, inviável até pra testes.
2. **Gotenberg auto-hospedado no Render** (free tier) foi a segunda tentativa — a ideia continua sendo a certa (sem limite diário, self-hosted), mas o setup deu erro de "Ran out of memory" porque a imagem `gotenberg/gotenberg:8` carrega Chromium + LibreOffice juntos, estourando os 512MB do plano grátis. A correção identificada (não testada até o fim): usar a imagem `gotenberg/gotenberg:8-libreoffice` (só LibreOffice, mais leve) e remover a flag `--libreoffice-auto-start=true` do comando de inicialização.
3. Também foi iniciado um widget global de status de geração (Context do React + componente flutuante), que ficou no meio da implementação quando o revert aconteceu.

**Recomendação pra próxima tentativa:** implementar em passos menores, com `git commit` depois de cada pedaço funcional (ex: commit só depois de confirmar que o Gotenberg deployou "Live" no Render, antes de mexer no código do Next.js) — isso evita ter que reverter várias coisas de uma vez quando um pedaço quebra.

---

## FASE 7B — Editor de templates no site (arrastar variáveis)

Adicionado depois da Fase 7 já validada com ciclo completo funcionando via upload de `.docx`. Objetivo: permitir que a Beatriz crie templates **direto no site**, sem precisar do Word, usando um editor de texto com barra de ferramentas (negrito, itálico, tamanho, cor) e uma barra lateral de variáveis que ela arrasta pro meio do texto.

- [ ] Instalar o **TipTap** (`@tiptap/react`, `@tiptap/starter-kit`, extensões de cor/fonte) — biblioteca gratuita de editor de texto rico
- [ ] Criar uma extensão customizada do TipTap pra representar a "variável" como um elemento visual (chip/pílula), não como texto solto
- [ ] Montar a tela: editor no centro + barra lateral com a lista de variáveis disponíveis (mesma lista da seção 5 do tutorial da Beatriz), suporte a arrastar-e-soltar pro meio do texto
- [ ] Adicionar campo no banco (`TemplateDocumento`) pra guardar o conteúdo do editor (formato JSON do TipTap) e um campo `origem` (`UPLOAD` ou `EDITOR`)
- [ ] Botão "Salvar template" que grava esse conteúdo, sem precisar de nenhum arquivo `.docx`
- [ ] No motor de geração (Fase 7): criar o segundo caminho — quando o template é `origem: EDITOR`, substitui as variáveis no JSON e converte o resultado em PDF (via a mesma conversão HTML→PDF que já estava prevista pra fase de PDF final)

**Critério de conclusão:** a Beatriz consegue criar um template do zero no site, arrastando pelo menos 2 variáveis diferentes pro texto, salvar, e gerar um documento de teste com esse template pra um funcionário — sem nunca abrir o Word.

---

## FASE 8 — Notificações e lembretes

- [ ] Notificação ao admin quando uma empresa cadastra um funcionário (e-mail + sino no painel)
- [ ] Notificação de falha na geração de algum documento
- [ ] Lembretes automáticos de prazo (ex. renovação de contrato, validade de documento) via e-mail e banner no painel

**Critério de conclusão:** você cadastra um funcionário de teste e recebe, de fato, o e-mail de notificação.

---

## FASE 9 — Cobrança recorrente

- [ ] Integrar Mercado Pago (assinatura mensal/anual)
- [ ] Vincular status de pagamento à empresa (ativo, atrasado, cancelado)
- [ ] Bloquear/avisar acesso da empresa em caso de inadimplência (regra a definir com sua esposa)

**Critério de conclusão:** consegue simular uma assinatura de teste no sandbox do Mercado Pago e ver o status refletido no painel admin.

---

## FASE 10 — Polimento final

- [ ] Revisão de responsividade em todas as telas (mobile e desktop)
- [ ] Revisão de mensagens de erro e validações (CPF/CNPJ inválido, campos obrigatórios etc.)
- [ ] Revisão de segurança: rotas protegidas, dados sensíveis criptografados, logs de auditoria básicos
- [ ] Teste ponta a ponta: cadastro de empresa → cadastro de funcionário → geração de documentos → download → notificação

---

## FASE 11 — Lançamento

- [ ] Deploy final em produção
- [ ] Teste com uma empresa piloto real (com acompanhamento da sua esposa)
- [ ] Ajustes finais com base no feedback da empresa piloto
- [ ] Início efetivo das vendas

---

## Como continuar este roadmap quando os créditos acabarem

1. Baixe/mantenha este arquivo salvo localmente.
2. Marque as caixinhas `[ ]` conforme for concluindo cada passo (isso vira seu histórico de progresso).
3. Ao abrir qualquer outra IA, cole o conteúdo deste arquivo (ou anexe-o) e diga em qual Fase/Passo você está.
4. Sempre que fizer uma decisão importante que muda o escopo (como fizemos hoje ao remover simulador e acesso do funcionário), **edite este arquivo** para refletir a decisão — assim ele nunca fica desatualizado.
