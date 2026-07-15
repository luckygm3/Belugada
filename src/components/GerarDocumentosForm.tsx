"use client";

import { useState } from "react";

interface Template {
  id: string;
  nome: string;
}

export default function GerarDocumentosForm({
  funcionarioId,
  templatesDisponiveis,
}: {
  funcionarioId: string;
  templatesDisponiveis: Template[];
}) {
  const [selecionados, setSelecionados] = useState<string[]>(templatesDisponiveis.map((t) => t.id));
  const [gerando, setGerando] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);

  function alternar(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function gerar() {
    setGerando(true);
    setResultados([]);

    const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}/gerar-documentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateIds: selecionados }),
    });

    const data = await res.json();
    setResultados(data.resultados || []);
    setGerando(false);
  }

  async function baixar(caminho: string) {
    const res = await fetch(`/api/empresa/documentos/download?caminho=${encodeURIComponent(caminho)}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
      <h2 className="font-semibold mb-4 dark:text-white">Gerar documentos</h2>

      <ul className="space-y-2 mb-4">
        {templatesDisponiveis.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`gerar-${t.id}`}
              checked={selecionados.includes(t.id)}
              onChange={() => alternar(t.id)}
            />
            <label htmlFor={`gerar-${t.id}`} className="text-sm dark:text-gray-200">{t.nome}</label>
          </li>
        ))}
      </ul>

      <button
        onClick={gerar}
        disabled={gerando || selecionados.length === 0}
        className="bg-black text-white px-4 py-2 rounded-md text-sm"
      >
        {gerando ? `Gerando ${selecionados.length} documento(s)...` : `Gerar ${selecionados.length} documento(s)`}
      </button>

      {resultados.length > 0 && (
        <div className="mt-6 border-t dark:border-gray-600 pt-4 space-y-2">
          {resultados.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="dark:text-gray-200">{r.template}</span>
              {r.ok ? (
                <button onClick={() => baixar(r.caminho)} className="text-blue-600 hover:underline">
                  Baixar
                </button>
              ) : (
                <span className="text-red-600 text-xs">{r.erro}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}