export async function GET(
  req: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const cnpjLimpo = numero.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return Response.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const corpoErro = await res.text();
    console.error("Erro BrasilAPI:", res.status, corpoErro);
    return Response.json(
      { error: "CNPJ não encontrado", statusOriginal: res.status, detalhe: corpoErro },
      { status: 404 }
    );
  }

  const dados = await res.json();
  return Response.json(dados);
}