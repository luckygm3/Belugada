"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { empresaAutoEdicaoSchema } from "@/lib/schemas/empresa";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import type { Feedback } from "./ConfiguracoesView";

const ROTULO_PLANO: Record<string, string> = {
  MENSAL: "Mensal",
  ANUAL: "Anual (com desconto)",
};

export interface EmpresaDadosItem {
  razaoSocial: string;
  cnpj: string;
  planoContratado: string;
  statusPagamento: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  responsavelNome: string;
  responsavelCargo: string;
  responsavelTelefone: string;
  responsavelEmail: string;
}

interface SecaoDadosEmpresaProps {
  empresaInicial: EmpresaDadosItem;
  onFeedback: Feedback;
}

/** Empresa vê o próprio cadastro (razão social/CNPJ/plano/status só-leitura) e edita endereço/telefone/responsável. */
export function SecaoDadosEmpresa({ empresaInicial, onFeedback }: SecaoDadosEmpresaProps) {
  const [dados, setDados] = useState(empresaInicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  function campo(chave: keyof EmpresaDadosItem) {
    return {
      value: dados[chave],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDados((d) => ({ ...d, [chave]: e.target.value })),
      error: erros[chave],
    };
  }

  async function salvar() {
    const resultado = empresaAutoEdicaoSchema.safeParse(dados);
    if (!resultado.success) {
      setErros(mensagensPorCampo(resultado.error));
      onFeedback("error", primeiraMensagemDeErro(resultado.error));
      return;
    }
    setErros({});
    setSalvando(true);

    const res = await fetch("/api/empresa/dados", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultado.data),
    });
    const dadosResposta = await res.json().catch(() => ({}));
    setSalvando(false);

    if (!res.ok) {
      if (dadosResposta.campos) setErros(dadosResposta.campos);
      onFeedback("error", dadosResposta.error || "Erro ao salvar dados da empresa.");
      return;
    }

    onFeedback("success", "Dados da empresa atualizados");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
          <CardDescription>Razão social, CNPJ e plano são gerenciados pela nossa equipe.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p className="text-body-sm">
            <span className="text-ink-muted">Razão social: </span>
            <span className="text-ink">{dados.razaoSocial}</span>
          </p>
          <p className="text-body-sm">
            <span className="text-ink-muted">CNPJ: </span>
            <span className="text-ink">{dados.cnpj}</span>
          </p>
          <p className="text-body-sm">
            <span className="text-ink-muted">Plano: </span>
            <span className="text-ink">{ROTULO_PLANO[dados.planoContratado] ?? dados.planoContratado ?? "-"}</span>
          </p>
          <p className="text-body-sm">
            <span className="mr-2 text-ink-muted">Status:</span>
            <BadgeStatus status={dados.statusPagamento} />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço e contato</CardTitle>
          <CardDescription>Você pode manter esses dados atualizados a qualquer momento.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Logradouro" {...campo("logradouro")} />
          <Input label="Número" {...campo("numero")} />
          <Input label="Complemento" {...campo("complemento")} />
          <Input label="Bairro" {...campo("bairro")} />
          <Input label="Cidade" {...campo("cidade")} />
          <Input label="UF" {...campo("uf")} />
          <Input label="CEP" {...campo("cep")} />
          <Input label="Telefone" {...campo("telefone")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsável</CardTitle>
          <CardDescription>Quem recebe notificação e é contatado via WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nome" {...campo("responsavelNome")} />
          <Input label="Cargo" {...campo("responsavelCargo")} />
          <Input label="Telefone" {...campo("responsavelTelefone")} />
          <Input label="E-mail" {...campo("responsavelEmail")} />
        </CardContent>
        <CardFooter>
          <Button variant="primary" onClick={salvar} loading={salvando} className="text-body-sm">
            Salvar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
