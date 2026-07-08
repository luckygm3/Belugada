"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-bold text-lg">
          SuaMarca
        </Link>

        {/* menu desktop */}
        <nav className="hidden md:flex gap-6 items-center">
          <a href="#como-funciona">Como funciona</a>
          <a href="#planos">Planos</a>
          <a href="#faq">FAQ</a>
          <Link
            href="/login"
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            Entrar
          </Link>
        </nav>

        {/* botão hambúrguer mobile */}
        <button
          className="md:hidden"
          onClick={() => setAberto(!aberto)}
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </div>

      {/* menu mobile */}
      {aberto && (
        <nav className="md:hidden flex flex-col gap-4 px-4 pb-4">
          <a href="#como-funciona" onClick={() => setAberto(false)}>
            Como funciona
          </a>
          <a href="#planos" onClick={() => setAberto(false)}>
            Planos
          </a>
          <a href="#faq" onClick={() => setAberto(false)}>
            FAQ
          </a>
          <Link href="/login" className="bg-black text-white text-center px-4 py-2 rounded-md">
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}