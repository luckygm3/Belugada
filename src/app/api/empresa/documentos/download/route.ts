import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const caminho = searchParams.get("caminho");

  if (!caminho) {
    return Response.json({ error: "Caminho não informado." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("documentos-gerados")
    .createSignedUrl(caminho, 60 * 5); // link válido por 5 minutos

  if (error || !data) {
    return Response.json({ error: "Não foi possível gerar o link." }, { status: 500 });
  }

  return Response.json({ url: data.signedUrl });
}