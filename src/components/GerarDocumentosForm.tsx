"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useOperacaoEmEtapas } from "@/hooks/useOperacaoEmEtapas";
import { FormularioDocumento, type ValoresDocumento } from "@/components/FormularioDocumento";
import { obterCamposDocumento } from "@/lib/schemas/documentoDinamico";

interface Template {
  id: string;
  nome: string;
  variaveisDetectadas: string[];
}

interface ResultadoGeracao {
  template: string;
  documentoId?: string;
  erro?: string;
  ok?: boolean;
}

const ETAPAS_GERACAO = ["Preenchendo dados...", "Compilando documento...", "Quase lá..."];
const ETAPAS_BAIXAR_TODOS = ["Baixando documentos...", "Compactando .zip..."];

export default function GerarDocumentosForm({
  funcionarioId,
  templatesDisponiveis,
}: {
  funcionarioId: string;
  templatesDisponiveis: Template[];
}) {
  const [selecionados, setSelecionados] = useState<string[]>(templatesDisponiveis.map((t) => t.id));
  const [resultados, setResultados] = useState<ResultadoGeracao[]>([]);
  const [valoresPorTemplate, setValoresPorTemplate] = useState<Record<string, ValoresDocumento>>({});
  const geracao = useOperacaoEmEtapas(ETAPAS_GERACAO);
  const download = useOperacaoEmEtapas(ETAPAS_BAIXAR_TODOS);

  const gerados = resultados.filter((r) => r.ok);

  const camposPorTemplate = useMemo(() => {
    const mapa: Record<string, ReturnType<typeof obterCamposDocumento>> = {};
    for (const t of templatesDisponiveis) mapa[t.id] = obterCamposDocumento(t.variaveisDetectadas);
    return mapa;
  }, [templatesDisponiveis]);

  function alternar(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function gerar() {
    geracao.executar(async () => {
      setResultados([]);

      const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}/gerar-documentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templates: selecionados.map((id) => ({ templateId: id, dadosEntrada: valoresPorTemplate[id] ?? {} })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar documentos.");

      setResultados(data.resultados || []);
    });
  }

  async function baixar(documentoId: string) {
    const res = await fetch(`/api/documentos/${documentoId}/download`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  function baixarTodos() {
    download.executar(async () => {
      const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}/baixar-todos`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao montar o arquivo .zip.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      link.download = match ? match[1] : "documentos.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {templatesDisponiveis.map((t) => {
            const campos = camposPorTemplate[t.id] ?? [];
            const selecionado = selecionados.includes(t.id);
            return (
              <li key={t.id}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`gerar-${t.id}`}
                    checked={selecionado}
                    onChange={() => alternar(t.id)}
                    className="accent-navy-600"
                  />
                  <label htmlFor={`gerar-${t.id}`} className="text-body-sm text-ink">
                    {t.nome}
                  </label>
                </div>
                {selecionado && campos.length > 0 && (
                  <div className="mt-2 ml-6 rounded-pa-md border border-border bg-surface-alt p-3">
                    <FormularioDocumento
                      campos={campos}
                      valores={valoresPorTemplate[t.id] ?? {}}
                      onChange={(v) => setValoresPorTemplate((atual) => ({ ...atual, [t.id]: v }))}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <Button
          variant="primary"
          className="text-body-sm"
          onClick={gerar}
          disabled={geracao.estado === "andamento" || selecionados.length === 0}
          loading={geracao.estado === "andamento"}
        >
          {geracao.estado === "andamento"
            ? `Gerando ${selecionados.length} documento(s)...`
            : `Gerar ${selecionados.length} documento(s)`}
        </Button>

        {geracao.estado !== "ocioso" && (
          <OperationProgress
            etapas={ETAPAS_GERACAO}
            etapaAtual={geracao.etapaAtual}
            estado={geracao.estado}
            tituloConcluido="Documentos gerados com sucesso"
            descricaoConcluido="Seus documentos foram gerados."
            tituloErro="Erro ao gerar documentos"
            mensagemErro={geracao.mensagemErro}
            onBaixar={gerados.length > 0 ? baixarTodos : undefined}
            onTentarNovamente={geracao.resetar}
          />
        )}

        {resultados.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="mb-2 flex justify-end">
              <Button
                variant="secondary"
                className="text-body-sm"
                onClick={baixarTodos}
                disabled={gerados.length === 0 || download.estado === "andamento"}
              >
                {download.estado === "andamento" ? "Montando .zip..." : "Baixar todos"}
              </Button>
            </div>

            {download.estado !== "ocioso" && (
              <OperationProgress
                etapas={ETAPAS_BAIXAR_TODOS}
                etapaAtual={download.etapaAtual}
                estado={download.estado}
                tituloConcluido="Download pronto"
                descricaoConcluido="O arquivo .zip foi baixado."
                tituloErro="Erro ao baixar documentos"
                mensagemErro={download.mensagemErro}
                onTentarNovamente={download.resetar}
              />
            )}

            {resultados.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-body-sm">
                <span className="text-ink">{r.template}</span>
                {r.ok && r.documentoId ? (
                  <button onClick={() => baixar(r.documentoId!)} className="text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline">
                    Baixar
                  </button>
                ) : (
                  <span className="text-caption text-red-600">{r.erro}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
