import { Funcionario, Empresa } from "@prisma/client";
import { VARIAVEIS_DISPONIVEIS, CHAVES_LISTA_ESTATICA, VariavelDisponivel } from "./variaveis-disponiveis";
import { aplicarFormatador, formatarCep, formatarDataCurta, formatarMoeda } from "./formatadores";
import {
  resolverLinhasTrajeto,
  calcularTotalDiarioTrajeto,
  resolverPeriodosFerias,
  type LinhaTrajetoInput,
  type PeriodoFeriasInput,
} from "./listasDocumento";

/** Sem campo de override nesta fase — ver nota em VARIAVEIS_SISTEMA. */
const VIAS_PADRAO = 2;

interface EnderecoBase {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
}

function enderecoCompleto(dados: EnderecoBase): string {
  const partes = [
    [dados.logradouro, dados.numero].filter(Boolean).join(", "),
    dados.complemento || "",
    dados.bairro || "",
    [dados.cidade, dados.uf].filter(Boolean).join("/"),
    dados.cep ? formatarCep(dados.cep) : "",
  ].filter((parte) => parte !== "");
  return partes.join(" - ");
}

function resolverValorBruto(
  variavel: VariavelDisponivel,
  funcionario: Funcionario,
  empresa: Empresa,
  dataGeracao: Date,
  dadosDocumento: Record<string, unknown>
): unknown {
  if (variavel.escopo === "sistema") {
    switch (variavel.key) {
      case "cidade_assinatura":
        return empresa.cidade ?? "";
      case "data_assinatura":
        return dataGeracao;
      case "documento_vias_quantidade":
        return VIAS_PADRAO;
      default:
        return "";
    }
  }

  if (variavel.escopo === "documento") {
    return dadosDocumento[variavel.key];
  }

  if (variavel.origem === "derivada") {
    if (variavel.key === "empresa_endereco_completo") return enderecoCompleto(empresa);
    if (variavel.key === "funcionario_endereco_completo") return enderecoCompleto(funcionario);
    return "";
  }

  // escopo "empresa", "funcionario" ou "contrato" com origem "Modelo.campo"
  if (!variavel.origem) return "";
  const [modelo, campo] = variavel.origem.split(".");
  const fonte = modelo === "Empresa" ? empresa : modelo === "Funcionario" ? funcionario : null;
  if (!fonte || !campo) return "";
  return (fonte as unknown as Record<string, unknown>)[campo] ?? "";
}

function formatarValor(variavel: VariavelDisponivel, bruto: unknown): unknown {
  if (bruto === undefined || bruto === null || bruto === "") {
    return variavel.tipo === "booleano" ? false : "";
  }
  if (variavel.formatador) return aplicarFormatador(variavel.formatador, bruto, variavel.genero);
  return bruto;
}

export interface OpcoesMapearVariaveis {
  dataGeracao?: Date;
  /**
   * Valores de escopo "documento" já validados (Zod dinâmico — ver
   * schemas/documentoDinamico.ts), chaveados por VariavelDisponivel.key.
   * Normalmente um subconjunto do catálogo: só as chaves que o template usa.
   */
  dadosDocumento?: Record<string, unknown>;
}

/**
 * Resolve todas as variáveis do catálogo (empresa/funcionário/sistema/documento)
 * pro objeto plano que o docxtemplater consome, aplicando os formatadores.
 * O dado de origem (Prisma ou formulário de emissão) fica sempre cru — quem
 * formata é essa função, nunca quem preenche o formulário ou o banco.
 */
export function mapearVariaveis(
  funcionario: Funcionario,
  empresa: Empresa,
  opcoes: OpcoesMapearVariaveis = {}
): Record<string, unknown> {
  const dataGeracao = opcoes.dataGeracao ?? new Date();
  const dadosDocumento = opcoes.dadosDocumento ?? {};
  const resultado: Record<string, unknown> = {};

  for (const variavel of VARIAVEIS_DISPONIVEIS) {
    if (variavel.tipo === "lista" || CHAVES_LISTA_ESTATICA.includes(variavel.key)) continue;
    if (variavel.calculada) continue; // resolvidas à parte, abaixo

    const bruto = resolverValorBruto(variavel, funcionario, empresa, dataGeracao, dadosDocumento);
    resultado[variavel.key] = formatarValor(variavel, bruto);
  }

  if (Array.isArray(dadosDocumento.trajeto_linhas)) {
    const linhas = resolverLinhasTrajeto(dadosDocumento.trajeto_linhas as LinhaTrajetoInput[]);
    resultado.trajeto_linhas = linhas.map((l) => ({
      linha: l.linha,
      valor_passagem: formatarMoeda(l.valor_passagem),
      quantidade: String(l.quantidade),
      total_dia: formatarMoeda(l.total_dia),
    }));
    resultado.trajeto_total_diario = formatarMoeda(calcularTotalDiarioTrajeto(linhas));
  }

  if (Array.isArray(dadosDocumento.ferias_periodos)) {
    const periodos = resolverPeriodosFerias(dadosDocumento.ferias_periodos as PeriodoFeriasInput[]);
    resultado.ferias_periodos = periodos.map((p) => ({
      data_inicio: formatarDataCurta(p.data_inicio),
      data_fim: formatarDataCurta(p.data_fim),
      dias_corridos: String(p.dias_corridos),
    }));
  }

  const cursoValorEmpresa = dadosDocumento.curso_valor_empresa;
  const permanenciaPrazoMeses = dadosDocumento.permanencia_prazo_meses;
  if (typeof cursoValorEmpresa === "number" && typeof permanenciaPrazoMeses === "number" && permanenciaPrazoMeses > 0) {
    resultado.permanencia_valor_mensal = formatarMoeda(cursoValorEmpresa / permanenciaPrazoMeses);
  }

  return resultado;
}
