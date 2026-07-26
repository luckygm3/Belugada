"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { PactaLogo } from "@/components/PactaLogo";
import { NUMERO_WHATSAPP } from "@/components/BotaoWhatsapp";

export default function LoginPage() {
  const [etapa, setEtapa] = useState<"credenciais" | "codigo">("credenciais");
  const [emailOuLogin, setEmailOuLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [codigoTotp, setCodigoTotp] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(comCodigo: boolean) {
    const res = await signIn("credentials", {
      emailOuLogin,
      senha,
      ...(comCodigo ? { codigoTotp } : {}),
      redirect: false,
    });

    if (res?.code === "precisa_2fa") {
      setEtapa("codigo");
      setErro("");
      setCarregando(false);
      return;
    }

    if (res?.code === "codigo_2fa_invalido") {
      setErro("Código inválido. Confira o app autenticador ou use um código de backup.");
      setCarregando(false);
      return;
    }

    if (res?.error) {
      setErro("Usuário ou senha inválidos");
      setCarregando(false);
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());
    const destino = session.user?.papel === "ADMIN" ? "/admin" : "/empresa";
    window.location.href = destino;
  }

  async function handleSubmitCredenciais(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    await entrar(false);
  }

  async function handleSubmitCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    await entrar(true);
  }

  function voltar() {
    setEtapa("credenciais");
    setCodigoTotp("");
    setErro("");
  }

  return (
    <div className="app-interno min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" aria-label="PACTA — início" className="text-[var(--ai-petrol-900)]">
            <PactaLogo variante="horizontal" idPrefix="login" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="card">
          {etapa === "credenciais" ? (
            <>
              <h1 className="text-2xl font-bold mb-6">Entrar</h1>

              <form onSubmit={handleSubmitCredenciais} className="space-y-4">
                <div>
                  <label className="label">Usuário ou e-mail</label>
                  <input
                    type="text"
                    value={emailOuLogin}
                    onChange={(e) => setEmailOuLogin(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                {erro && <p className="text-sm text-red-600">{erro}</p>}

                <button type="submit" disabled={carregando} className="btn-primary w-full">
                  {carregando ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <p className="text-center text-sm mt-4">
                <a href="/esqueci-senha" className="link-acao">
                  Esqueci minha senha
                </a>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Verificação em duas etapas</h1>
              <p className="text-sm text-[var(--ai-ink-suave)] mb-6">
                Digite o código do seu app autenticador (ou um código de backup).
              </p>

              <form onSubmit={handleSubmitCodigo} className="space-y-4">
                <div>
                  <label className="label">Código</label>
                  <input
                    type="text"
                    inputMode="text"
                    autoFocus
                    value={codigoTotp}
                    onChange={(e) => setCodigoTotp(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                {erro && <p className="text-sm text-red-600">{erro}</p>}

                <button type="submit" disabled={carregando} className="btn-primary w-full">
                  {carregando ? "Verificando..." : "Confirmar"}
                </button>
              </form>

              <p className="text-center text-sm mt-4">
                <button type="button" onClick={voltar} className="link-acao">
                  Voltar
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-sm mt-6 text-[var(--ai-ink-suave)]">
          Precisa de acesso?{" "}
          <a
            href={`https://wa.me/${NUMERO_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-acao underline"
          >
            Fale com a gente pelo WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
