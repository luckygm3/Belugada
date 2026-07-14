import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PizZip from "pizzip";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id: empresaId } = await params;

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

  // Detectar variáveis [[campo]] dentro do .docx
  let variaveisDetectadas: string[] = [];
  try {
    const zip = new PizZip(buffer);
    const xml = zip.file("word/document.xml")?.asText() || "";
    const matches = xml.match(/\[\[([a-zA-Z0-9_]+)\]\]/g) || [];
    variaveisDetectadas = [...new Set(matches.map((m) => m.replace(/\[\[|\]\]/g, "")))];
  } catch {
    return Response.json({ error: "Não foi possível ler o arquivo .docx. Ele pode estar corrompido." }, { status: 400 });
  }

  // Upload pro Storage
  const caminhoArquivo = `${empresaId}/${Date.now()}-${arquivo.name}`;
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
      tipo: "PERSONALIZADO",
      empresaId,
      arquivoOriginalUrl: caminhoArquivo,
      variaveisDetectadas,
      ativo: true,
    },
  });

  return Response.json({ template });
}