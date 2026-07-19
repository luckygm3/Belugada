"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExcluirFuncionarioButtonProps {
  funcionarioId: string;
  nomeFuncionario: string;
  redirecionarApos?: string;
}

export default function ExcluirFuncionarioButton({
  funcionarioId,
  nomeFuncionario,
  redirecionarApos,
}: ExcluirFuncionarioButtonProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmarExclusao() {
    setExcluindo(true);
    setErro("");

    const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}`, { method: "DELETE" });

    setExcluindo(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao excluir funcionário.");
      return;
    }

    setModalAberto(false);

    if (redirecionarApos) {
      router.push(redirecionarApos);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="text-red-600 hover:underline text-sm"
      >
        Excluir
      </button>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 max-w-sm w-full space-y-4">
            <p className="text-sm dark:text-gray-200">
              Tem certeza que deseja excluir <strong>{nomeFuncionario}</strong>? Essa ação não
              pode ser desfeita e apaga todos os documentos gerados desse funcionário.
            </p>
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                disabled={excluindo}
                className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                {excluindo ? "Excluindo..." : "Excluir permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
