"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { validarCNPJ } from "@/lib/validacao";

interface DadosCnpj {
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
}

interface TemplatePersonalizado {
  id: string;
  nome: string;
  variaveisDetectadas: string[];
}

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [cnpj, setCnpj] = useState("");
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosCnpj | null>(null);

  const cnpjDebounced = useDebouncedValue(cnpj, 400);
  const cnpjDigitosDebounced = cnpjDebounced.replace(/\D/g, "");
  const cnpjValido =
    cnpjDigitosDebounced.length === 14 ? validarCNPJ(cnpjDigitosDebounced) : null;

  const [loginAcesso, setLoginAcesso] = useState("");
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [plano, setPlano] = useState("MENSAL"); 

  const [templatesDisponiveis, setTemplatesDisponiveis] = useState<TemplatePersonalizado[]>([]);
const [templatesSelecionados, setTemplatesSelecionados] = useState<string[]>([]);

  async function buscarCnpj() {
    setErro("");
    setCarregando(true);
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const res = await fetch(`/api/cnpj/${cnpjLimpo}`);
    setCarregando(false);

    if (!res.ok) {
      setErro("CNPJ não encontrado. Confira o número.");
      return;
    }

    const dados = await res.json();
    setDadosEmpresa(dados);
    setEtapa(2);
  }

  function gerarSenha() {
    const senha = Math.random().toString(36).slice(-10);
    setSenhaAcesso(senha);
  }

  async function buscarTemplatesPersonalizados() {
  setCarregando(true);
  const res = await fetch("/api/admin/empresas/templates-personalizados");
  setCarregando(false);

  if (res.ok) {
    const { templates } = await res.json();
    setTemplatesDisponiveis(templates);
  }
  setEtapa(4);
}

function toggleTemplate(id: string) {
  setTemplatesSelecionados((prev) =>
    prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
  );
}
  async function finalizar() {
    setErro("");

    if (!dadosEmpresa) {
        setErro("Dados da empresa não carregados. Volte à etapa anterior.");
        return;
    }

    const dados = dadosEmpresa; // cópia local — o TypeScript confia nela

    setCarregando(true);

    const res = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        cnpj: cnpj.replace(/\D/g, ""),
        razaoSocial: dados.razao_social,
        nomeFantasia: dados.nome_fantasia,
        logradouro: dados.logradouro,
        numero: dados.numero,
        bairro: dados.bairro,
        cidade: dados.municipio,
        uf: dados.uf,
        cep: dados.cep,
        telefone: dados.ddd_telefone_1,
        loginAcesso,
        senhaAcesso,
        plano,
        templatePersonalizadoIds: templatesSelecionados,
      }),
    });

    setCarregando(false);

    if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao cadastrar empresa.");
        return;
    }

    const { empresaId } = await res.json();
    router.push(`/admin/empresas/${empresaId}`);
    }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nova empresa — Etapa {etapa} de 4</h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {etapa === 1 && (
        <div className="bg-white border rounded-lg p-6">
          <label className="block text-sm font-medium mb-1">CNPJ</label>
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full border rounded-md px-3 py-2"
          />
          {cnpjValido === true && (
            <p className="text-green-600 text-sm mb-4 mt-1">✅ CNPJ válido</p>
          )}
          {cnpjValido === false && (
            <p className="text-red-600 text-sm mb-4 mt-1">❌ CNPJ inválido</p>
          )}
          {cnpjValido === null && <div className="mb-4" />}
          <button
            onClick={buscarCnpj}
            disabled={carregando}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            {carregando ? "Buscando..." : "Buscar dados"}
          </button>
        </div>
      )}

      {etapa === 2 && dadosEmpresa && (
        <div className="bg-white border rounded-lg p-6 space-y-2">
          <p><strong>Razão social:</strong> {dadosEmpresa.razao_social}</p>
          <p><strong>Nome fantasia:</strong> {dadosEmpresa.nome_fantasia || "-"}</p>
          <p><strong>Endereço:</strong> {dadosEmpresa.logradouro}, {dadosEmpresa.numero} — {dadosEmpresa.municipio}/{dadosEmpresa.uf}</p>
          <p><strong>Telefone:</strong> {dadosEmpresa.ddd_telefone_1 || "-"}</p>
          <p className="text-xs text-gray-500 mt-2">
            Esses dados vieram automaticamente da Receita Federal (via BrasilAPI).
          </p>
          <button onClick={() => setEtapa(3)} className="bg-black text-white px-4 py-2 rounded-md mt-4">
            Confirmar e continuar
          </button>
        </div>
      )}

      {etapa === 3 && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Login/e-mail de acesso da empresa</label>
            <input
              value={loginAcesso}
              onChange={(e) => setLoginAcesso(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <div className="flex gap-2">
              <input
                value={senhaAcesso}
                onChange={(e) => setSenhaAcesso(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
              <button onClick={gerarSenha} className="border px-3 py-2 rounded-md text-sm shrink-0">
                Gerar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plano</label>
            <select value={plano} onChange={(e) => setPlano(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="MENSAL">Mensal</option>
              <option value="ANUAL">Anual (com desconto)</option>
            </select>
          </div>
          <button
            onClick={buscarTemplatesPersonalizados}
            disabled={carregando || !loginAcesso || !senhaAcesso}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            {carregando ? "Carregando..." : "Continuar"}
          </button>
        </div>
      )}
      {etapa === 4 && (
  <div className="bg-white border rounded-lg p-6 space-y-3">
    <p className="text-sm text-gray-600 mb-2">
      Selecione os documentos personalizados que essa empresa vai usar (opcional, pode adicionar depois).
    </p>

    {templatesDisponiveis.length === 0 && (
      <p className="text-sm text-gray-400">Nenhum template personalizado na biblioteca ainda.</p>
    )}

    {templatesDisponiveis.map((t) => (
      <label key={t.id} className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
        <input
          type="checkbox"
          checked={templatesSelecionados.includes(t.id)}
          onChange={() => toggleTemplate(t.id)}
        />
        <span className="text-sm">{t.nome}</span>
      </label>
    ))}

    <button
      onClick={finalizar}
      disabled={carregando}
      className="bg-black text-white px-4 py-2 rounded-md mt-4"
    >
      {carregando ? "Cadastrando..." : "Cadastrar empresa"}
    </button>
  </div>
)}
    </div>
  );
}