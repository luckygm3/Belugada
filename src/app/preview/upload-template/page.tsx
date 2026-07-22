"use client";

/**
 * Página de QA visual temporária — NÃO faz parte do fluxo real do app (sem
 * layout de admin, sem auth). Só pra revisar o `UploadTemplateDropzone`
 * isolado antes de integrar na biblioteca de templates de verdade. Apagar
 * depois de aprovado.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { UploadTemplateDropzone } from "@/components/UploadTemplateDropzone";

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PreviewUploadTemplatePage() {
  const [forcarErro, setForcarErro] = useState(false);

  async function enviarSimulado(_arquivo: File, aoProgredir: (percentual: number) => void) {
    for (let p = 0; p <= 80; p += 20) {
      aoProgredir(p);
      await esperar(400);
    }
    if (forcarErro) {
      await esperar(300);
      throw new Error("O servidor recusou o arquivo (simulação de erro).");
    }
    aoProgredir(100);
    await esperar(300);
  }

  return (
    <div className="painel-admin min-h-screen">
      <PageContainer className="max-w-xl">
        <h1 className="text-h1 text-ink mb-1">Preview — Upload de template</h1>
        <p className="text-body text-ink-muted mb-8">
          Componente isolado. O envio é simulado (progresso falso), nada é enviado de verdade.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Controles</CardTitle>
            <CardDescription>Marque para simular uma falha no envio.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-body-sm text-ink">
              <input
                type="checkbox"
                checked={forcarErro}
                onChange={(e) => setForcarErro(e.target.checked)}
                className="accent-navy-600"
              />
              Forçar erro no envio
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dropzone</CardTitle>
            <CardDescription>Arraste um .docx, ou clique — teste também soltar um arquivo de outro tipo.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadTemplateDropzone aoEnviar={enviarSimulado} />
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
