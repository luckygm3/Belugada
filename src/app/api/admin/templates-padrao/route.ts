import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PizZip from "pizzip";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("arquivo") as File | null;
  const nome = formData.get("nome") as string | null;

  if (!arquivo || !nome) {
    return Response.json({ error: "Arquivo e nome são obrigatórios." }, { status: 400 });
  }

  if (!arquivo.name.endsWith(".docx")) {
    return Response.json({ error: "Só arquivos .docx são aceitos." }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  let variaveisDetectadas: string[] = [];
  try {
    const zip = new PizZip(buffer);
    const xml = zip.file("word/document.xml")?.asText() || "";
    const matches = xml.match(/\[\[([a-zA-Z0-9_]+)\]\]/g) || [];
    variaveisDetectadas = [...new Set(matches.map((m) => m.replace(/\[\[|\]\]/g, "")))];
  } catch {
    return Response.json({ error: "Não foi possível ler o arquivo .docx." }, { status: 400 });
  }

  const caminhoArquivo = `padrao/${Date.now()}-${arquivo.name}`;
  const { error: erroUpload } = await supabaseAdmin.storage
    .from("templates")
    .upload(caminhoArquivo, buffer, {
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

  if (erroUpload) {
    return Response.json({ error: "Falha ao salvar o arquivo no Storage." }, { status: 500 });
  }

  const template = await prisma.templateDocumento.create({
    data: {
      nome,
      tipo: "PADRAO",
      empresaId: null,
      arquivoOriginalUrl: caminhoArquivo,
      variaveisDetectadas,
      ativo: true,
    },
  });

  return Response.json({ template });
}