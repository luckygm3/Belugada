"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [emailOuLogin, setEmailOuLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const res = await signIn("credentials", {
      emailOuLogin,
      senha,
      redirect: false,
    });

    if (res?.error) {
      setErro("Usuário ou senha inválidos");
      setCarregando(false);
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());
    const destino = session.user?.papel === "ADMIN" ? "/admin" : "/empresa";
    window.location.href = destino;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-xl">
            SuaMarca
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário ou e-mail
              </label>
              <input
                type="text"
                value={emailOuLogin}
                onChange={(e) => setEmailOuLogin(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-black text-white py-2.5 rounded-md font-medium disabled:opacity-50"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            <a href="/esqueci-senha" className="text-gray-600 hover:text-black">
              Esqueci minha senha
            </a>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Precisa de acesso?{" "}
          <a href="https://wa.me/5545998182943" target="_blank" className="text-black underline">
            Fale com a gente pelo WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}