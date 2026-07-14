export async function GET(
  req: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const cepLimpo = numero.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return Response.json({ error: "CEP inválido" }, { status: 400 });
  }

  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  });

  const dados = await res.json();

  if (dados.erro) {
    return Response.json({ error: "CEP não encontrado" }, { status: 404 });
  }

  return Response.json(dados);
}