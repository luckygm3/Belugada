import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SelecaoTemplatesPadraoForm from "@/components/SelecaoTemplatesPadraoForm";
import SelecaoTemplatesPersonalizadosForm from "@/components/SelecaoTemplatesPersonalizadosForm";
import EmpresaDadosForm from "@/components/EmpresaDadosForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

function formatarData(data: Date | null): string {
  if (!data) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(data);
}

function formatarMoeda(valor: number | null): string {
  if (valor === null || valor === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function extrairSocios(json: unknown): { nome: string; qualificacao: string }[] {
  if (!Array.isArray(json)) return [];

  return json
    .map((item) => {
      const s = (item ?? {}) as Record<string, unknown>;
      const nome = (s.nome_socio ?? s.nome ?? "") as string;
      const qualificacao = (s.qualificacao_socio ?? s.qualificacao ?? s.qual ?? "") as string;
      return { nome: nome || "-", qualificacao: qualificacao || "-" };
    })
    .filter((s) => s.nome !== "-" || s.qualificacao !== "-");
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <p className="text-body-sm">
      <span className="text-ink-muted">{label}: </span>
      <span className="text-ink">{valor}</span>
    </p>
  );
}

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [empresa, todosTemplatesPadrao, todosTemplatesPersonalizados] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      include: {
        templates: { where: { ativo: true } }, // personalizados exclusivos (upload direto) dessa empresa
        templatesPadraoSelecionados: { select: { templateId: true } },
        templatesPersonalizadosSelecionados: { select: { templateId: true } },
        _count: { select: { funcionarios: true } },
      },
    }),
    prisma.templateDocumento.findMany({
      where: { tipo: "PADRAO", ativo: true },
      orderBy: { nome: "asc" },
    }),
    prisma.templateDocumento.findMany({
      where: { tipo: "PERSONALIZADO", ativo: true, empresaId: null },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!empresa) notFound();

  const totalDocumentos =
    empresa.templatesPadraoSelecionados.length +
    empresa.templatesPersonalizadosSelecionados.length +
    empresa.templates.length;

  const totalDocumentosDetalhe = `${empresa.templatesPadraoSelecionados.length} padrão + ${empresa.templatesPersonalizadosSelecionados.length} personalizado da biblioteca + ${empresa.templates.length} personalizado exclusivo`;

  return (
    <div className="max-w-3xl space-y-6">
      <EmpresaDadosForm
        empresaId={empresa.id}
        cnpj={empresa.cnpj}
        dataAberturaFormatada={formatarData(empresa.dataAbertura)}
        situacaoCadastral={empresa.situacaoCadastral || ""}
        naturezaJuridica={empresa.naturezaJuridica || ""}
        funcionariosCount={empresa._count.funcionarios}
        totalDocumentos={totalDocumentos}
        totalDocumentosDetalhe={totalDocumentosDetalhe}
        dadosIniciais={{
          razaoSocial: empresa.razaoSocial || "",
          nomeFantasia: empresa.nomeFantasia || "",
          logradouro: empresa.logradouro || "",
          numero: empresa.numero || "",
          complemento: empresa.complemento || "",
          bairro: empresa.bairro || "",
          cidade: empresa.cidade || "",
          uf: empresa.uf || "",
          cep: empresa.cep || "",
          telefone: empresa.telefone || "",
          emailCorporativo: empresa.emailCorporativo || "",
          planoContratado: empresa.planoContratado || "MENSAL",
          statusPagamento: empresa.statusPagamento,
          responsavelNome: empresa.responsavelNome || "",
          responsavelCargo: empresa.responsavelCargo || "",
          responsavelTelefone: empresa.responsavelTelefone || "",
          responsavelEmail: empresa.responsavelEmail || "",
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados fiscais/econômicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Capital social" valor={formatarMoeda(empresa.capitalSocial)} />
            <Campo label="Porte da empresa" valor={empresa.porteEmpresa || "-"} />
            <Campo label="CNAE principal" valor={empresa.cnaePrincipal || "-"} />
          </div>
          <div className="mt-3 text-body-sm">
            <span className="text-ink-muted">CNAEs secundários:</span>
            {empresa.cnaesSecundarios.length > 0 ? (
              <ul className="mt-1 list-inside list-disc text-ink">
                {empresa.cnaesSecundarios.map((cnae, i) => (
                  <li key={i}>{cnae}</li>
                ))}
              </ul>
            ) : (
              <span className="text-ink"> -</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quadro societário</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const socios = extrairSocios(empresa.quadroSocietario);
            if (socios.length === 0) return <p className="text-body-sm text-ink">-</p>;

            return (
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-border text-ink-muted">
                    <th className="pb-2 pr-4 font-medium">Sócio</th>
                    <th className="pb-2 font-medium">Qualificação</th>
                  </tr>
                </thead>
                <tbody>
                  {socios.map((s, i) => (
                    <tr key={i} className="border-b border-border text-ink last:border-0">
                      <td className="py-2 pr-4">{s.nome}</td>
                      <td className="py-2">{s.qualificacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </CardContent>
      </Card>

      <SelecaoTemplatesPadraoForm
        empresaId={empresa.id}
        todosTemplates={todosTemplatesPadrao.map((t) => ({ id: t.id, nome: t.nome }))}
        selecionadosIniciais={empresa.templatesPadraoSelecionados.map((s) => s.templateId)}
      />

      <SelecaoTemplatesPersonalizadosForm
        empresaId={empresa.id}
        todosTemplates={todosTemplatesPersonalizados.map((t) => ({ id: t.id, nome: t.nome }))}
        selecionadosIniciais={empresa.templatesPersonalizadosSelecionados.map((s) => s.templateId)}
      />
    </div>
  );
}
