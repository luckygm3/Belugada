"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { descreverDispositivo, formatarDataHora } from "@/lib/dispositivo";

export interface LogAcessoItem {
  id: string;
  sucesso: boolean;
  motivoFalha: string | null;
  userAgent: string | null;
  ip: string | null;
  criadoEm: string;
}

const ROTULO_MOTIVO: Record<string, string> = {
  senha_incorreta: "Senha incorreta",
  conta_revogada: "Conta revogada",
  "2fa_invalido": "Código de verificação inválido",
};

function descreverEntrada(item: LogAcessoItem): string {
  if (item.sucesso) return "Login bem-sucedido";
  return ROTULO_MOTIVO[item.motivoFalha ?? ""] ?? "Tentativa de login falhou";
}

/** Log de login individual (diferente da central de atividades) — só o próprio usuário vê o próprio histórico. */
export function SecaoLogAcesso({ logsIniciais }: { logsIniciais: LogAcessoItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log de acesso</CardTitle>
        <CardDescription>Histórico de login da sua conta — só você vê isso.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {logsIniciais.length === 0 && (
          <p className="py-3 text-body-sm text-ink-muted">Nenhum acesso registrado ainda.</p>
        )}
        {logsIniciais.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className={`text-body-sm font-medium ${item.sucesso ? "text-ink" : "text-red-600"}`}>
                {descreverEntrada(item)}
              </p>
              <p className="text-caption text-ink-muted">
                {descreverDispositivo(item.userAgent)}
                {item.ip ? ` · ${item.ip}` : ""} · {formatarDataHora(item.criadoEm)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
