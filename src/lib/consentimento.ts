import { z } from "zod";

export const CONSENTIMENTO_COOKIE = "pacta-consentimento";

export const escolhasConsentimentoSchema = z.object({
  preferencias: z.boolean(),
  analytics: z.boolean(),
});

/** Essenciais nunca aparece aqui — não depende de consentimento, sempre ativo. */
export interface EscolhasConsentimento {
  preferencias: boolean;
  analytics: boolean;
}

export interface CategoriaCookie {
  chave: keyof EscolhasConsentimento | "essenciais";
  titulo: string;
  descricao: string;
  obrigatoria: boolean;
}

// Estrutura pronta pra quando a categoria "analytics" tiver uso real (hoje
// nenhum script de analytics é carregado — o toggle só fica guardado, sem
// efeito prático ainda). Adicionar categoria nova = um item nesta lista +
// um campo booleano no model ConsentimentoCookies (prisma/schema.prisma).
export const CATEGORIAS_COOKIE: CategoriaCookie[] = [
  {
    chave: "essenciais",
    titulo: "Essenciais",
    descricao: "Login, sessão e segurança. Necessários pro sistema funcionar — não dependem de consentimento.",
    obrigatoria: true,
  },
  {
    chave: "preferencias",
    titulo: "Preferências",
    descricao: "Lembrar escolhas como o tema (claro/escuro) do painel entre visitas.",
    obrigatoria: false,
  },
  {
    chave: "analytics",
    titulo: "Analytics",
    descricao: "Métricas de uso anônimas pra entender como o site é usado. Ainda não ativado nesta versão.",
    obrigatoria: false,
  },
];

/** Lê o cookie de consentimento já salvo (client-side). Retorna null se ausente/corrompido. */
export function lerConsentimentoCookie(valor: string | undefined): EscolhasConsentimento | null {
  if (!valor) return null;
  try {
    const dados = JSON.parse(decodeURIComponent(valor));
    if (typeof dados.preferencias === "boolean" && typeof dados.analytics === "boolean") {
      return { preferencias: dados.preferencias, analytics: dados.analytics };
    }
  } catch {
    // cookie corrompido ou de um formato antigo — trata como se não houvesse consentimento
  }
  return null;
}
