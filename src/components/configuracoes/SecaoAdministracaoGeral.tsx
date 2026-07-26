"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Feedback } from "./ConfiguracoesView";

export interface AdminItem {
  id: string;
  nome: string | null;
  emailOuLogin: string;
  ativo: boolean;
  tokenReset: string | null;
  tokenResetExpira: string | null;
}

interface SecaoAdministracaoGeralProps {
  adminsIniciais: AdminItem[];
  usuarioAtualId: string;
  diasAlertaIniciais: number[];
  onFeedback: Feedback;
}

function statusAdmin(admin: AdminItem, usuarioAtualId: string): string {
  if (admin.id === usuarioAtualId) return "Você";
  if (!admin.ativo) return "Acesso revogado";
  if (admin.tokenReset) {
    const expirado = !admin.tokenResetExpira || new Date(admin.tokenResetExpira) <= new Date();
    return expirado ? "Convite expirado" : "Convite pendente";
  }
  return "Ativo";
}

export function SecaoAdministracaoGeral({
  adminsIniciais,
  usuarioAtualId,
  diasAlertaIniciais,
  onFeedback,
}: SecaoAdministracaoGeralProps) {
  const router = useRouter();

  const [emailConvite, setEmailConvite] = useState("");
  const [convidando, setConvidando] = useState(false);
  const [revogandoId, setRevogandoId] = useState<string | null>(null);

  async function convidar() {
    if (!emailConvite.trim()) {
      onFeedback("error", "Informe um e-mail.");
      return;
    }
    setConvidando(true);
    const res = await fetch("/api/admin/administradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOuLogin: emailConvite.trim() }),
    });
    const dados = await res.json().catch(() => ({}));
    setConvidando(false);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao enviar convite.");
      return;
    }

    setEmailConvite("");
    onFeedback("success", "Convite enviado");
    router.refresh();
  }

  async function revogar(id: string) {
    setRevogandoId(id);
    const res = await fetch(`/api/admin/administradores/${id}`, { method: "DELETE" });
    const dados = await res.json().catch(() => ({}));
    setRevogandoId(null);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao revogar acesso.");
      return;
    }

    onFeedback("success", "Acesso revogado");
    router.refresh();
  }

  const [diasAlerta, setDiasAlerta] = useState(diasAlertaIniciais.join(", "));
  const [salvandoDias, setSalvandoDias] = useState(false);

  async function salvarDiasAlerta() {
    const valores = diasAlerta
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => Number(v));

    if (valores.length === 0 || valores.some((v) => !Number.isInteger(v) || v <= 0)) {
      onFeedback("error", "Informe dias em números inteiros positivos, separados por vírgula.");
      return;
    }

    setSalvandoDias(true);
    const res = await fetch("/api/admin/configuracoes-globais", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diasAlertaPadrao: valores }),
    });
    const dados = await res.json().catch(() => ({}));
    setSalvandoDias(false);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao salvar prazos de alerta.");
      return;
    }

    onFeedback("success", "Prazos de alerta atualizados");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administradores</CardTitle>
          <CardDescription>Convide outras pessoas da equipe para acessar o painel administrativo.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {adminsIniciais.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-ink">{admin.nome || admin.emailOuLogin}</p>
                <p className="text-caption text-ink-muted">
                  {admin.emailOuLogin} · {statusAdmin(admin, usuarioAtualId)}
                </p>
              </div>
              {admin.ativo && admin.id !== usuarioAtualId && (
                <Button
                  variant="secondary"
                  onClick={() => revogar(admin.id)}
                  loading={revogandoId === admin.id}
                  className="shrink-0 text-body-sm"
                >
                  Revogar acesso
                </Button>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Input
              label="E-mail para convidar"
              value={emailConvite}
              onChange={(e) => setEmailConvite(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={convidar} loading={convidando} className="text-body-sm">
            Convidar admin
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prazos de alerta de vencimento</CardTitle>
          <CardDescription>
            Marcos padrão (em dias antes do vencimento) usados quando um template não define os próprios prazos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            label="Dias, separados por vírgula (ex: 30, 15, 7)"
            value={diasAlerta}
            onChange={(e) => setDiasAlerta(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button variant="primary" onClick={salvarDiasAlerta} loading={salvandoDias} className="text-body-sm">
            Salvar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
