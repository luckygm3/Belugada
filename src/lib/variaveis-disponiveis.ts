/**
 * Catálogo de variáveis — Belugada / PACTA.
 *
 * Fonte única de verdade sobre cada variável [[chave]] usada nos 17 templates
 * (D03–D16, D18, D19, D20). Consumido por:
 * - mapearVariaveis.ts — resolve o valor e aplica o formatador na geração
 * - schemas/documentoDinamico.ts — monta o Zod do formulário de emissão
 * - template-editor.tsx — sidebar de variáveis arrastáveis do editor
 */

export type TipoVariavel =
  | "texto"
  | "texto_longo"
  | "data"
  | "hora"
  | "numero"
  | "moeda"
  | "percentual"
  | "booleano"
  | "selecao"
  | "lista"
  | "cpf"
  | "cnpj"
  | "cep"
  | "telefone"
  | "placa";

export type EscopoVariavel =
  | "empresa" // Empresa — preenchido uma vez, reaproveitado sempre
  | "funcionario" // Funcionario
  | "contrato" // Funcionario, mas só faz sentido nos contratos
  | "documento" // digitado no formulário de emissão; sem origem no banco
  | "sistema"; // calculado na geração

export type Formatador =
  | "dataExtenso" // 25 de julho de 2026
  | "dataCurta" // 25/07/2026
  | "hora" // 08:30
  | "moeda" // R$ 1.500,00
  | "moedaExtenso" // R$ 1.500,00 (mil e quinhentos reais)
  | "numeroExtenso" // 02 (duas)
  | "percentualExtenso" // 6% (seis por cento)
  | "cpf"
  | "cnpj"
  | "cep"
  | "telefone"
  | "placa"
  | "titulo"; // BELUGADA SERVICOS LTDA -> Belugada Serviços Ltda

export interface VariavelDisponivel {
  key: string; // usado como [[key]]
  label: string; // label no formulário / editor
  tipo: TipoVariavel;
  escopo: EscopoVariavel;
  origem?: string; // caminho no Prisma, quando houver ("derivada" = calculado)
  formatador?: Formatador;
  genero?: "m" | "f"; // só para numeroExtenso
  opcoes?: string[]; // só para tipo 'selecao'
  itens?: string[]; // só para tipo 'lista' (campos de cada linha)
  obrigatoria?: boolean;
  /** true = nunca aparece no formulário de emissão; o valor é calculado a partir de outras variáveis. */
  calculada?: boolean;
  documentos: string[]; // IDs dos modelos que usam (informativo)
  nota?: string;
}

/* ------------------------------------------------------------------ *
 * EMPRESA
 * ------------------------------------------------------------------ */
