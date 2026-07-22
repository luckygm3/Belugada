interface SocioPadronizado {
  nome: string;
  qualificacao: string;
}

interface DadosCnpjPadronizados {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  data_abertura: string;
  situacao_cadastral: string;
  natureza_juridica: string;
  capital_social: number | null;
  porte_empresa: string;
  cnae_principal: string;
  cnaes_secundarios: string[];
  quadro_societario: SocioPadronizado[];
}

interface RespostaBrasilApi {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  email?: string;
  data_inicio_atividade?: string;
  descricao_situacao_cadastral?: string;
  natureza_juridica?: string;
  capital_social?: number;
  descricao_porte?: string;
  porte?: string;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: { codigo?: number; descricao?: string }[];
  qsa?: { nome_socio?: string; qualificacao_socio?: string }[];
}

interface RespostaReceitaWs {
  cnpj?: string;
  nome?: string;
  fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  status?: string;
  message?: string;
  abertura?: string;
  situacao?: string;
  natureza_juridica?: string;
  capital_social?: string;
  porte?: string;
  atividade_principal?: { code?: string; text?: string }[];
  atividades_secundarias?: { code?: string; text?: string }[];
  qsa?: { nome?: string; qual?: string }[];
}

function converterDataBrParaIso(data: string): string {
  const partes = data.split("/");
  if (partes.length !== 3) return "";
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function normalizarBrasilApi(dados: RespostaBrasilApi): DadosCnpjPadronizados {
  return {
    cnpj: dados.cnpj ?? "",
    razao_social: dados.razao_social ?? "",
    nome_fantasia: dados.nome_fantasia ?? "",
    logradouro: dados.logradouro ?? "",
    numero: dados.numero ?? "",
    complemento: dados.complemento ?? "",
    bairro: dados.bairro ?? "",
    municipio: dados.municipio ?? "",
    uf: dados.uf ?? "",
    cep: (dados.cep ?? "").replace(/\D/g, ""),
    ddd_telefone_1: (dados.ddd_telefone_1 ?? "").replace(/\D/g, ""),
    email: dados.email ?? "",
    data_abertura: dados.data_inicio_atividade ?? "",
    situacao_cadastral: dados.descricao_situacao_cadastral ?? "",
    natureza_juridica: dados.natureza_juridica ?? "",
    capital_social: dados.capital_social ?? null,
    porte_empresa: dados.descricao_porte || dados.porte || "",
    cnae_principal: dados.cnae_fiscal
      ? `${dados.cnae_fiscal} - ${dados.cnae_fiscal_descricao ?? ""}`.trim()
      : dados.cnae_fiscal_descricao ?? "",
    cnaes_secundarios: (dados.cnaes_secundarios ?? [])
      .filter((c) => c.codigo || c.descricao)
      .map((c) => `${c.codigo ?? ""} - ${c.descricao ?? ""}`.trim()),
    quadro_societario: (dados.qsa ?? [])
      .filter((s) => s.nome_socio)
      .map((s) => ({ nome: s.nome_socio ?? "", qualificacao: s.qualificacao_socio ?? "" })),
  };
}

function normalizarReceitaWs(dados: RespostaReceitaWs): DadosCnpjPadronizados {
  const atividadePrincipal = dados.atividade_principal?.[0];

  return {
    cnpj: dados.cnpj ?? "",
    razao_social: dados.nome ?? "",
    nome_fantasia: dados.fantasia ?? "",
    logradouro: dados.logradouro ?? "",
    numero: dados.numero ?? "",
    complemento: dados.complemento ?? "",
    bairro: dados.bairro ?? "",
    municipio: dados.municipio ?? "",
    uf: dados.uf ?? "",
    cep: (dados.cep ?? "").replace(/\D/g, ""),
    ddd_telefone_1: (dados.telefone ?? "").replace(/\D/g, ""),
    email: dados.email ?? "",
    data_abertura: dados.abertura ? converterDataBrParaIso(dados.abertura) : "",
    situacao_cadastral: dados.situacao ?? "",
    natureza_juridica: dados.natureza_juridica ?? "",
    capital_social: dados.capital_social ? parseFloat(dados.capital_social) : null,
    porte_empresa: dados.porte ?? "",
    cnae_principal: atividadePrincipal
      ? `${atividadePrincipal.code ?? ""} - ${atividadePrincipal.text ?? ""}`.trim()
      : "",
    cnaes_secundarios: (dados.atividades_secundarias ?? [])
      .filter((a) => a.code || a.text)
      .map((a) => `${a.code ?? ""} - ${a.text ?? ""}`.trim()),
    quadro_societario: (dados.qsa ?? [])
      .filter((s) => s.nome)
      .map((s) => ({ nome: s.nome ?? "", qualificacao: s.qual ?? "" })),
  };
}

async function buscarNaBrasilApi(cnpj: string): Promise<DadosCnpjPadronizados> {
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const corpoErro = await res.text();
    throw new Error(`BrasilAPI falhou: ${res.status} - ${corpoErro}`);
  }

  const dados: RespostaBrasilApi = await res.json();
  return normalizarBrasilApi(dados);
}

async function buscarNaReceitaWs(cnpj: string): Promise<DadosCnpjPadronizados> {
  const res = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const corpoErro = await res.text();
    throw new Error(`ReceitaWS falhou: ${res.status} - ${corpoErro}`);
  }

  const dados: RespostaReceitaWs = await res.json();

  if (dados.status === "ERROR") {
    throw new Error(`ReceitaWS retornou erro: ${dados.message}`);
  }

  return normalizarReceitaWs(dados);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const cnpjLimpo = numero.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return Response.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  try {
    const dados = await buscarNaBrasilApi(cnpjLimpo);
    return Response.json(dados);
  } catch (erroBrasilApi) {
    console.error("Erro BrasilAPI, tentando fallback ReceitaWS:", erroBrasilApi);

    try {
      const dados = await buscarNaReceitaWs(cnpjLimpo);
      return Response.json(dados);
    } catch (erroReceitaWs) {
      console.error("Erro ReceitaWS (fallback também falhou):", erroReceitaWs);

      return Response.json(
        {
          error: "CNPJ não encontrado automaticamente. Preencha os dados manualmente.",
          naoEncontrado: true,
        },
        { status: 404 }
      );
    }
  }
}
