"use client";

import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [emailOuLogin, setEmailOuLogin] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOuLogin }),
    });

    setCarregando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto" }}>
        <h1>Verifique seu e-mail</h1>
        <p>
          Se o e-mail/usuário existir na nossa base, você vai receber um link
          para redefinir sua senha em instantes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Esqueci minha senha</h1>
      <form onSubmit={handleSubmit}>
        <label>Usuário ou e-mail</label>
        <br />
        <input
          type="text"
          value={emailOuLogin}
          onChange={(e) => setEmailOuLogin(e.target.value)}
          required
        />
        <br />
        <button type="submit" disabled={carregando} style={{ marginTop: 16 }}>
          {carregando ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>
    </div>
  );
}