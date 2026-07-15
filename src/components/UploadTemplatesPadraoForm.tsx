"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  nome: string;
  variaveisDetectadas: string[];
}

export default function UploadTemplatePadraoForm({
  templatesIniciais,
}: {
  templatesIniciais: Template[];
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [templates, setTemplates] = useState(templatesIniciais);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!arquivo || !nome) {
      setErro("Preencha o nome e selecione um arquivo .docx");
      return;
    }

    setCarregando(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("arquivo", arquivo);

    const res = await fetch("/api/admin/templates-padrao", {
      method: "POST",
      body: formData,
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao enviar o arquivo.");
      return;
    }

    const { template } = await res.json();
    setTemplates([...templates, template]);
    setNome("");
    setArquivo(null);
    router.refresh();
  }

  async function handleRemover(templateId: string) {
    if (!confirm("Remover este documento da biblioteca padrão?")) return;
    await fetch(`/api/admin/templates-padrao/${templateId}`, { method: "DELETE" });
    setTemplates(templates.filter((t) => t.id !== templateId));
  }

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
      <ul className="space-y-2 mb-6">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between border dark:border-gray-600 rounded-md p-3 text-sm dark:text-gray-200">
            <div>
              <p className="font-medium">{t.nome}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Variáveis: {t.variaveisDetectadas.join(", ") || "nenhuma encontrada"}
              </p>
            </div>
            <button onClick={() => handleRemover(t.id)} className="text-red-600 text-xs hover:underline">
              Remover
            </button>
          </li>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento padrão cadastrado ainda.</p>
        )}
      </ul>

      <form onSubmit={handleUpload} className="space-y-3 border-t dark:border-gray-600 pt-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome do documento</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Termo de Ciência de Norma Interna"
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Arquivo (.docx)</label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            className="text-sm dark:text-gray-300"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button type="submit" disabled={carregando} className="bg-black text-white px-4 py-2 rounded-md text-sm">
          {carregando ? "Enviando..." : "Adicionar à biblioteca"}
        </button>
      </form>
    </div>
  );
}