"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { empresaEdicaoSchema } from "@/lib/schemas/empresa";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { BadgeStatus } from "./ui/BadgeStatus";

export interface DadosEmpresaEditaveis {
  razaoSocial: string;
  nomeFantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  emailCorporativo: string;
  planoContratado: string;
  statusPagamento: string;
  responsavelNome: string;
  responsavelCargo: string;
  responsavelTelefone: string;
  responsavelEmail: string;
  representanteLegalNome: string;
  representanteLegalCargo: string;
  representanteLegalCpf: string;
}

const ROTULO_PLANO: Record<string, string> = {
  MENSAL: "Mensal",
  ANUAL: "Anual (com desconto)",
};

function CampoTexto({
  label,
  valor,
  editando,
  onChange,
  erro,
}: {
  label: string;
  valor: string;
  editando: boolean;
  onChange: (valor: string) => void;
  erro?: string;
}) {
  if (!editando) {
    return (
      <p className="text-body-sm">
        <span className="text-ink-muted">{label}: </span>
        <span className="text-ink">{valor || "-"}</span>
      </p>
    );
  }
  return <Input label={label} value={valor} onChange={(e) => onChange(e.target.value)} error={erro} />;
}

export default function EmpresaDadosForm({
  empresaId,
  cnpj,
  dataAberturaFormatada,
  situacaoCadastral,
  naturezaJuridica,
  funcionariosCount,
  totalDocumentos,
  totalDocumentosDetalhe,
  dadosIniciais,
}: {
  empresaId: string;
  cnpj: string;
  dataAberturaFormatada: string;
  situacaoCadastral: string;
  naturezaJuridica: string;
  funcionariosCount: number;
  totalDocumentos: number;
  totalDocumentosDetalhe: string;
  dadosIniciais: DadosEmpresaEditaveis;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  const [dados, setDados] = useState(dadosIniciais);
  const [rascunho, setRascunho] = useState(dadosIniciais);

  function campoProps(chave: keyof DadosEmpresaEditaveis) {
    return {
      valor: editando ? rascunho[chave] : dados[chave],
      onChange: (valor: string) => setRascunho((r) => ({ ...r, [chave]: valor })),
      erro: erros[chave],
    };
  }

  function iniciarEdicao() {
    setRascunho(dados);
    setSucesso(false);
    setErro("");
    setErros({});
    setEditando(true);
  }

  function cancelar() {
    setEditando(false);
    setErro("");
    setErros({});
  }

  async function salvar() {
    setErro("");
    setSucesso(false);

    const resultado = empresaEdicaoSchema.safeParse(rascunho);
    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      setErro(primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErros({});
    setSalvando(true);

    const res = await fetch(`/api/admin/empresas/${empresaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rascunho),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar alterações.");
      if (data.campos) setErros(data.campos);
      return;
    }

    setDados(rascunho);
    setEditando(false);
    setSucesso(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{dados.razaoSocial}</h1>
          <p className="text-body-sm text-ink-muted">CNPJ: {cnpj}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!editando ? (
            <Button variant="secondary" onClick={iniciarEdicao} className="text-body-sm">
              Editar
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={cancelar} disabled={salvando} className="text-body-sm">
                Cancelar
              </Button>
              <Button variant="primary" onClick={salvar} loading={salvando} className="text-body-sm">
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {sucesso && <p className="text-body-sm text-green-600">Salvo com sucesso.</p>}
      {erro && <p className="text-body-sm text-red-600">{erro}</p>}

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {editando ? (
            <div>
              <label className="label">Plano</label>
              <select
                value={rascunho.planoContratado}
                onChange={(e) => setRascunho((r) => ({ ...r, planoContratado: e.target.value }))}
                className="input"
              >
                <option value="MENSAL">Mensal</option>
                <option value="ANUAL">Anual (com desconto)</option>
              </select>
            </div>
          ) : (
            <p className="text-body-sm">
              <span className="text-ink-muted">Plano: </span>
              <span className="text-ink">{ROTULO_PLANO[dados.planoContratado] ?? dados.planoContratado ?? "-"}</span>
            </p>
          )}

          {editando ? (
            <div>
              <label className="label">Status</label>
              <select
                value={rascunho.statusPagamento}
                onChange={(e) => setRascunho((r) => ({ ...r, statusPagamento: e.target.value }))}
                className="input"
              >
                <option value="ATIVO">ATIVO</option>
                <option value="ATRASADO">ATRASADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          ) : (
            <p className="text-body-sm">
              <span className="mr-2 text-ink-muted">Status:</span>
              <BadgeStatus status={dados.statusPagamento} />
            </p>
          )}

          <p className="text-body-sm">
            <span className="text-ink-muted">Funcionários: </span>
            <span className="text-ink">{funcionariosCount}</span>
          </p>
          <p className="col-span-2 text-body-sm">
            <span className="text-ink-muted">Total de documentos por funcionário: </span>
            <span className="text-ink">{totalDocumentos}</span>
            <span className="text-ink-muted"> ({totalDocumentosDetalhe})</span>
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <CampoTexto label="Razão social" editando={editando} {...campoProps("razaoSocial")} />
          <CampoTexto label="Nome fantasia" editando={editando} {...campoProps("nomeFantasia")} />
          <p className="text-body-sm">
            <span className="text-ink-muted">CNPJ: </span>
            <span className="text-ink">{cnpj}</span>
          </p>
          <p className="text-body-sm">
            <span className="text-ink-muted">Data de abertura: </span>
            <span className="text-ink">{dataAberturaFormatada}</span>
          </p>
          <p className="text-body-sm">
            <span className="text-ink-muted">Situação cadastral: </span>
            <span className="text-ink">{situacaoCadastral || "-"}</span>
          </p>
          <p className="text-body-sm">
            <span className="text-ink-muted">Natureza jurídica: </span>
            <span className="text-ink">{naturezaJuridica || "-"}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço e contato</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <CampoTexto label="Logradouro" editando={editando} {...campoProps("logradouro")} />
          <CampoTexto label="Número" editando={editando} {...campoProps("numero")} />
          <CampoTexto label="Complemento" editando={editando} {...campoProps("complemento")} />
          <CampoTexto label="Bairro" editando={editando} {...campoProps("bairro")} />
          <CampoTexto label="Cidade" editando={editando} {...campoProps("cidade")} />
          <CampoTexto label="UF" editando={editando} {...campoProps("uf")} />
          <CampoTexto label="CEP" editando={editando} {...campoProps("cep")} />
          <CampoTexto label="Telefone" editando={editando} {...campoProps("telefone")} />
          <CampoTexto label="E-mail corporativo" editando={editando} {...campoProps("emailCorporativo")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsável</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <CampoTexto label="Nome" editando={editando} {...campoProps("responsavelNome")} />
          <CampoTexto label="Cargo" editando={editando} {...campoProps("responsavelCargo")} />
          <CampoTexto label="Telefone" editando={editando} {...campoProps("responsavelTelefone")} />
          <CampoTexto label="E-mail" editando={editando} {...campoProps("responsavelEmail")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Representante legal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <p className="col-span-2 text-body-sm text-ink-muted">
            Usado na qualificação de documentos que citam o representante legal infra-assinado — diferente do
            responsável comercial acima.
          </p>
          <CampoTexto label="Nome" editando={editando} {...campoProps("representanteLegalNome")} />
          <CampoTexto label="Cargo" editando={editando} {...campoProps("representanteLegalCargo")} />
          <CampoTexto label="CPF" editando={editando} {...campoProps("representanteLegalCpf")} />
        </CardContent>
      </Card>
    </div>
  );
}
