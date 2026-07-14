"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Dependente {
  nome: string;
  parentesco: string;
  dataNascimento: string;
}

interface DadosCep {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const inputClass =
  "w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const labelClass = "block text-sm font-medium mb-1 dark:text-gray-200";

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Etapa 1 — dados pessoais
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpfValor, setCpfValor] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");

  // Etapa 2 — endereço
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Etapa 3 — dados trabalhistas
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [tipoContrato, setTipoContrato] = useState("CLT");
  const [salarioBase, setSalarioBase] = useState("");

  // Etapa 4 — dependentes
  const [dependentes, setDependentes] = useState<Dependente[]>([]);

  function adicionarDependente() {
    setDependentes([...dependentes, { nome: "", parentesco: "", dataNascimento: "" }]);
  }

  function atualizarDependente(index: number, campo: keyof Dependente, valor: string) {
    const copia = [...dependentes];
    copia[index][campo] = valor;
    setDependentes(copia);
  }

  function removerDependente(index: number) {
    setDependentes(dependentes.filter((_, i) => i !== index));
  }

  async function buscarCep() {
    setErro("");
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("CEP inválido.");
      return;
    }

    const res = await fetch(`/api/cep/${cepLimpo}`);
    if (!res.ok) {
      setErro("CEP não encontrado.");
      return;
    }

    const dados: DadosCep = await res.json();
    setLogradouro(dados.logradouro);
    setBairro(dados.bairro);
    setCidade(dados.localidade);
    setUf(dados.uf);
  }

  function validarEtapa1() {
    if (!nomeCompleto || !cpfValor) {
      setErro("Nome completo e CPF são obrigatórios.");
      return false;
    }
    return true;
  }

  async function finalizar() {
    setErro("");
    setCarregando(true);

    const res = await fetch("/api/empresa/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCompleto,
        cpf: cpfValor,
        rg,
        dataNascimento,
        estadoCivil,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        telefone,
        email,
        cargo,
        departamento,
        dataAdmissao,
        tipoContrato,
        salarioBase,
        dependentes,
      }),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao cadastrar funcionário.");
      return;
    }

    router.push("/empresa");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Novo funcionário — Etapa {etapa} de 5
      </h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {etapa === 1 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input value={cpfValor} onChange={(e) => setCpfValor(e.target.value)} placeholder="000.000.000-00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>RG</label>
            <input value={rg} onChange={(e) => setRg(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado civil</label>
            <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className={inputClass}>
              <option value="">Selecione</option>
              <option value="SOLTEIRO">Solteiro(a)</option>
              <option value="CASADO">Casado(a)</option>
              <option value="DIVORCIADO">Divorciado(a)</option>
              <option value="VIUVO">Viúvo(a)</option>
            </select>
          </div>
          <button
            onClick={() => validarEtapa1() && setEtapa(2)}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            Continuar
          </button>
        </div>
      )}

      {etapa === 2 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelClass}>CEP</label>
              <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className={inputClass} />
            </div>
            <button onClick={buscarCep} className="border dark:border-gray-600 dark:text-white px-3 py-2 rounded-md text-sm">
              Buscar
            </button>
          </div>
          <div>
            <label className={labelClass}>Logradouro</label>
            <input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Número</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bairro</label>
              <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UF</label>
              <input value={uf} onChange={(e) => setUf(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEtapa(1)} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md">
              Voltar
            </button>
            <button onClick={() => setEtapa(3)} className="bg-black text-white px-4 py-2 rounded-md">
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === 3 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className={labelClass}>Cargo</label>
            <input value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Departamento</label>
            <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de admissão</label>
            <input type="date" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo de contrato</label>
            <select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} className={inputClass}>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="ESTAGIO">Estágio</option>
              <option value="TEMPORARIO">Temporário</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Salário base (R$)</label>
            <input type="number" value={salarioBase} onChange={(e) => setSalarioBase(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEtapa(2)} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md">
              Voltar
            </button>
            <button onClick={() => setEtapa(4)} className="bg-black text-white px-4 py-2 rounded-md">
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === 4 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
          {dependentes.map((dep, i) => (
            <div key={i} className="border dark:border-gray-600 rounded-md p-3 space-y-2">
              <input
                placeholder="Nome"
                value={dep.nome}
                onChange={(e) => atualizarDependente(i, "nome", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Parentesco"
                value={dep.parentesco}
                onChange={(e) => atualizarDependente(i, "parentesco", e.target.value)}
                className={inputClass}
              />
              <input
                type="date"
                value={dep.dataNascimento}
                onChange={(e) => atualizarDependente(i, "dataNascimento", e.target.value)}
                className={inputClass}
              />
              <button onClick={() => removerDependente(i)} className="text-red-600 text-xs">
                Remover
              </button>
            </div>
          ))}
          <button onClick={adicionarDependente} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md text-sm">
            + Adicionar dependente
          </button>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEtapa(3)} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md">
              Voltar
            </button>
            <button onClick={() => setEtapa(5)} className="bg-black text-white px-4 py-2 rounded-md">
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === 5 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-2 text-sm dark:text-gray-200">
          <p><strong>Nome:</strong> {nomeCompleto}</p>
          <p><strong>CPF:</strong> {cpfValor}</p>
          <p><strong>Endereço:</strong> {logradouro}, {numero} — {cidade}/{uf}</p>
          <p><strong>Cargo:</strong> {cargo}</p>
          <p><strong>Admissão:</strong> {dataAdmissao || "-"}</p>
          <p><strong>Dependentes:</strong> {dependentes.length}</p>
          <div className="flex gap-2 pt-4">
            <button onClick={() => setEtapa(4)} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md">
              Voltar
            </button>
            <button onClick={finalizar} disabled={carregando} className="bg-black text-white px-4 py-2 rounded-md">
              {carregando ? "Cadastrando..." : "Cadastrar e gerar documentos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}