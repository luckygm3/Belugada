import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notificarFeedbackPorEmail } from "@/lib/notificarFeedbackPorEmail";

const TEXTO_MAX = 2000;
const PAGINA_MAX = 200;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const paginaOrigem = typeof body.paginaOrigem === "string" ? body.paginaOrigem.slice(0, PAGINA_MAX) : "";

  if (!texto) {
    return Response.json({ error: "Escreva algo antes de enviar." }, { status: 400 });
  }
  if (texto.length > TEXTO_MAX) {
    return Response.json({ error: `Texto muito longo (máx. ${TEXTO_MAX} caracteres).` }, { status: 400 });
  }

  const nota = await prisma.notaFeedback.create({
    data: {
      texto,
      paginaOrigem: paginaOrigem || "(origem desconhecida)",
      usuarioId: session.user.id,
    },
  });

  await notificarFeedbackPorEmail({
    texto,
    paginaOrigem: nota.paginaOrigem,
    autorNome: session.user.nome ?? session.user.email ?? "Alguém",
  });

  return Response.json({ ok: true });
}
