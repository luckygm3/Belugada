# Planejamento — Ajustes Finos, Funcional e Estética (Belugada)

**Status:** só planejamento, nada implementado ainda. Este arquivo é ponto de partida pra próximas sessões — pode ser colado em outra IA junto com o `resumo-retomada-belugada.md` se os créditos acabarem no meio da execução.

---

## Bloco 1 — Funcional

### 1.1 Validação de CPF/CNPJ em tempo real
**Abordagem:** validação de dígito verificador é matemática pura (não precisa de API), roda no `onChange` do campo com debounce (~400ms) pra não validar a cada tecla. Assim que os 11/14 dígitos forem preenchidos, calcula o dígito verificador local e mostra ✅/❌ na hora — sem esperar submit. Pra checar duplicata (CPF/CNPJ já cadastrado), aí sim precisa de uma consulta ao banco, também com debounce, num campo `disabled` até validar.
**Onde entra:** `nova/page.tsx` (empresa) e o formulário de cadastro de funcionário (`empresa/funcionarios/novo/page.tsx`, ainda não visto por mim).
**Dependência:** nenhuma lib externa necessária pro cálculo do dígito verificador (é um algoritmo conhecido, dá pra implementar puro).

### 1.2 Autopreenchimento do CNPJ na mesma tela (sem etapa separada)
**Abordagem:** hoje é Etapa 1 (buscar) → Etapa 2 (revisão, só leitura) → Etapa 3. A ideia é fundir 1+2: assim que a busca retornar, os campos já aparecem preenchidos mas **editáveis** (como campos de formulário normais, não texto estático), no mesmo componente. Praticamente reaproveita a Etapa 2 atual, só trocando `<p>{valor}</p>` por `<input value={valor} onChange={...} />`.
**Efeito colateral a decidir:** o `finalizar()` hoje manda os dados direto de `dadosEmpresa` (state populado pela API); se virar editável, precisa de um state próprio por campo, ou um objeto único que atualiza por chave.

### 1.3 Remover upload de documento exclusivo na tela de edição de empresa
**Abordagem:** simples remoção do `<UploadTemplateForm />` da página `admin/empresas/[id]/page.tsx`, deixando só as duas seções de seleção (padrão + personalizado da biblioteca). O componente `UploadTemplateForm.tsx` e a rota por trás dele (`admin/empresas/[id]/templates/route.ts`) podem ficar no código sem uso, ou ser removidos — a decidir se algum dia esse "exclusivo por upload direto" ainda tem utilidade ou se biblioteca cobre 100% do caso de uso agora.

### 1.4 Aba "precisa de um novo documento, entre em contato"
**Abordagem:** um bloco fixo (card ou banner) na área da empresa-cliente (`app/empresa/...`) com um link `mailto:` ou WhatsApp (já existe `BotaoWhatsapp.tsx` no projeto — pode reaproveitar o mesmo padrão/número). Não depende de nenhuma lógica nova, é conteúdo estático + link.

### 1.5 Botão "baixar todos" (.zip)
**Abordagem:** nova rota de API que busca todos os `DocumentoGerado` de um funcionário, baixa cada arquivo do Supabase Storage, empacota num zip em memória (lib `jszip` ou `archiver`) e devolve como download direto. Zip é mais simples e universal que .rar (rar precisa de lib paga/licenciada — não recomendo).
**Onde entra:** botão novo dentro de `GerarDocumentosForm.tsx`, ao lado da lista de resultados.

### 1.6 Validação completa dos formulários (nome só letras, telefone só número, etc.)
**Abordagem:** recomendo migrar pra uma lib de schema validation (ex. `zod`) — define uma vez o formato esperado de cada campo (regex, tamanho, obrigatoriedade) e reaproveita tanto no client (feedback imediato) quanto no server (segurança real, já que validação só no client nunca é suficiente). Isso cobre CPF, RG, telefone, nome, CEP, etc. de forma centralizada, em vez de checagem solta em cada input.
**Escopo:** toca vários formulários (cadastro empresa, cadastro funcionário) — é o item mais trabalhoso da lista funcional.

### 1.7 Relatório organizado dos dados da empresa (visão admin)
**Abordagem:** a tela `admin/empresas/[id]/page.tsx` já mostra um resumo básico (plano, status, funcionários, cidade). A ideia é expandir isso pra exibir **todos** os campos que o model `Empresa` já tem e hoje ficam sem uso na tela: `dataAbertura`, `situacaoCadastral`, `naturezaJuridica`, `capitalSocial`, `porteEmpresa`, `cnaePrincipal`, `cnaesSecundarios`, `quadroSocietario` (JSON — provavelmente uma lista de sócios, precisa virar tabelinha), `responsavelNome/Cargo/Telefone/Email`. É basicamente um "raio-x" da empresa, organizado em seções (Dados cadastrais / Dados fiscais / Responsável / Quadro societário).
**Nota:** só funciona se a BrasilAPI/ReceitaWS estiver de fato retornando esses campos hoje — vale conferir se `capitalSocial`, `quadroSocietario` etc. já chegam preenchidos no banco ou se ficam `null` (a rota atual de CNPJ pode não estar mapeando todos esses campos ainda).

