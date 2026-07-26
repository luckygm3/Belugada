"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROTULOS_TIPO_ATIVIDADE } from "@/lib/notificacoes";
import { preferenciaEmailAtiva } from "@/lib/preferencias";
import type { TipoAtividade } from "@prisma/client";
import type { Feedback } from "./ConfiguracoesView";

const TIPOS_POR_PAPEL: Record<"ADMIN" | "EMPRESA", TipoAtividade[]> = {
  ADMIN: ["CRIACAO", "EDICAO", "EXCLUSAO", "GERACAO_DOCUMENTO", "VENCIMENTO_PROXIMO"],
  EMPRESA: ["VENCIMENTO_PROXIMO"],
};

interface SecaoNotificacoesProps {
  papel: "ADMIN" | "EMPRESA";
  preferenciasIniciais: unknown;
  onFeedback: Feedback;
}

export function SecaoNotificacoes({ papel, preferenciasIniciais, onFeedback }: SecaoNotificacoesProps) {
  const tipos = TIPOS_POR_PAPEL[papel];
  const [email, setEmail] = useState<Partial<Record<TipoAtividade, boolean>>>(() =>
    Object.fromEntries(tipos.map((tipo) => [tipo, preferenciaEmailAtiva(preferenciasIniciais, papel, tipo)]))
  );
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const res = await fetch("/api/usuario/preferencias", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificacoes: { email } }),
    });
    setSalvando(false);

    if (!res.ok) {
      onFeedback("error", "Erro ao salvar preferências de notificação.");
      return;
    }
    onFeedback("success", "Preferências salvas");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações por e-mail</CardTitle>
        <CardDescription>
          {papel === "ADMIN"
            ? "A central de atividades continua mostrando tudo — isso só controla o que também vira e-mail."
            : "Além do alerta na central de notificações, escolha se também quer receber por e-mail."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tipos.map((tipo) => (
          <label key={tipo} className="flex items-center gap-3 text-body-sm text-ink">
            <input
              type="checkbox"
              checked={email[tipo] ?? false}
              onChange={(e) => setEmail((atual) => ({ ...atual, [tipo]: e.target.checked }))}
              className="h-4 w-4 rounded border-border accent-black"
            />
            {ROTULOS_TIPO_ATIVIDADE[tipo]}
          </label>
        ))}
        {papel === "ADMIN" && (
          <label className="flex items-center gap-3 text-body-sm text-ink-muted">
            <input type="checkbox" checked={false} disabled className="h-4 w-4 rounded border-border" />
            Resumo diário agrupado (em breve)
          </label>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="primary" onClick={salvar} loading={salvando} className="text-body-sm">
          Salvar
        </Button>
      </CardFooter>
    </Card>
  );
}
