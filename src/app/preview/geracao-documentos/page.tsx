"use client";

/**
 * Página de QA visual temporária — NÃO faz parte do fluxo real do app (sem
 * layout de admin, sem auth). Só pra revisar o `GeracaoDocumentosProgress`
 * isolado antes de integrar na geração de verdade. Apagar depois de aprovado.
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { GeracaoDocumentosProgress, type EstadoGeracaoDocumentos } from "@/components/GeracaoDocumentosProgress";

const ESTADOS: EstadoGeracaoDocumentos[] = ["preparando", "gerando", "finalizando", "concluido", "erro"];

export default function PreviewGeracaoDocumentosPage() {
  const [estado, setEstado] = useState<EstadoGeracaoDocumentos>("preparando");
  const [progresso, setProgresso] = useState(40);

  return (
    <div className="painel-admin min-h-screen">
      <PageContainer className="max-w-2xl">
        <h1 className="text-h1 text-ink mb-1">Preview — Progresso de geração</h1>
        <p className="text-body text-ink-muted mb-8">
          Componente isolado, simulado por botões abaixo. Nada aqui está ligado à geração real.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Controles</CardTitle>
            <CardDescription>Troque o estado e, em &quot;gerando&quot;, ajuste o progresso.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <Button
                  key={e}
                  variant={e === estado ? "primary" : "secondary"}
                  onClick={() => setEstado(e)}
                  className="text-body-sm"
                >
                  {e}
                </Button>
              ))}
            </div>

            {estado === "gerando" && (
              <label className="flex items-center gap-3 text-body-sm text-ink-muted">
                progresso: {progresso}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progresso}
                  onChange={(e) => setProgresso(Number(e.target.value))}
                  className="flex-1 accent-navy-600"
                />
              </label>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <GeracaoDocumentosProgress
              estado={estado}
              progresso={estado === "gerando" ? progresso : undefined}
              detalhe={estado === "gerando" ? `${Math.round((progresso / 100) * 12)} de 12 documentos` : undefined}
              nomeArquivo="joao-silva-documentos.zip"
              mensagemErro={estado === "erro" ? "Falha ao preencher o template “Contrato de Experiência”." : undefined}
              onBaixar={() => alert("simulação: baixar arquivo")}
              onTentarNovamente={() => setEstado("preparando")}
            />
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
