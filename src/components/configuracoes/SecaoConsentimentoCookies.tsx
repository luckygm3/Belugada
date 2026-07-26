"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CATEGORIAS_COOKIE,
  CONSENTIMENTO_COOKIE,
  lerConsentimentoCookie,
  type EscolhasConsentimento,
} from "@/lib/consentimento";
import { formatarDataHora } from "@/lib/dispositivo";
import type { Feedback } from "./ConfiguracoesView";

interface SecaoConsentimentoCookiesProps {
  ultimaAtualizacaoInicial: string | null;
  onFeedback: Feedback;
}

/** Revisão do consentimento de cookies — mesmas categorias do BannerCookies, reaproveitando o mesmo endpoint. */
export function SecaoConsentimentoCookies({ ultimaAtualizacaoInicial, onFeedback }: SecaoConsentimentoCookiesProps) {
  const [escolhas, setEscolhas] = useState<EscolhasConsentimento>({ preferencias: true, analytics: true });
  const [salvando, setSalvando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(ultimaAtualizacaoInicial);

  useEffect(() => {
    const par = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENTIMENTO_COOKIE}=`));
    const salvo = lerConsentimentoCookie(par?.split("=")[1]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com cookie, só existe no client
    if (salvo) setEscolhas(salvo);
  }, []);

  async function salvar() {
    setSalvando(true);
    const valor = encodeURIComponent(JSON.stringify(escolhas));
    document.cookie = `${CONSENTIMENTO_COOKIE}=${valor}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    try {
      await fetch("/api/consentimento-cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(escolhas),
      });
      setUltimaAtualizacao(new Date().toISOString());
      onFeedback("success", "Preferências de cookies salvas");
    } catch {
      onFeedback("error", "Erro ao salvar preferências de cookies.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacidade e cookies</CardTitle>
        <CardDescription>
          O que você aceitou no banner de cookies — pode mudar a qualquer momento.
          {ultimaAtualizacao && ` Última atualização: ${formatarDataHora(ultimaAtualizacao)}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {CATEGORIAS_COOKIE.map((cat) => (
          <label key={cat.chave} className="flex items-start gap-3 text-body-sm text-ink">
            <input
              type="checkbox"
              checked={cat.chave === "essenciais" ? true : escolhas[cat.chave]}
              disabled={cat.obrigatoria}
              onChange={(e) =>
                cat.chave !== "essenciais" &&
                setEscolhas((atual) => ({ ...atual, [cat.chave]: e.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-border accent-black disabled:opacity-60"
            />
            <span>
              <span className="font-medium text-ink">
                {cat.titulo}
                {cat.obrigatoria && " (sempre ativo)"}
              </span>
              <p className="text-caption text-ink-muted">{cat.descricao}</p>
            </span>
          </label>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="primary" onClick={salvar} loading={salvando} className="text-body-sm">
          Salvar preferências
        </Button>
      </CardFooter>
    </Card>
  );
}
