"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("tema") === "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage, só existe no client
    setEscuro(salvo);
    document.documentElement.classList.toggle("dark", salvo);
  }, []);

  function alternar() {
    const novoValor = !escuro;
    setEscuro(novoValor);
    document.documentElement.classList.toggle("dark", novoValor);
    localStorage.setItem("tema", novoValor ? "dark" : "light");
  }

  return (
    <button
      onClick={alternar}
      className="text-sm border rounded-md px-3 py-1.5 dark:border-gray-600"
      aria-label="Alternar tema"
    >
      {escuro ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}