export const VARIAVEIS_EMPRESA: VariavelDisponivel[] = [
  { key: "empresa_razao_social", label: "Razão social", tipo: "texto", escopo: "empresa", origem: "Empresa.razaoSocial", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"], nota: "Vem da Receita em caixa alta; avaliar formatador \"titulo\"" },
  { key: "empresa_nome_fantasia", label: "Nome fantasia", tipo: "texto", escopo: "empresa", origem: "Empresa.nomeFantasia", documentos: [] },
  { key: "empresa_cnpj", label: "CNPJ", tipo: "cnpj", escopo: "empresa", origem: "Empresa.cnpj", formatador: "cnpj", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"] },
  { key: "empresa_logradouro", label: "Logradouro da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.logradouro", documentos: ["D10", "D13", "D14", "D15", "D16", "D20"] },
  { key: "empresa_numero", label: "Número da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.numero", documentos: ["D10", "D13", "D14", "D15", "D16", "D20"], nota: "Hoje o endereço da empresa sai sem número" },
  { key: "empresa_complemento", label: "Complemento da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.complemento", documentos: [] },
  { key: "empresa_bairro", label: "Bairro da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.bairro", documentos: ["D10", "D13", "D14", "D15", "D16", "D20"] },
  { key: "empresa_cidade", label: "Cidade da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.cidade", documentos: ["D10", "D13", "D14", "D15", "D16", "D20"], nota: "NÃO usar como praça de assinatura — ver cidade_assinatura" },
  { key: "empresa_uf", label: "UF da sede", tipo: "texto", escopo: "empresa", origem: "Empresa.uf", documentos: [] },
  { key: "empresa_cep", label: "CEP da sede", tipo: "cep", escopo: "empresa", origem: "Empresa.cep", formatador: "cep", documentos: ["D10", "D13", "D14", "D15", "D16", "D20"] },
  { key: "empresa_endereco_completo", label: "Endereço completo da empresa", tipo: "texto", escopo: "empresa", origem: "derivada", documentos: [] },
  { key: "empresa_representante_nome", label: "Representante legal — nome", tipo: "texto", escopo: "empresa", origem: "Empresa.representanteLegalNome", documentos: ["D20"], nota: "Não reusar responsavelNome (contato comercial)" },
  { key: "empresa_representante_cargo", label: "Representante legal — cargo", tipo: "texto", escopo: "empresa", origem: "Empresa.representanteLegalCargo", documentos: ["D20"] },
  { key: "empresa_representante_cpf", label: "Representante legal — CPF", tipo: "cpf", escopo: "empresa", origem: "Empresa.representanteLegalCpf", formatador: "cpf", documentos: ["D20"] },
];

/* ------------------------------------------------------------------ *
 * FUNCIONÁRIO
 * ------------------------------------------------------------------ */
const DOCS_QUALIF = ["D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"];

export const VARIAVEIS_FUNCIONARIO: VariavelDisponivel[] = [
  { key: "funcionario_nome", label: "Nome completo", tipo: "texto", escopo: "funcionario", origem: "Funcionario.nomeCompleto", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"] },
  { key: "funcionario_cpf", label: "CPF", tipo: "cpf", escopo: "funcionario", origem: "Funcionario.cpf", formatador: "cpf", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"] },
  { key: "funcionario_nacionalidade", label: "Nacionalidade", tipo: "texto", escopo: "funcionario", origem: "Funcionario.nacionalidade", documentos: DOCS_QUALIF },
  { key: "funcionario_estado_civil", label: "Estado civil", tipo: "selecao", escopo: "funcionario", origem: "Funcionario.estadoCivil", opcoes: ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)", "união estável"], documentos: DOCS_QUALIF },
  { key: "funcionario_profissao", label: "Profissão (qualificação civil)", tipo: "texto", escopo: "funcionario", origem: "Funcionario.cargo", documentos: DOCS_QUALIF, nota: "Default = cargo, com override manual" },
  { key: "funcionario_cargo", label: "Cargo contratado", tipo: "texto", escopo: "contrato", origem: "Funcionario.cargo", documentos: ["D19"] },
  { key: "funcionario_ctps_numero", label: "CTPS — número", tipo: "texto", escopo: "funcionario", origem: "Funcionario.ctpsNumero", documentos: DOCS_QUALIF },
  { key: "funcionario_ctps_serie", label: "CTPS — série", tipo: "texto", escopo: "funcionario", origem: "Funcionario.ctpsSerie", documentos: DOCS_QUALIF },
  { key: "funcionario_endereco_completo", label: "Endereço completo", tipo: "texto", escopo: "funcionario", origem: "derivada", documentos: DOCS_QUALIF },
  { key: "funcionario_logradouro", label: "Logradouro", tipo: "texto", escopo: "funcionario", origem: "Funcionario.logradouro", documentos: ["D11"] },
  { key: "funcionario_numero", label: "Número", tipo: "texto", escopo: "funcionario", origem: "Funcionario.numero", documentos: ["D11"] },
  { key: "funcionario_complemento", label: "Complemento", tipo: "texto", escopo: "funcionario", origem: "Funcionario.complemento", documentos: ["D11"] },
  { key: "funcionario_bairro", label: "Bairro", tipo: "texto", escopo: "funcionario", origem: "Funcionario.bairro", documentos: ["D11"] },
  { key: "funcionario_cidade", label: "Cidade", tipo: "texto", escopo: "funcionario", origem: "Funcionario.cidade", documentos: ["D11"] },
  { key: "funcionario_uf", label: "UF", tipo: "texto", escopo: "funcionario", origem: "Funcionario.uf", documentos: ["D11"] },
  { key: "funcionario_cep", label: "CEP", tipo: "cep", escopo: "funcionario", origem: "Funcionario.cep", formatador: "cep", documentos: ["D11"] },
  { key: "funcionario_telefone", label: "Telefone", tipo: "telefone", escopo: "funcionario", origem: "Funcionario.telefone", formatador: "telefone", documentos: ["D11"] },
  { key: "funcionario_data_admissao", label: "Data de admissão", tipo: "data", escopo: "contrato", origem: "Funcionario.dataAdmissao", formatador: "dataCurta", documentos: [], nota: "Não aparece em nenhum dos 17 modelos atuais" },
  { key: "funcionario_rg", label: "RG", tipo: "texto", escopo: "funcionario", origem: "Funcionario.rg", documentos: [] },
  { key: "funcionario_pis_nis", label: "PIS/NIS", tipo: "texto", escopo: "funcionario", origem: "Funcionario.pisNis", documentos: [] },
  { key: "funcionario_matricula", label: "Matrícula interna", tipo: "texto", escopo: "funcionario", origem: "Funcionario.matriculaInterna", documentos: [] },
];

/* ------------------------------------------------------------------ *
 * SISTEMA — resolvidas na geração, sem formulário
 * ------------------------------------------------------------------ */
export const VARIAVEIS_SISTEMA: VariavelDisponivel[] = [
  { key: "cidade_assinatura", label: "Praça de assinatura", tipo: "texto", escopo: "sistema", origem: "Empresa.cidade (default)", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"] },
  { key: "data_assinatura", label: "Data do documento", tipo: "data", escopo: "sistema", origem: "data da geração (default)", formatador: "dataExtenso", obrigatoria: true, documentos: ["D03", "D04", "D05", "D06", "D07", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D18", "D19", "D20"] },
  { key: "documento_vias_quantidade", label: "Quantidade de vias", tipo: "numero", escopo: "sistema", origem: "fixo (2 vias)", formatador: "numeroExtenso", genero: "f", documentos: ["D10", "D13", "D19", "D20"], nota: "Sem campo de override nesta fase — default fixo em 2" },
];

/* ------------------------------------------------------------------ *
 * DOCUMENTO — campos digitados no formulário de emissão
 * ------------------------------------------------------------------ */
export const VARIAVEIS_DOCUMENTO: VariavelDisponivel[] = [
  // Testemunhas e recusa
  { key: "houve_recusa_assinatura", label: "Empregado recusou-se a assinar", tipo: "booleano", escopo: "documento", documentos: ["D03", "D04", "D05"] },
  { key: "testemunha_1_nome", label: "Testemunha 1 — nome", tipo: "texto", escopo: "documento", documentos: ["D03", "D04", "D05"] },
  { key: "testemunha_1_cpf", label: "Testemunha 1 — CPF", tipo: "cpf", escopo: "documento", formatador: "cpf", documentos: ["D03", "D04", "D05"] },
  { key: "testemunha_2_nome", label: "Testemunha 2 — nome", tipo: "texto", escopo: "documento", documentos: ["D03", "D04", "D05"] },
  { key: "testemunha_2_cpf", label: "Testemunha 2 — CPF", tipo: "cpf", escopo: "documento", formatador: "cpf", documentos: ["D03", "D04", "D05"] },

  // Disciplinar
  { key: "ocorrencia_descricao", label: "Descrição da ocorrência", tipo: "texto_longo", escopo: "documento", obrigatoria: true, documentos: ["D04", "D05"] },
  { key: "ocorrencia_data", label: "Data da ocorrência", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D04", "D05"] },
  { key: "ocorrencia_local", label: "Local da ocorrência", tipo: "texto", escopo: "documento", documentos: ["D04", "D05"] },
  { key: "medida_anterior_tipo", label: "Medida disciplinar anterior", tipo: "selecao", escopo: "documento", opcoes: ["nenhuma", "advertência verbal", "advertência escrita", "suspensão"], documentos: ["D04", "D05"] },
  { key: "medida_anterior_data", label: "Data da medida anterior", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D04", "D05"] },
  { key: "suspensao_dias", label: "Dias de suspensão", tipo: "numero", escopo: "documento", formatador: "numeroExtenso", genero: "m", documentos: ["D05"] },
  { key: "suspensao_data_inicio", label: "Início da suspensão", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D05"] },
  { key: "suspensao_data_retorno", label: "Retorno ao trabalho", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D05"] },

  // Descontos / danos
  { key: "infracao_tipo", label: "Tipo de infração", tipo: "texto", escopo: "documento", documentos: ["D03"] },
  { key: "infracao_descricao", label: "Descrição do fato", tipo: "texto_longo", escopo: "documento", documentos: ["D03"] },
  { key: "veiculo_placa", label: "Placa do veículo", tipo: "placa", escopo: "documento", formatador: "placa", documentos: ["D03"] },
  { key: "dano_valor_total", label: "Valor total do prejuízo", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D03"] },
  { key: "desconto_parcelas_quantidade", label: "Número de parcelas", tipo: "numero", escopo: "documento", formatador: "numeroExtenso", genero: "f", documentos: ["D03"] },
  { key: "desconto_parcela_valor", label: "Valor de cada parcela", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D03"] },

  // Vale-transporte / deslocamento
  { key: "vt_opcao", label: "Opção do empregado", tipo: "selecao", escopo: "documento", opcoes: ["ADERIR", "NAO_ADERIR"], obrigatoria: true, documentos: ["D11"] },
  { key: "vt_percentual_desconto", label: "Percentual de desconto do VT", tipo: "percentual", escopo: "documento", formatador: "percentualExtenso", documentos: ["D12"], nota: "Teto legal de 6%" },
  { key: "trajeto_linhas", label: "Linhas utilizadas", tipo: "lista", escopo: "documento", itens: ["linha", "valor_passagem", "quantidade", "total_dia"], documentos: ["D06"], nota: "total_dia é calculado (valor_passagem × quantidade), não digitado" },
  { key: "trajeto_total_diario", label: "Total diário (ida + volta)", tipo: "moeda", escopo: "documento", formatador: "moeda", calculada: true, documentos: ["D06"], nota: "Calculado a partir de trajeto_linhas — sem campo próprio no formulário" },
  { key: "ajuda_custo_valor", label: "Valor da ajuda de custo", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D18"] },

  // Seguro de vida
  { key: "seguro_valor_mensal", label: "Valor mensal do seguro", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D14"] },
  { key: "seguro_valor_custeado_empresa", label: "Parcela custeada pela empresa", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D14"] },
  { key: "seguro_apolice_numero", label: "Número da apólice", tipo: "texto", escopo: "documento", documentos: ["D14"] },
  { key: "seguradora_nome", label: "Seguradora — razão social", tipo: "texto", escopo: "documento", documentos: ["D14"] },
  { key: "seguradora_cnpj", label: "Seguradora — CNPJ", tipo: "cnpj", escopo: "documento", formatador: "cnpj", documentos: ["D14"] },
  { key: "seguradora_endereco", label: "Seguradora — endereço", tipo: "texto", escopo: "documento", documentos: ["D14"] },

  // Auxílio educacional
  { key: "curso_nome", label: "Curso", tipo: "texto", escopo: "documento", documentos: ["D15"] },
  { key: "curso_instituicao", label: "Instituição", tipo: "texto", escopo: "documento", documentos: ["D15"] },
  { key: "curso_carga_horaria", label: "Carga horária (h)", tipo: "numero", escopo: "documento", documentos: ["D15"] },
  { key: "curso_data_inicio", label: "Início do curso", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D15"] },
  { key: "curso_data_fim", label: "Término do curso", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D15"] },
  { key: "curso_modalidade", label: "Modalidade", tipo: "selecao", escopo: "documento", opcoes: ["presencial", "online", "híbrido"], documentos: ["D15"] },
  { key: "curso_valor_total", label: "Investimento total", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D15"] },
  { key: "curso_valor_empresa", label: "Investimento da empresa", tipo: "moeda", escopo: "documento", formatador: "moedaExtenso", documentos: ["D15"] },
  { key: "permanencia_prazo_meses", label: "Prazo de permanência (meses)", tipo: "numero", escopo: "documento", formatador: "numeroExtenso", genero: "m", documentos: ["D15"], nota: "Máximo 24 conforme o próprio termo" },
  { key: "permanencia_valor_mensal", label: "Valor mensal da permanência", tipo: "moeda", escopo: "documento", formatador: "moeda", calculada: true, documentos: ["D15"], nota: "Calculado: curso_valor_empresa / permanencia_prazo_meses" },

  // Férias
  { key: "ferias_periodo_aquisitivo_inicio", label: "Período aquisitivo — início", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D10"] },
  { key: "ferias_periodo_aquisitivo_fim", label: "Período aquisitivo — fim", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D10"] },
  { key: "ferias_periodos", label: "Períodos fracionados", tipo: "lista", escopo: "documento", itens: ["data_inicio", "data_fim", "dias_corridos"], documentos: ["D10"], nota: "Máx. 3 períodos. dias_corridos é calculado. Validação do art. 134 §1º: um período com 14+ dias, demais com 5+" },
  { key: "ferias_coletivas_inicio", label: "Férias coletivas — início", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D16"] },
  { key: "ferias_coletivas_fim", label: "Férias coletivas — fim", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D16"] },
  { key: "ferias_coletivas_dias", label: "Total de dias", tipo: "numero", escopo: "documento", formatador: "numeroExtenso", genero: "m", documentos: ["D16"] },
  { key: "ferias_coletivas_setor", label: "Setor abrangido", tipo: "texto", escopo: "documento", documentos: ["D16"] },

  // EPI / uniforme — tabelas impressas em branco, sem captura de dado pelo sistema
  { key: "epi_itens", label: "EPIs entregues", tipo: "lista", escopo: "documento", itens: ["data_entrega", "descricao", "ca_numero", "quantidade", "observacoes"], documentos: ["D09"], nota: "Tabela impressa em branco, preenchida à mão — sem loop nem formulário nesta fase" },
  { key: "uniforme_itens", label: "Peças de uniforme", tipo: "lista", escopo: "documento", itens: ["peca", "quantidade", "tamanho", "estado"], documentos: ["D08"], nota: "Tratada como epi_itens até confirmação em contrário — sem loop nem formulário nesta fase" },
  { key: "uniforme_responsavel_entrega_nome", label: "Responsável pela entrega", tipo: "texto", escopo: "documento", documentos: ["D08"] },

  // Ponto
  { key: "ponto_data", label: "Data da ausência de registro", tipo: "data", escopo: "documento", formatador: "dataCurta", documentos: ["D07"] },
  { key: "ponto_horario", label: "Horário", tipo: "hora", escopo: "documento", formatador: "hora", documentos: ["D07"] },
  { key: "ponto_tipo_registro", label: "Referente a", tipo: "selecao", escopo: "documento", opcoes: ["entrada", "saída para intervalo", "retorno do intervalo", "saída"], documentos: ["D07"] },
  { key: "ponto_justificativa", label: "Justificativa", tipo: "texto_longo", escopo: "documento", obrigatoria: true, documentos: ["D07"] },
];

export const VARIAVEIS_DISPONIVEIS: VariavelDisponivel[] = [
  ...VARIAVEIS_EMPRESA,
  ...VARIAVEIS_FUNCIONARIO,
  ...VARIAVEIS_SISTEMA,
  ...VARIAVEIS_DOCUMENTO,
];

/** Chaves de tipo 'lista' que são impressas em branco — nunca geram loop nem formulário. */
export const CHAVES_LISTA_ESTATICA = ["epi_itens", "uniforme_itens"];

export function obterVariavel(key: string): VariavelDisponivel | undefined {
  return VARIAVEIS_DISPONIVEIS.find((v) => v.key === key);
}
