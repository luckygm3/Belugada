"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { validarCNPJ } from "@/lib/validacao";
import { empresaCadastroSchema, empresaCadastroEtapa1Schema } from "@/lib/schemas/empresa";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TemplatePersonalizado {
  id: string;
  nome: string;
  variaveisDetectadas: string[];
}

interface Socio {
  nome: string;
  qualificacao: string;
}

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  const [cnpj, setCnpj] = useState("");
  const [cnpjBuscado, setCnpjBuscado] = useState<string | null>(null);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  const cnpjDebounced = useDebouncedValue(cnpj, 400);
  const cnpjDigitosDebounced = cnpjDebounced.replace(/\D/g, "");
  const cnpjValido =
    cnpjDigitosDebounced.length === 14 ? validarCNPJ(cnpjDigitosDebounced) : null;

  // Dados da empresa — preenchidos automaticamente pela busca, mas editáveis
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataAbertura, setDataAbertura] = useState("");
  const [situacaoCadastral, setSituacaoCadastral] = useState("");
  const [naturezaJuridica, setNaturezaJuridica] = useState("");
  const [capitalSocial, setCapitalSocial] = useState("");
  const [porteEmpresa, setPorteEmpresa] = useState("");
  const [cnaePrincipal, setCnaePrincipal] = useState("");
  const [cnaesSecundarios, setCnaesSecundarios] = useState<string[]>([]);
  const [quadroSocietario, setQuadroSocietario] = useState<Socio[]>([]);

  // Não vem das APIs de CNPJ — é o contato da empresa cliente, preenchido manualmente
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelCargo, setResponsavelCargo] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");

  const [loginAcesso, setLoginAcesso] = useState("");
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [plano, setPlano] = useState("MENSAL");

  const [templatesDisponiveis, setTemplatesDisponiveis] = useState<TemplatePersonalizado[]>([]);
  const [templatesSelecionados, setTemplatesSelecionados] = useState<string[]>([]);

  async function buscarCnpj() {
    setErro("");
    setCarregando(true);
    setCnpjBuscado(cnpjDigitosDebounced);

    const res = await fetch(`/api/cnpj/${cnpjDigitosDebounced}`);
    const dados = await res.json();
    setCarregando(false);

    if (!res.ok) {
      if (!dados.naoEncontrado) {
        setErro(dados.error || "Erro ao buscar CNPJ.");
        return;
      }
      // CNPJ não encontrado nas fontes — libera preenchimento manual sem bloquear o fluxo
      setDadosCarregados(true);
      return;
    }

    setRazaoSocial(dados.razao_social || "");
    setNomeFantasia(dados.nome_fantasia || "");
    setLogradouro(dados.logradouro || "");
    setNumero(dados.numero || "");
    setBairro(dados.bairro || "");
    setCidade(dados.municipio || "");
    setUf(dados.uf || "");
    setCep(dados.cep || "");
    setTelefone(dados.ddd_telefone_1 || "");
    setDataAbertura(dados.data_abertura || "");
    setSituacaoCadastral(dados.situacao_cadastral || "");
    setNaturezaJuridica(dados.natureza_juridica || "");
    setCapitalSocial(dados.capital_social != null ? String(dados.capital_social) : "");
    setPorteEmpresa(dados.porte_empresa || "");
    setCnaePrincipal(dados.cnae_principal || "");
    setCnaesSecundarios(dados.cnaes_secundarios || []);
    setQuadroSocietario(dados.quadro_societario || []);
    setDadosCarregados(true);
  }

  // Dispara a busca automaticamente assim que o CNPJ se tornar válido
  useEffect(() => {
    if (cnpjValido && cnpjDigitosDebounced !== cnpjBuscado && !carregando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- busca é a própria sincronização com a API de CNPJ, não um efeito colateral evitável
      buscarCnpj();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjValido, cnpjDigitosDebounced]);

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
    setEtapa(3);
  }

  function toggleTemplate(id: string) {
    setTemplatesSelecionados((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function validarEtapa1() {
    const resultado = empresaCadastroEtapa1Schema.safeParse({
      cnpj: cnpjDigitosDebounced,
      razaoSocial,
      telefone,
      cep,
      responsavelTelefone,
      responsavelEmail,
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

  async function finalizar() {
    setErro("");

    const payload = {
      cnpj: cnpjDigitosDebounced,
      razaoSocial,
      nomeFantasia,
      logradouro,
      numero,
      bairro,
      cidade,
      uf,
      cep,
      telefone,
      dataAbertura: dataAbertura || null,
      situacaoCadastral,
      naturezaJuridica,
      capitalSocial: capitalSocial || null,
      porteEmpresa,
      cnaePrincipal,
      cnaesSecundarios,
      quadroSocietario,
      responsavelNome,
      responsavelCargo,
      responsavelTelefone,
      responsavelEmail,
      loginAcesso,
      senhaAcesso,
      plano,
      templatePersonalizadoIds: templatesSelecionados,
    };

    const resultado = empresaCadastroSchema.safeParse(payload);
    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      setErro(primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErros({});

    setCarregando(true);

    const res = await fetch("/api/admin/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao cadastrar empresa.");
      if (data.campos) setErros(data.campos);
      return;
    }

    const { empresaId } = await res.json();
    router.push(`/admin/empresas/${empresaId}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-h1 text-ink">
        Nova empresa <span className="text-ink-muted">— Etapa {etapa} de 3</span>
      </h1>

      {erro && <p className="text-body-sm text-red-600">{erro}</p>}

      {etapa === 1 && (
        <Card className="space-y-4 p-6">
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} error={erros.cnpj} />
              </div>
              <Button
                variant="secondary"
                onClick={buscarCnpj}
                disabled={carregando || !cnpjValido}
                className="shrink-0 text-body-sm"
              >
                {carregando ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {cnpjValido === true && <p className="mt-1 text-body-sm text-green-600">✅ CNPJ válido</p>}
            {cnpjValido === false && <p className="mt-1 text-body-sm text-red-600">❌ CNPJ inválido</p>}
          </div>

          {dadosCarregados && (
            <>
              <Input label="Razão social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} error={erros.razaoSocial} />
              <Input label="Nome fantasia" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
              <Input label="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
                <Input label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                <Input label="UF" value={uf} onChange={(e) => setUf(e.target.value)} />
              </div>
              <Input label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} error={erros.cep} />
              <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} error={erros.telefone} />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de abertura"
                  type="date"
                  value={dataAbertura}
                  onChange={(e) => setDataAbertura(e.target.value)}
                />
                <Input label="Situação cadastral" value={situacaoCadastral} onChange={(e) => setSituacaoCadastral(e.target.value)} />
              </div>
              <Input label="Natureza jurídica" value={naturezaJuridica} onChange={(e) => setNaturezaJuridica(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Capital social (R$)"
                  type="number"
                  value={capitalSocial}
                  onChange={(e) => setCapitalSocial(e.target.value)}
                />
                <Input label="Porte da empresa" value={porteEmpresa} onChange={(e) => setPorteEmpresa(e.target.value)} />
              </div>
              <Input label="CNAE principal" value={cnaePrincipal} onChange={(e) => setCnaePrincipal(e.target.value)} />
              <div>
                <label className="label">CNAEs secundários (um por linha)</label>
                <textarea
                  value={cnaesSecundarios.join("\n")}
                  onChange={(e) => setCnaesSecundarios(e.target.value.split("\n"))}
                  rows={3}
                  className="input w-full"
                />
              </div>

              {quadroSocietario.length > 0 && (
                <div>
                  <p className="label mb-1">Quadro societário (obtido automaticamente)</p>
                  <ul className="divide-y divide-border rounded-pa-md border border-border text-body-sm">
                    {quadroSocietario.map((s, i) => (
                      <li key={i} className="px-3 py-2 text-ink">
                        {s.nome} {s.qualificacao && <span className="text-ink-muted">— {s.qualificacao}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h2 className="mb-3 text-h4 text-ink">Responsável (contato na empresa)</h2>
                <div className="space-y-4">
                  <Input label="Nome" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Cargo" value={responsavelCargo} onChange={(e) => setResponsavelCargo(e.target.value)} />
                    <Input
                      label="Telefone"
                      value={responsavelTelefone}
                      onChange={(e) => setResponsavelTelefone(e.target.value)}
                      error={erros.responsavelTelefone}
                    />
                  </div>
                  <Input
                    label="E-mail"
                    value={responsavelEmail}
                    onChange={(e) => setResponsavelEmail(e.target.value)}
                    error={erros.responsavelEmail}
                  />
                </div>
              </div>

              <Button variant="primary" onClick={() => validarEtapa1() && setEtapa(2)}>
                Continuar
              </Button>
            </>
          )}
        </Card>
      )}

      {etapa === 2 && (
        <Card className="space-y-4 p-6">
          <Input label="Login/e-mail de acesso da empresa" value={loginAcesso} onChange={(e) => setLoginAcesso(e.target.value)} />
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input label="Senha" value={senhaAcesso} onChange={(e) => setSenhaAcesso(e.target.value)} />
              </div>
              <Button variant="secondary" onClick={gerarSenha} className="shrink-0 text-body-sm">
                Gerar
              </Button>
            </div>
          </div>
          <div>
            <label className="label">Plano</label>
            <select value={plano} onChange={(e) => setPlano(e.target.value)} className="input">
              <option value="MENSAL">Mensal</option>
              <option value="ANUAL">Anual (com desconto)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEtapa(1)}>
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={buscarTemplatesPersonalizados}
              disabled={carregando || !loginAcesso || !senhaAcesso}
            >
              {carregando ? "Carregando..." : "Continuar"}
            </Button>
          </div>
        </Card>
      )}

      {etapa === 3 && (
        <Card className="space-y-3 p-6">
          <p className="text-body-sm text-ink-muted">
            Selecione os documentos personalizados que essa empresa vai usar (opcional, pode adicionar depois).
          </p>

          {templatesDisponiveis.length === 0 && (
            <p className="text-body-sm text-ink-muted">Nenhum template personalizado na biblioteca ainda.</p>
          )}

          {templatesDisponiveis.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-2 rounded-pa-md border border-border px-3 py-2"
            >
              <input
                type="checkbox"
                checked={templatesSelecionados.includes(t.id)}
                onChange={() => toggleTemplate(t.id)}
                className="accent-navy-600"
              />
              <span className="text-body-sm text-ink">{t.nome}</span>
            </label>
          ))}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEtapa(2)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={finalizar} disabled={carregando}>
              {carregando ? "Cadastrando..." : "Cadastrar empresa"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
