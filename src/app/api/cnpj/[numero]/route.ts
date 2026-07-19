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
}
function normalizarReceitaWs(dados: RespostaReceitaWs): DadosCnpjPadronizados {
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
  };
}

async function buscarNaBrasilApi(cnpj: string) {
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

  return res.json();
}

async function buscarNaReceitaWs(cnpj: string) {
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

  const dados = await res.json();

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