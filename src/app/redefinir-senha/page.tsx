"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Link inválido — token não encontrado na URL.");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setCarregando(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, novaSenha }),
    });

    const data = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(data.error || "Não foi possível redefinir a senha.");
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto" }}>
        <h1>Link inválido</h1>
        <p>Solicite um novo link em `&quot`Esqueci minha senha`&quot`.</p>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto" }}>
        <h1>Senha redefinida!</h1>
        <p>Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Redefinir senha</h1>
      <form onSubmit={handleSubmit}>
        <label>Nova senha</label>
        <br />
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <br />
        <label style={{ marginTop: 12, display: "block" }}>
          Confirmar nova senha
        </label>
        <input
          type="password"
          value={confirmaSenha}
          onChange={(e) => setConfirmaSenha(e.target.value)}
          required
        />
        {erro && <p style={{ color: "red" }}>{erro}</p>}
        <button type="submit" disabled={carregando} style={{ marginTop: 16 }}>
          {carregando ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}