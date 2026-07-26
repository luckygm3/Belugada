import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2MB

const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Faz upload do avatar do usuário logado pro bucket público "avatares" e salva a URL. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("arquivo") as File | null;

  if (!arquivo) {
    return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return Response.json({ error: "Envie uma imagem PNG, JPEG ou WEBP." }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return Response.json({ error: "A imagem deve ter no máximo 2MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const caminho = `${session.user.id}/${Date.now()}-avatar.${EXTENSAO_POR_TIPO[arquivo.type]}`;

  const { error: erroUpload } = await supabaseAdmin.storage
    .from("avatares")
    .upload(caminho, buffer, { contentType: arquivo.type });

  if (erroUpload) {
    return Response.json({ error: "Falha ao salvar a imagem no Storage." }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from("avatares").getPublicUrl(caminho);

  await prisma.usuario.update({ where: { id: session.user.id }, data: { avatarUrl: data.publicUrl } });

  return Response.json({ avatarUrl: data.publicUrl });
}
