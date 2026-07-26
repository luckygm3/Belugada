"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Feedback } from "./ConfiguracoesView";

interface SecaoDoisFatoresProps {
  totpAtivadoInicial: boolean;
  onFeedback: Feedback;
}

type Passo = "inativo" | "configurando" | "backup" | "ativo";

/** Ativação/desativação de 2FA (TOTP) — QR code, confirmação antes de ativar, códigos de backup mostrados uma vez. */
export function SecaoDoisFatores({ totpAtivadoInicial, onFeedback }: SecaoDoisFatoresProps) {
  const router = useRouter();
  const [passo, setPasso] = useState<Passo>(totpAtivadoInicial ? "ativo" : "inativo");

  const [iniciando, setIniciando] = useState(false);
  const [segredo, setSegredo] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [codigo, setCodigo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [codigosBackup, setCodigosBackup] = useState<string[]>([]);

  async function iniciar() {
    setIniciando(true);
    const res = await fetch("/api/usuario/2fa/iniciar", { method: "POST" });
    const dados = await res.json().catch(() => ({}));
    setIniciando(false);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao iniciar configuração.");
      return;
    }

    setSegredo(dados.segredo);
    setQrCodeDataUrl(dados.qrCodeDataUrl);
    setCodigo("");
    setErroConfirmacao("");
    setPasso("configurando");
  }

  async function confirmar() {
    setConfirmando(true);
    setErroConfirmacao("");
    const res = await fetch("/api/usuario/2fa/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segredo, codigo }),
    });
    const dados = await res.json().catch(() => ({}));
    setConfirmando(false);

    if (!res.ok) {
      setErroConfirmacao(dados.error || "Código inválido.");
      return;
    }

    setCodigosBackup(dados.codigosBackup);
    setPasso("backup");
  }

  function concluir() {
    setPasso("ativo");
    onFeedback("success", "Autenticação de dois fatores ativada");
    router.refresh();
  }

  function cancelarConfiguracao() {
    setSegredo("");
    setQrCodeDataUrl("");
    setCodigo("");
    setErroConfirmacao("");
    setPasso("inativo");
  }

  const [senhaDesativar, setSenhaDesativar] = useState("");
  const [desativando, setDesativando] = useState(false);
  const [mostrandoDesativar, setMostrandoDesativar] = useState(false);
  const [erroDesativar, setErroDesativar] = useState("");

  async function desativar() {
    setDesativando(true);
    setErroDesativar("");
    const res = await fetch("/api/usuario/2fa/desativar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual: senhaDesativar }),
    });
    const dados = await res.json().catch(() => ({}));
    setDesativando(false);

    if (!res.ok) {
      setErroDesativar(dados.error || "Erro ao desativar.");
      return;
    }

    setSenhaDesativar("");
    setMostrandoDesativar(false);
    setPasso("inativo");
    onFeedback("success", "Autenticação de dois fatores desativada");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autenticação de dois fatores</CardTitle>
        <CardDescription>
          Exige um código do seu app autenticador (Google Authenticator, Authy) além da senha pra entrar.
        </CardDescription>
      </CardHeader>

      {passo === "inativo" && (
        <>
          <CardContent>
            <p className="text-body-sm text-ink-muted">Desativado.</p>
          </CardContent>
          <CardFooter>
            <Button variant="primary" onClick={iniciar} loading={iniciando} className="text-body-sm">
              Ativar
            </Button>
          </CardFooter>
        </>
      )}

      {passo === "configurando" && (
        <>
          <CardContent className="space-y-4">
            <p className="text-body-sm text-ink">Escaneie o QR code com seu app autenticador:</p>
            {qrCodeDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt="QR code para configurar autenticação de dois fatores"
                className="h-40 w-40"
              />
            )}
            <p className="text-caption text-ink-muted">
              Não consegue escanear? Digite manualmente: <span className="font-mono">{segredo}</span>
            </p>
            <Input
              label="Código do app"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              error={erroConfirmacao}
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="primary" onClick={confirmar} loading={confirmando} className="text-body-sm">
              Confirmar e ativar
            </Button>
            <Button variant="secondary" onClick={cancelarConfiguracao} className="text-body-sm">
              Cancelar
            </Button>
          </CardFooter>
        </>
      )}

      {passo === "backup" && (
        <>
          <CardContent className="space-y-3">
            <p className="text-body-sm font-medium text-red-600">
              Salve estes códigos de backup agora — eles não serão mostrados de novo. Cada um funciona uma única
              vez, pra caso você perca acesso ao app autenticador.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-pa-md border border-border bg-surface-alt p-4 font-mono text-body-sm text-ink">
              {codigosBackup.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" onClick={concluir} className="text-body-sm">
              Já salvei — concluir
            </Button>
          </CardFooter>
        </>
      )}

      {passo === "ativo" && (
        <>
          <CardContent className="space-y-3">
            <p className="text-body-sm text-green-600">Ativa.</p>
            {mostrandoDesativar && (
              <div className="max-w-xs">
                <Input
                  label="Senha atual"
                  type="password"
                  value={senhaDesativar}
                  onChange={(e) => setSenhaDesativar(e.target.value)}
                  error={erroDesativar}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            {!mostrandoDesativar ? (
              <Button variant="secondary" onClick={() => setMostrandoDesativar(true)} className="text-body-sm">
                Desativar
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={desativar} loading={desativando} className="text-body-sm">
                  Confirmar desativação
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMostrandoDesativar(false);
                    setSenhaDesativar("");
                    setErroDesativar("");
                  }}
                  className="text-body-sm"
                >
                  Cancelar
                </Button>
              </>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
