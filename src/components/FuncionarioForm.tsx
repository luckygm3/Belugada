"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { validarCPF } from "@/lib/validacao";
import { funcionarioSchema, funcionarioEtapa1Schema, funcionarioEtapa2Schema } from "@/lib/schemas/funcionario";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  dataTerminoContrato: string;
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
  dataTerminoContrato: "",
  tipoContrato: "CLT",
  salarioBaseCentavos: "",
  dependentes: [],
};

interface FuncionarioFormProps {
  modo: "criar" | "editar";
  funcionarioId?: string;
  dadosIniciais?: DadosFuncionarioForm;
}

interface EtapaInfo {
  titulo: string;
  dica: string;
}

const ETAPAS: EtapaInfo[] = [
  { titulo: "Dados pessoais", dica: "Nome, CPF, RG e data de nascimento — a base do cadastro." },
  { titulo: "Endereço e contato", dica: "Preencha o CEP e use \"Buscar\" pra autocompletar o resto." },
  { titulo: "Dados trabalhistas", dica: "Cargo, admissão e tipo de contrato — usados nos documentos gerados." },
  { titulo: "Dependentes", dica: "Opcional. Adicione quantos precisar, ou pule direto pra revisão." },
  { titulo: "Revisão", dica: "Confira os dados antes de cadastrar e gerar os documentos." },
];

const TOTAL_ETAPAS = ETAPAS.length;

