"use client";

import { useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { perfilSchema, senhaSchema } from "@/lib/schemas/perfil";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import { descreverDispositivo, formatarDataHora } from "@/lib/dispositivo";
import type { Feedback } from "./ConfiguracoesView";

export interface SessaoItem {
  id: string;
  userAgent: string | null;
  ip: string | null;
  criadoEm: string;
  ultimoUso: string;
  atual: boolean;
}

interface SecaoContaProps {
  usuarioInicial: { nome: string | null; emailOuLogin: string; avatarUrl: string | null };
  sessoesIniciais: SessaoItem[];
  onFeedback: Feedback;
}

export function SecaoConta({ usuarioInicial, sessoesIniciais, onFeedback }: SecaoContaProps) {
  const { update } = useSession();
  const inputAvatarRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(usuarioInicial.nome ?? "");
  const [emailOuLogin, setEmailOuLogin] = useState(usuarioInicial.emailOuLogin);
  const [errosPerfil, setErrosPerfil] = useState<Record<string, string>>({});
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  async function salvarPerfil() {
    const resultado = perfilSchema.safeParse({ nome, emailOuLogin });
    if (!resultado.success) {
      setErrosPerfil(mensagensPorCampo(resultado.error));
      onFeedback("error", primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErrosPerfil({});
    setSalvandoPerfil(true);

    const res = await fetch("/api/usuario/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, emailOuLogin }),
    });
    const dados = await res.json().catch(() => ({}));
    setSalvandoPerfil(false);

    if (!res.ok) {
      if (dados.campos) setErrosPerfil(dados.campos);
      onFeedback("error", dados.error || "Erro ao salvar perfil.");
      return;
    }

    if (dados.emailAlterado) {
      onFeedback("success", "E-mail atualizado", "Entre novamente com o novo e-mail.");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
      return;
    }

    await update({ nome });
    onFeedback("success", "Perfil atualizado");
  }

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({});
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function salvarSenha() {
    const resultado = senhaSchema.safeParse({ senhaAtual, novaSenha });
    if (!resultado.success) {
      setErrosSenha(mensagensPorCampo(resultado.error));
      onFeedback("error", primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErrosSenha({});
    setSalvandoSenha(true);

    const res = await fetch("/api/usuario/senha", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    const dados = await res.json().catch(() => ({}));
    setSalvandoSenha(false);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao trocar senha.");
      return;
    }

    setSenhaAtual("");
    setNovaSenha("");
    onFeedback("success", "Senha atualizada");
  }

  const [avatarUrl, setAvatarUrl] = useState(usuarioInicial.avatarUrl);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);

  async function enviarAvatar(arquivo: File) {
    setEnviandoAvatar(true);
    const formData = new FormData();
    formData.append("arquivo", arquivo);

    const res = await fetch("/api/usuario/avatar", { method: "POST", body: formData });
    const dados = await res.json().catch(() => ({}));
    setEnviandoAvatar(false);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao enviar avatar.");
      return;
    }

    setAvatarUrl(dados.avatarUrl);
    await update({ avatarUrl: dados.avatarUrl });
    onFeedback("success", "Foto atualizada");
  }

  const [sessoes, setSessoes] = useState(sessoesIniciais);
  const [encerrando, setEncerrando] = useState<string | null>(null);

  async function encerrarSessao(id: string) {
    setEncerrando(id);
    const res = await fetch(`/api/usuario/sessoes/${id}`, { method: "DELETE" });
    const dados = await res.json().catch(() => ({}));
    setEncerrando(null);

    if (!res.ok) {
      onFeedback("error", dados.error || "Erro ao encerrar sessão.");
      return;
    }

    setSessoes((atual) => atual.filter((s) => s.id !== id));
    onFeedback("success", "Sessão encerrada");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Nome e e-mail usados para login e exibidos no painel.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={errosPerfil.nome} />
          <Input
            label="E-mail / login"
            value={emailOuLogin}
            onChange={(e) => setEmailOuLogin(e.target.value)}
            error={errosPerfil.emailOuLogin}
          />
        </CardContent>
        <CardFooter>
          <Button variant="primary" onClick={salvarPerfil} loading={salvandoPerfil} className="text-body-sm">
            Salvar
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto</CardTitle>
          <CardDescription>PNG, JPEG ou WEBP, até 2MB.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-16 w-16 rounded-pa-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-pa-full bg-navy-700 text-h3 text-white">
              {(nome || emailOuLogin || "?").trim().charAt(0).toUpperCase()}
            </div>
          )}
          <input
            ref={inputAvatarRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) enviarAvatar(arquivo);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            loading={enviandoAvatar}
            onClick={() => inputAvatarRef.current?.click()}
            className="text-body-sm"
          >
            Trocar foto
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Confirme a senha atual para definir uma nova.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            error={errosSenha.senhaAtual}
          />
          <Input
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            error={errosSenha.novaSenha}
          />
        </CardContent>
        <CardFooter>
          <Button variant="primary" onClick={salvarSenha} loading={salvandoSenha} className="text-body-sm">
            Trocar senha
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Claro ou escuro — vale para todo o painel.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões ativas</CardTitle>
          <CardDescription>Dispositivos onde sua conta está logada. Encerrar não afeta este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {sessoes.length === 0 && <p className="py-3 text-body-sm text-ink-muted">Nenhuma outra sessão.</p>}
          {sessoes.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-ink">
                  {descreverDispositivo(s.userAgent)}
                  {s.atual && <span className="font-normal text-ink-muted"> — este dispositivo</span>}
                </p>
                <p className="text-caption text-ink-muted">
                  {s.ip ? `${s.ip} · ` : ""}último uso {formatarDataHora(s.ultimoUso)}
                </p>
              </div>
              {!s.atual && (
                <Button
                  variant="secondary"
                  onClick={() => encerrarSessao(s.id)}
                  loading={encerrando === s.id}
                  className="shrink-0 text-body-sm"
                >
                  Encerrar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
