"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BotaoBaixarDocumento({ documentoId }: { documentoId: string }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixar() {
    setBaixando(true);
    setErro("");

    const res = await fetch(`/api/documentos/${documentoId}/download`);
    const dados = await res.json().catch(() => ({}));
    setBaixando(false);

    if (!res.ok || !dados.url) {
      setErro(dados.error || "Erro ao baixar o documento.");
      return;
    }

    window.open(dados.url, "_blank");
  }

  return (
    <div>
      <Button variant="primary" onClick={baixar} loading={baixando} className="text-body-sm">
        Baixar documento
      </Button>
      {erro && <p className="mt-2 text-caption text-red-600">{erro}</p>}
    </div>
  );
}