function IconeCheck() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M3.5 8.2l2.7 2.7 6-6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PainelEtapas({ etapaAtual }: { etapaAtual: number }) {
  return (
    <Card className="sticky top-8 space-y-4 p-5">
      <p className="text-body-sm font-medium text-ink">Etapas</p>
      <ol className="space-y-3">
        {ETAPAS.map((info, i) => {
          const numero = i + 1;
          const concluida = numero < etapaAtual;
          const atual = numero === etapaAtual;
          return (
            <li key={info.titulo} className="flex items-start gap-3">
              <span
                className={[
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pa-full text-caption font-medium",
                  concluida
                    ? "bg-teal-600 text-white"
                    : atual
                      ? "bg-navy-600 text-white"
                      : "bg-slate-100 text-ink-muted dark:bg-slate-700",
                ].join(" ")}
              >
                {concluida ? <IconeCheck /> : numero}
              </span>
              <span className={`text-body-sm ${atual ? "font-medium text-ink" : concluida ? "text-ink" : "text-ink-muted"}`}>
                {info.titulo}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-border pt-4">
        <p className="text-caption text-ink-muted">{ETAPAS[etapaAtual - 1].dica}</p>
      </div>
    </Card>
  );
}

export default function FuncionarioForm({ modo, funcionarioId, dadosIniciais }: FuncionarioFormProps) {
  const router = useRouter();
  const reduzMovimento = useReducedMotion();
  const dados = dadosIniciais ?? dadosVazios;

  const [etapa, setEtapa] = useState(1);
  const [direcao, setDirecao] = useState<1 | -1>(1);
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
  const [dataTerminoContrato, setDataTerminoContrato] = useState(dados.dataTerminoContrato);
  const [tipoContrato, setTipoContrato] = useState(dados.tipoContrato);
  const [salarioBaseCentavos, setSalarioBaseCentavos] = useState(dados.salarioBaseCentavos);

  // Etapa 4 — dependentes
  const [dependentes, setDependentes] = useState<Dependente[]>(dados.dependentes);

  function irPara(novaEtapa: number) {
    setDirecao(novaEtapa > etapa ? 1 : -1);
    setEtapa(novaEtapa);
  }

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
      dataTerminoContrato,
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

  // Sem exit (nem AnimatePresence): cada etapa só anima a ENTRADA. Uma transição
  // de saída dependeria do callback de animação completar antes de desmontar o
  // card anterior — em qualquer situação que atrase esse callback (aba em
  // segundo plano, dispositivo lento), o usuário ficaria preso vendo a etapa
  // antiga. Card some na hora, o novo entra animado; sem risco de travar o fluxo.
  const variantesEtapa = {
    entra: (dir: 1 | -1) => (reduzMovimento ? { opacity: 0 } : { opacity: 0, x: dir * 24 }),
    centro: reduzMovimento ? { opacity: 1 } : { opacity: 1, x: 0 },
  };

  return (
    <div className="mx-auto flex max-w-4xl items-start gap-6">
      <div className="max-w-2xl flex-1 space-y-6">
        <div>
          <h1 className="text-h1 text-ink">
            {tituloEtapa} — Etapa {etapa} de {TOTAL_ETAPAS}
          </h1>
          <ProgressBar
            value={(etapa / TOTAL_ETAPAS) * 100}
            className="mt-3"
            aria-label={`Etapa ${etapa} de ${TOTAL_ETAPAS}`}
          />
        </div>

        {erro && <p className="text-body-sm text-red-600">{erro}</p>}

        {etapa === 1 && (
          <motion.div
            key="etapa-1"
            initial={variantesEtapa.entra(direcao)}
            animate={variantesEtapa.centro}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="space-y-4 p-6">
              <Input label="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} error={erros.nomeCompleto} />

              <div>
                <Input
                  label="CPF"
                  value={cpfValor}
                  onChange={(e) => setCpfValor(e.target.value)}
                  placeholder="000.000.000-00"
                  error={erros.cpf}
                />
                {cpfValido === true && <p className="mt-1 text-body-sm text-green-600">✅ CPF válido</p>}
                {cpfValido === false && <p className="mt-1 text-body-sm text-red-600">❌ CPF inválido</p>}
              </div>

              <Input label="RG" value={rg} onChange={(e) => setRg(e.target.value)} error={erros.rg} />
              <Input
                label="Data de nascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                error={erros.dataNascimento}
              />

              <div>
                <label className="label">Estado civil</label>
                <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className="input">
                  <option value="">Selecione</option>
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                  <option value="VIUVO">Viúvo(a)</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" className="text-body-sm" onClick={() => validarEtapa1() && irPara(2)}>
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {etapa === 2 && (
          <motion.div
            key="etapa-2"
            initial={variantesEtapa.entra(direcao)}
            animate={variantesEtapa.centro}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="space-y-4 p-6">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" error={erros.cep} />
                </div>
                <Button variant="secondary" className="text-body-sm" onClick={buscarCep}>
                  Buscar
                </Button>
              </div>

              <Input label="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
                <Input label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                <Input label="UF" value={uf} onChange={(e) => setUf(e.target.value)} />
              </div>

              <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} error={erros.telefone} />
              <Input label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} error={erros.email} />

              <div className="flex justify-between">
                <Button variant="secondary" className="text-body-sm" onClick={() => irPara(1)}>
                  Voltar
                </Button>
                <Button variant="primary" className="text-body-sm" onClick={() => validarEtapa2() && irPara(3)}>
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {etapa === 3 && (
          <motion.div
            key="etapa-3"
            initial={variantesEtapa.entra(direcao)}
            animate={variantesEtapa.centro}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="space-y-4 p-6">
              <Input label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
              <Input label="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
              <Input label="Data de admissão" type="date" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} />

              <div>
                <label className="label">Tipo de contrato</label>
                <select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} className="input">
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="TEMPORARIO">Temporário</option>
                </select>
              </div>

              <div>
                <Input
                  label="Data de término do contrato (se houver)"
                  type="date"
                  value={dataTerminoContrato}
                  onChange={(e) => setDataTerminoContrato(e.target.value)}
                />
                <p className="mt-1 text-caption text-ink-muted">
                  Preencha em contratos de experiência, temporários ou com prazo definido — é o que permite os
                  alertas de vencimento.
                </p>
              </div>

              <Input
                label="Salário base"
                type="text"
                inputMode="numeric"
                value={salarioBaseCentavos ? formatarMoeda(salarioBaseCentavos) : ""}
                onChange={handleSalarioChange}
                placeholder="R$ 0,00"
              />

              <div className="flex justify-between">
                <Button variant="secondary" className="text-body-sm" onClick={() => irPara(2)}>
                  Voltar
                </Button>
                <Button variant="primary" className="text-body-sm" onClick={() => irPara(4)}>
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {etapa === 4 && (
          <motion.div
            key="etapa-4"
            initial={variantesEtapa.entra(direcao)}
            animate={variantesEtapa.centro}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="space-y-4 p-6">
              {dependentes.map((dep, i) => (
                <div key={i} className="space-y-3 rounded-pa-md border border-border p-4">
                  <Input label="Nome" value={dep.nome} onChange={(e) => atualizarDependente(i, "nome", e.target.value)} />
                  <Input
                    label="Parentesco"
                    value={dep.parentesco}
                    onChange={(e) => atualizarDependente(i, "parentesco", e.target.value)}
                  />
                  <Input
                    label="Data de nascimento"
                    type="date"
                    value={dep.dataNascimento}
                    onChange={(e) => atualizarDependente(i, "dataNascimento", e.target.value)}
                  />
                  <button onClick={() => removerDependente(i)} className="text-caption font-medium text-red-600 hover:underline">
                    Remover
                  </button>
                </div>
              ))}

              <Button variant="secondary" className="text-body-sm" onClick={adicionarDependente}>
                + Adicionar dependente
              </Button>

              <div className="flex justify-between pt-2">
                <Button variant="secondary" className="text-body-sm" onClick={() => irPara(3)}>
                  Voltar
                </Button>
                <Button variant="primary" className="text-body-sm" onClick={() => irPara(5)}>
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {etapa === 5 && (
          <motion.div
            key="etapa-5"
            initial={variantesEtapa.entra(direcao)}
            animate={variantesEtapa.centro}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="space-y-2 p-6 text-body-sm">
              <p><span className="text-ink-muted">Nome: </span><span className="text-ink">{nomeCompleto}</span></p>
              <p><span className="text-ink-muted">CPF: </span><span className="text-ink">{cpfValor}</span></p>
              <p><span className="text-ink-muted">Endereço: </span><span className="text-ink">{logradouro}, {numero} — {cidade}/{uf}</span></p>
              <p><span className="text-ink-muted">Cargo: </span><span className="text-ink">{cargo || "-"}</span></p>
              <p><span className="text-ink-muted">Admissão: </span><span className="text-ink">{dataAdmissao || "-"}</span></p>
              <p><span className="text-ink-muted">Término do contrato: </span><span className="text-ink">{dataTerminoContrato || "-"}</span></p>
              <p><span className="text-ink-muted">Dependentes: </span><span className="text-ink">{dependentes.length}</span></p>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" className="text-body-sm" onClick={() => irPara(4)}>
                  Voltar
                </Button>
                <Button variant="primary" className="text-body-sm" loading={carregando} onClick={finalizar}>
                  {carregando ? textoBotaoFinalCarregando : textoBotaoFinal}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">
        <PainelEtapas etapaAtual={etapa} />
      </aside>
    </div>
  );
}
