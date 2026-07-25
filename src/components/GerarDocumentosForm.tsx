"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GeracaoDocumentosProgress, type EstadoGeracaoDocumentos } from "@/components/GeracaoDocumentosProgress";

interface Template {
  id: string;
  nome: string;
}

interface ResultadoGeracao {
  template: string;
  caminho?: string;
  erro?: string;
  ok?: boolean;
}

export default function GerarDocumentosForm({
  funcionarioId,
  templatesDisponiveis,
}: {
  funcionarioId: string;
  templatesDisponiveis: Template[];
}) {
  const [selecionados, setSelecionados] = useState<string[]>(templatesDisponiveis.map((t) => t.id));
  const [estadoGeracao, setEstadoGeracao] = useState<EstadoGeracaoDocumentos | null>(null);
  const [resultados, setResultados] = useState<ResultadoGeracao[]>([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [baixandoTodos, setBaixandoTodos] = useState(false);

  const gerados = resultados.filter((r) => r.ok);

  function alternar(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function gerar() {
    setEstadoGeracao("gerando");
    setResultados([]);
    setMensagemErro("");

    try {
      const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}/gerar-documentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIds: selecionados }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagemErro(data.error || "Erro ao gerar documentos.");
        setEstadoGeracao("erro");
        return;
      }

      setResultados(data.resultados || []);
      setEstadoGeracao("concluido");
    } catch {
      setMensagemErro("Erro de rede ao gerar documentos.");
      setEstadoGeracao("erro");
    }
  }

  async function baixar(caminho: string) {
    const res = await fetch(`/api/empresa/documentos/download?caminho=${encodeURIComponent(caminho)}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  async function baixarTodos() {
    setBaixandoTodos(true);

    const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}/baixar-todos`);

    if (!res.ok) {
      setBaixandoTodos(false);
      const data = await res.json().catch(() => ({}));
      setMensagemErro(data.error || "Erro ao montar o arquivo .zip.");
      return;
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

    setBaixandoTodos(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {templatesDisponiveis.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`gerar-${t.id}`}
                checked={selecionados.includes(t.id)}
                onChange={() => alternar(t.id)}
                className="accent-navy-600"
              />
              <label htmlFor={`gerar-${t.id}`} className="text-body-sm text-ink">
                {t.nome}
              </label>
            </li>
          ))}
        </ul>

        <Button
          variant="primary"
          className="text-body-sm"
          onClick={gerar}
          disabled={estadoGeracao === "gerando" || selecionados.length === 0}
          loading={estadoGeracao === "gerando"}
        >
          {estadoGeracao === "gerando"
            ? `Gerando ${selecionados.length} documento(s)...`
            : `Gerar ${selecionados.length} documento(s)`}
        </Button>

        {estadoGeracao && (
          <GeracaoDocumentosProgress
            estado={estadoGeracao}
            mensagemErro={mensagemErro}
            onBaixar={gerados.length > 0 ? baixarTodos : undefined}
            onTentarNovamente={() => setEstadoGeracao(null)}
          />
        )}

        {resultados.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="mb-2 flex justify-end">
              <Button
                variant="secondary"
                className="text-body-sm"
                onClick={baixarTodos}
                disabled={gerados.length === 0 || baixandoTodos}
              >
                {baixandoTodos ? "Montando .zip..." : "Baixar todos"}
              </Button>
            </div>
            {resultados.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-body-sm">
                <span className="text-ink">{r.template}</span>
                {r.ok && r.caminho ? (
                  <button onClick={() => baixar(r.caminho!)} className="text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline">
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
