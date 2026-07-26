"use client";

import { useState } from "react";
import { SecaoConta, type SessaoItem } from "./SecaoConta";
import { SecaoNotificacoes } from "./SecaoNotificacoes";
import { SecaoDadosEmpresa, type EmpresaDadosItem } from "./SecaoDadosEmpresa";
import { SecaoAdministracaoGeral, type AdminItem } from "./SecaoAdministracaoGeral";
import { SecaoDoisFatores } from "./SecaoDoisFatores";
import { SecaoLogAcesso, type LogAcessoItem } from "./SecaoLogAcesso";
import { SecaoConsentimentoCookies } from "./SecaoConsentimentoCookies";
import { Toast, type ToastVariant } from "@/components/ui/Toast";
import { BuscaInput } from "@/components/ui/BuscaInput";
import { contemBusca } from "@/lib/normalizarTexto";

export type Feedback = (variant: ToastVariant, titulo: string, descricao?: string) => void;

interface ConfiguracoesViewProps {
  papel: "ADMIN" | "EMPRESA";
  usuario: { nome: string | null; emailOuLogin: string; avatarUrl: string | null };
  preferenciasIniciais: unknown;
  sessoesIniciais: SessaoItem[];
  totpAtivadoInicial: boolean;
  logsAcessoIniciais: LogAcessoItem[];
  ultimoConsentimentoIniciais: string | null;
  empresaInicial?: EmpresaDadosItem;
  adminsIniciais?: AdminItem[];
  usuarioAtualId?: string;
  diasAlertaIniciais?: number[];
}

interface SecaoDescritor {
  chave: string;
  titulo: string;
  /** Termos extra que também "acham" a seção, além do próprio título. */
  palavrasChave: string[];
  node: React.ReactNode;
}

function secaoCorresponde(secao: SecaoDescritor, busca: string): boolean {
  if (!busca.trim()) return true;
  return contemBusca(secao.titulo, busca) || secao.palavrasChave.some((p) => contemBusca(p, busca));
}

/** Orquestra as seções de Configurações — conteúdo condicional por papel, mesmo shell pros dois. */
export function ConfiguracoesView({
  papel,
  usuario,
  preferenciasIniciais,
  sessoesIniciais,
  totpAtivadoInicial,
  logsAcessoIniciais,
  ultimoConsentimentoIniciais,
  empresaInicial,
  adminsIniciais,
  usuarioAtualId,
  diasAlertaIniciais,
}: ConfiguracoesViewProps) {
  const [toast, setToast] = useState<{ aberto: boolean; variant: ToastVariant; titulo: string; descricao?: string }>({
    aberto: false,
    variant: "success",
    titulo: "",
  });
  const [busca, setBusca] = useState("");

  const mostrarFeedback: Feedback = (variant, titulo, descricao) => {
    setToast({ aberto: true, variant, titulo, descricao });
  };

  const secoes: SecaoDescritor[] = [
    {
      chave: "conta",
      titulo: "Conta",
      palavrasChave: ["perfil", "foto", "avatar", "senha", "tema", "modo escuro", "sessoes ativas", "dispositivos", "nome", "e-mail"],
      node: <SecaoConta usuarioInicial={usuario} sessoesIniciais={sessoesIniciais} onFeedback={mostrarFeedback} />,
    },
    {
      chave: "2fa",
      titulo: "Verificação em duas etapas",
      palavrasChave: ["2fa", "totp", "autenticacao", "seguranca", "codigo"],
      node: <SecaoDoisFatores totpAtivadoInicial={totpAtivadoInicial} onFeedback={mostrarFeedback} />,
    },
    {
      chave: "log-acesso",
      titulo: "Log de acesso",
      palavrasChave: ["login", "historico", "acessos", "seguranca"],
      node: <SecaoLogAcesso logsIniciais={logsAcessoIniciais} />,
    },
    {
      chave: "cookies",
      titulo: "Cookies",
      palavrasChave: ["consentimento", "lgpd", "privacidade", "rastreamento"],
      node: (
        <SecaoConsentimentoCookies
          ultimaAtualizacaoInicial={ultimoConsentimentoIniciais}
          onFeedback={mostrarFeedback}
        />
      ),
    },
    ...(papel === "EMPRESA" && empresaInicial
      ? [
          {
            chave: "dados-empresa",
            titulo: "Dados da empresa",
            palavrasChave: ["razao social", "cnpj", "endereco", "responsavel", "plano", "pagamento"],
            node: <SecaoDadosEmpresa empresaInicial={empresaInicial} onFeedback={mostrarFeedback} />,
          },
        ]
      : []),
    {
      chave: "notificacoes",
      titulo: "Notificações",
      palavrasChave: ["e-mail", "alertas", "avisos"],
      node: <SecaoNotificacoes papel={papel} preferenciasIniciais={preferenciasIniciais} onFeedback={mostrarFeedback} />,
    },
    ...(papel === "ADMIN" && adminsIniciais && usuarioAtualId && diasAlertaIniciais
      ? [
          {
            chave: "administracao-geral",
            titulo: "Administração geral",
            palavrasChave: ["administradores", "convite", "equipe", "prazos de alerta", "vencimento"],
            node: (
              <SecaoAdministracaoGeral
                adminsIniciais={adminsIniciais}
                usuarioAtualId={usuarioAtualId}
                diasAlertaIniciais={diasAlertaIniciais}
                onFeedback={mostrarFeedback}
              />
            ),
          },
        ]
      : []),
  ];

  // `secoes` é recriado a cada render (contém JSX com closures de props/estado)
  // — filtrar direto em vez de useMemo, o array é pequeno (~7 itens) e o custo é irrelevante.
  const secoesFiltradas = secoes.filter((s) => secaoCorresponde(s, busca));

  return (
    <div className="max-w-3xl space-y-8">
      <BuscaInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar em configurações..."
        aria-label="Buscar configuração"
        className="max-w-sm"
      />

      {secoesFiltradas.length === 0 ? (
        <p className="rounded-pa-lg border border-dashed border-border bg-surface-alt p-8 text-center text-body-sm text-ink-muted">
          Nenhuma configuração encontrada para &quot;{busca}&quot;.
        </p>
      ) : (
        secoesFiltradas.map((s) => <div key={s.chave}>{s.node}</div>)
      )}

      <Toast
        aberto={toast.aberto}
        variant={toast.variant}
        titulo={toast.titulo}
        descricao={toast.descricao}
        onFechar={() => setToast((t) => ({ ...t, aberto: false }))}
      />
    </div>
  );
}
