import { prisma } from "@/lib/prisma";
import { BibliotecaTemplates, type TemplateBiblioteca } from "@/components/BibliotecaTemplates";

export default async function TemplatesPadraoPage() {
  const templates = await prisma.templateDocumento.findMany({
    where: { ativo: true },
    include: { empresa: { select: { razaoSocial: true } } },
    orderBy: { createdAt: "desc" },
  });

  const templatesIniciais: TemplateBiblioteca[] = templates.map((t) => ({
    id: t.id,
    nome: t.nome,
    tipo: t.tipo,
    origem: t.origem,
    arquivoOriginalUrl: t.arquivoOriginalUrl,
    variaveisDetectadas: t.variaveisDetectadas,
    variavelVencimento: t.variavelVencimento,
    diasAlertaVencimento: t.diasAlertaVencimento,
    vencimentoIndividualData: t.vencimentoIndividualData?.toISOString() ?? null,
    vencimentoIndividualDias: t.vencimentoIndividualDias,
    createdAt: t.createdAt.toISOString(),
    empresa: t.empresa ? { razaoSocial: t.empresa.razaoSocial } : null,
  }));

  return <BibliotecaTemplates templatesIniciais={templatesIniciais} />;
}
