import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gerarSegredo, gerarUri } from "@/lib/doisFatores";

/** Gera um segredo TOTP novo + QR code. Não persiste nada — só confirmar() ativa de verdade. */
export async function POST() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { emailOuLogin: true },
  });
  if (!usuario) {
    return Response.json({ error: "Sessão inválida — faça login novamente." }, { status: 401 });
  }

  const segredo = gerarSegredo();
  const uri = gerarUri(segredo, usuario.emailOuLogin);
  const qrCodeDataUrl = await QRCode.toDataURL(uri);

  return Response.json({ segredo, qrCodeDataUrl });
}
