"use client";

import { useState } from "react";

interface Template {
  id: string;
  nome: string;
}

export default function SelecaoTemplatesPadraoForm({
  empresaId,
  todosTemplates,
  selecionadosIniciais,
}: {
  empresaId: string;
  todosTemplates: Template[];
  selecionadosIniciais: string[];
}) {
  const [selecionados, setSelecionados] = useState<string[]>(selecionadosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function alternar(templateId: string) {
    setSalvo(false);
    setSelecionados((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  }

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/admin/empresas/${empresaId}/templates-padrao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateIds: selecionados }),
    });
    setSalvando(false);
    setSalvo(true);
  }

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
      <h2 className="font-semibold mb-4 dark:text-white">Documentos padrão desta empresa</h2>

      {todosTemplates.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum documento na biblioteca padrão ainda. Cadastre em &quot;Biblioteca de documentos&quot;.
        </p>
      )}

      <ul className="space-y-2 mb-4">
        {todosTemplates.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`template-${t.id}`}
              checked={selecionados.includes(t.id)}
              onChange={() => alternar(t.id)}
            />
            <label htmlFor={`template-${t.id}`} className="text-sm dark:text-gray-200">
              {t.nome}
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-black text-white px-4 py-2 rounded-md text-sm"
        >
          {salvando ? "Salvando..." : "Salvar seleção"}
        </button>
        {salvo && <span className="text-green-600 text-sm">Salvo!</span>}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          {selecionados.length} de {todosTemplates.length} selecionados
        </span>
      </div>
    </div>
  );
}