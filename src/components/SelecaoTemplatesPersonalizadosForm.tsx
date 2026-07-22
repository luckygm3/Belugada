"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";

interface Template {
  id: string;
  nome: string;
}

export default function SelecaoTemplatesPersonalizadosForm({
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
    await fetch(`/api/admin/empresas/${empresaId}/templates-personalizados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateIds: selecionados }),
    });
    setSalvando(false);
    setSalvo(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos personalizados da biblioteca</CardTitle>
      </CardHeader>
      <CardContent>
        {todosTemplates.length === 0 && (
          <p className="text-body-sm text-ink-muted">
            Nenhum documento personalizado na biblioteca ainda. Cadastre em &quot;Biblioteca de documentos&quot;.
          </p>
        )}

        <ul className="mb-4 space-y-2">
          {todosTemplates.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`template-pers-${t.id}`}
                checked={selecionados.includes(t.id)}
                onChange={() => alternar(t.id)}
                className="accent-navy-600"
              />
              <label htmlFor={`template-pers-${t.id}`} className="text-body-sm text-ink">
                {t.nome}
              </label>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={salvar} loading={salvando} className="text-body-sm">
            Salvar seleção
          </Button>
          {salvo && <span className="text-body-sm text-green-600">Salvo!</span>}
          <span className="ml-auto text-body-sm text-ink-muted">
            {selecionados.length} de {todosTemplates.length} selecionados
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