### 1.8 Máscara de moeda no campo de salário (auto-formatação tipo Pix)
**Abordagem:** input controlado que formata o valor conforme o usuário digita (formato `R$ 1.234,56`), guardando o valor numérico real por trás. Dá pra fazer sem lib (função de máscara simples) ou com uma lib pequena tipo `react-number-format`. Baixo esforço, alto impacto de percepção de qualidade.

---

## Bloco 2 — Estética (site institucional)

### 2.1 Biblioteca de animação
Você citou GSAP, anime.js e motion.dev (Framer Motion) juntos — **recomendo escolher uma principal**, não as três: elas se sobrepõem em função e usar mais de uma aumenta bundle size e complexidade de manutenção à toa. Como o projeto já é React/Next:
- **Motion (ex-Framer Motion)** é o mais natural pro ecossistema React — API declarativa, ótimo para transições de página, entrada de elementos, hover states.
- **GSAP** é mais poderoso para timelines complexas e scroll-triggered animations (ex. elementos que se movem conforme o scroll) — vale a pena se a landing page tiver uma pegada mais "storytelling" com múltiplas cenas.
- **Anime.js** é leve mas hoje redundante se uma das outras duas já estiver no projeto.

Minha sugestão: **Motion como base** (integração React mais limpa) + **GSAP só se** a landing tiver seções de scroll-story elaboradas que Motion sozinho não dá conta bem. Isso é uma decisão a tomar quando chegarmos nessa fase — dá pra ver referências visuais antes de decidir.

### 2.2 Paleta de cores (seriedade + tranquilidade)
Para um produto jurídico/trabalhista, o direcionamento visual convencional (e testado) é:
- **Azul marinho / azul petróleo** como cor dominante — associado a confiança, estabilidade, profissionalismo (é a cor mais usada por escritórios de advocacia e fintechs sérias no mundo todo).
- **Verde-azulado (teal) ou verde escuro** como alternativa/complemento — passa segurança sem ser "corporativo frio" demais.
- **Cinza-chumbo/slate** para textos e fundos neutros.
- Evitar vermelho/laranja como cor dominante (remete a urgência/alerta) e evitar tons muito saturados/vibrantes (remetem a produto "descontraído", não é o tom certo pra área trabalhista/jurídica).
- Um accent color (terceira cor, usada com moderação em botões/CTAs) pode ser um dourado suave ou um azul mais vibrante — dá o toque de "premium" sem perder a seriedade.

Isso pode virar uma etapa própria: eu monto 2-3 opções de paleta com exemplos visuais antes de aplicar no código.

### 2.3 Logo em SVG + animação
Sim, totalmente viável. Se você vetorizar a logo (Illustrator, Figma, ou até Inkscape gratuito), dá pra fazer:
- **Draw-on animation** (a logo "se desenha" na tela, efeito de traço), usando `stroke-dasharray`/`stroke-dashoffset` animado — clássico e elegante para entrada de página.
- **Morphing** entre estados (ex. logo muda sutilmente ao rolar a página ou no hover).
- **Micro-interações** (partes da logo reagindo ao mouse/scroll).
- Isso combina diretamente com GSAP (que tem plugins específicos pra draw-on, tipo `DrawSVGPlugin`, embora alguns plugins GSAP premium sejam pagos — vale checar licença) ou Motion (que também anima SVG paths nativamente, sem plugin pago).

**Pré-requisito:** preciso do arquivo `.svg` real da logo quando estiver pronta pra eu avaliar a estrutura dos paths e sugerir a animação mais adequada.

---

## Bloco 3 — Pergunta em aberto (não é ajuste, é decisão de escopo)

Você mencionou **"integrar o Claude numa versão pro dentro do meu código"** — isso muda bastante dependendo da intenção. Preciso entender melhor antes de incluir no planejamento:
- É um **assistente/chat de suporte** pro cliente-empresa dentro da plataforma (ex. tira dúvida sobre como preencher um campo)?
- É pra **automatizar parte da geração de conteúdo** (ex. a Beatriz descrever o documento em texto livre e o Claude ajudar a estruturar o template com variáveis)?
- É algo voltado pro **site institucional** (ex. chatbot de vendas/FAQ pra visitante)?
- Outra coisa?

Isso teria custo de API (uso pago por token, fora do "tudo em free tier" que rege o projeto hoje) e implicações de segurança (chave de API precisa ficar só no backend, nunca exposta no client) — vale conversarmos o objetivo específico antes de desenhar a arquitetura.

---

## Ordem sugerida de execução

Prioridade por "impacto perceptível x esforço":

1. Máscara de moeda (1.8) — baixo esforço, visual imediato
2. Remover upload exclusivo da edição de empresa (1.3) — é praticamente só remoção
3. Aba de contato "precisa de novo documento" (1.4) — baixo esforço
4. Validação de CPF/CNPJ em tempo real (1.1) — médio esforço, alto valor de UX
5. Autopreenchimento editável do CNPJ (1.2) — médio esforço
6. Botão "baixar todos" em .zip (1.5) — médio esforço
7. Relatório organizado da empresa (1.7) — médio esforço, depende de conferir se os dados já vêm preenchidos
8. Validação completa dos formulários com zod (1.6) — maior esforço, mas é uma base importante antes de lançar pra clientes reais
9. Estética (Bloco 2) — fica pro final, depois que o funcional estiver sólido, e depende de você ter a logo vetorizada pronta

**Não incluí ainda na ordem:** a integração com Claude (Bloco 3), porque depende da resposta sobre o objetivo.
