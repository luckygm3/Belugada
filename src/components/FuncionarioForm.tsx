"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { validarCPF } from "@/lib/validacao";
import { funcionarioSchema, funcionarioEtapa1Schema, funcionarioEtapa2Schema } from "@/lib/schemas/funcionario";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";

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

export interface DadosFuncionarioForm {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  tipoContrato: string;
  salarioBaseCentavos: string;
  dependentes: Dependente[];
}

const dadosVazios: DadosFuncionarioForm = {
  nomeCompleto: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  estadoCivil: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  telefone: "",
  email: "",
  cargo: "",
  departamento: "",
  dataAdmissao: "",
  tipoContrato: "CLT",
  salarioBaseCentavos: "",
  dependentes: [],
};

interface FuncionarioFormProps {
  modo: "criar" | "editar";
  funcionarioId?: string;
  dadosIniciais?: DadosFuncionarioForm;
}

const inputClass =
  "w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const labelClass = "block text-sm font-medium mb-1 dark:text-gray-200";

export default function FuncionarioForm({ modo, funcionarioId, dadosIniciais }: FuncionarioFormProps) {
  const router = useRouter();
  const dados = dadosIniciais ?? dadosVazios;

  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  // Etapa 1 — dados pessoais
  const [nomeCompleto, setNomeCompleto] = useState(dados.nomeCompleto);
  const [cpfValor, setCpfValor] = useState(dados.cpf);
  const cpfDebounced = useDebouncedValue(cpfValor, 400);
  const cpfDigitosDebounced = cpfDebounced.replace(/\D/g, "");
  const cpfValido =
    cpfDigitosDebounced.length === 11 ? validarCPF(cpfDigitosDebounced) : null;
  const [rg, setRg] = useState(dados.rg);
  const [dataNascimento, setDataNascimento] = useState(dados.dataNascimento);
  const [estadoCivil, setEstadoCivil] = useState(dados.estadoCivil);

  // Etapa 2 — endereço
  const [cep, setCep] = useState(dados.cep);
  const [logradouro, setLogradouro] = useState(dados.logradouro);
  const [numero, setNumero] = useState(dados.numero);
  const [bairro, setBairro] = useState(dados.bairro);
  const [cidade, setCidade] = useState(dados.cidade);
  const [uf, setUf] = useState(dados.uf);
  const [telefone, setTelefone] = useState(dados.telefone);
  const [email, setEmail] = useState(dados.email);

  // Etapa 3 — dados trabalhistas
  const [cargo, setCargo] = useState(dados.cargo);
  const [departamento, setDepartamento] = useState(dados.departamento);
  const [dataAdmissao, setDataAdmissao] = useState(dados.dataAdmissao);
  const [tipoContrato, setTipoContrato] = useState(dados.tipoContrato);
  const [salarioBaseCentavos, setSalarioBaseCentavos] = useState(dados.salarioBaseCentavos);

  // Etapa 4 — dependentes
  const [dependentes, setDependentes] = useState<Dependente[]>(dados.dependentes);

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

  function formatarMoeda(valorCentavos: string): string {
    const numero = parseInt(valorCentavos || "0", 10);
    const reais = (numero / 100).toFixed(2);
    const [parteInteira, parteDecimal] = reais.split(".");
    const inteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${inteiraFormatada},${parteDecimal}`;
  }

  function handleSalarioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const apenasDigitos = e.target.value.replace(/\D/g, "");
    setSalarioBaseCentavos(apenasDigitos);
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

    const dadosCep: DadosCep = await res.json();
    setLogradouro(dadosCep.logradouro);
    setBairro(dadosCep.bairro);
    setCidade(dadosCep.localidade);
    setUf(dadosCep.uf);
  }

  function validarEtapa1() {
    const resultado = funcionarioEtapa1Schema.safeParse({
      nomeCompleto,
      cpf: cpfValor,
      rg,
      dataNascimento,
    });

    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      setErro(primeiraMensagemDeErro(resultado.error));
      return false;
    }

    setErros({});
    setErro("");
    return true;
  }

  function validarEtapa2() {
    const resultado = funcionarioEtapa2Schema.safeParse({ cep, telefone, email });

    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      setErro(primeiraMensagemDeErro(resultado.error));
      return false;
    }

    setErros({});
    setErro("");
    return true;
  }

  async function finalizar() {
    setErro("");

    const payload = {
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
      salarioBase: salarioBaseCentavos ? (parseInt(salarioBaseCentavos, 10) / 100).toFixed(2) : "",
      dependentes,
    };

    const resultado = funcionarioSchema.safeParse(payload);
    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      setErro(primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErros({});

    setCarregando(true);

    const url = modo === "editar" ? `/api/empresa/funcionarios/${funcionarioId}` : "/api/empresa/funcionarios";
    const method = modo === "editar" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || (modo === "editar" ? "Erro ao salvar alterações." : "Erro ao cadastrar funcionário."));
      if (data.campos) setErros(data.campos);
      return;
    }

    router.push(modo === "editar" ? `/empresa/funcionarios/${funcionarioId}` : "/empresa");
  }

  const tituloEtapa = modo === "editar" ? "Editar funcionário" : "Novo funcionário";
  const textoBotaoFinal = modo === "editar" ? "Salvar alterações" : "Cadastrar e gerar documentos";
  const textoBotaoFinalCarregando = modo === "editar" ? "Salvando..." : "Cadastrando...";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {tituloEtapa} — Etapa {etapa} de 5
      </h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      {etapa === 1 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className={inputClass} />
            {erros.nomeCompleto && <p className="text-red-600 text-xs mt-1">{erros.nomeCompleto}</p>}
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input value={cpfValor} onChange={(e) => setCpfValor(e.target.value)} placeholder="000.000.000-00" className={inputClass} />
            {cpfValido === true && (
              <p className="text-green-600 text-sm mt-1">✅ CPF válido</p>
            )}
            {cpfValido === false && (
              <p className="text-red-600 text-sm mt-1">❌ CPF inválido</p>
            )}
            {erros.cpf && <p className="text-red-600 text-xs mt-1">{erros.cpf}</p>}
          </div>
          <div>
            <label className={labelClass}>RG</label>
            <input value={rg} onChange={(e) => setRg(e.target.value)} className={inputClass} />
            {erros.rg && <p className="text-red-600 text-xs mt-1">{erros.rg}</p>}
          </div>
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} />
            {erros.dataNascimento && <p className="text-red-600 text-xs mt-1">{erros.dataNascimento}</p>}
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
              {erros.cep && <p className="text-red-600 text-xs mt-1">{erros.cep}</p>}
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
            {erros.telefone && <p className="text-red-600 text-xs mt-1">{erros.telefone}</p>}
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            {erros.email && <p className="text-red-600 text-xs mt-1">{erros.email}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEtapa(1)} className="border dark:border-gray-600 dark:text-white px-4 py-2 rounded-md">
              Voltar
            </button>
            <button onClick={() => validarEtapa2() && setEtapa(3)} className="bg-black text-white px-4 py-2 rounded-md">
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
            <label className={labelClass}>Salário base</label>
            <input
              type="text"
              inputMode="numeric"
              value={salarioBaseCentavos ? formatarMoeda(salarioBaseCentavos) : ""}
              onChange={handleSalarioChange}
              placeholder="R$ 0,00"
              className={inputClass}
            />
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
              {carregando ? textoBotaoFinalCarregando : textoBotaoFinal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
