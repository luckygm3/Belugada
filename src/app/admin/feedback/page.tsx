import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackTabela } from "@/components/FeedbackTabela";

function IconeBalao() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M3 5.5A2.5 2.5 0 015.5 3h9A2.5 2.5 0 0117 5.5v6A2.5 2.5 0 0114.5 14H9l-4 3v-3H5.5A2.5 2.5 0 013 11.5v-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function AdminFeedbackPage() {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") redirect("/login");

  const notas = await prisma.notaFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { usuario: { select: { nome: true, emailOuLogin: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-ink">Feedback</h1>
        <p className="mt-1 text-body-sm text-ink-muted">Notas enviadas pelo widget &quot;Notei falta de algo&quot;.</p>
      </div>

      {notas.length === 0 ? (
        <EmptyState icone={<IconeBalao />} titulo="Nenhuma nota ainda" />
      ) : (
        <FeedbackTabela
          notas={notas.map((n) => ({
            id: n.id,
            texto: n.texto,
            paginaOrigem: n.paginaOrigem,
            visto: n.visto,
            createdAt: n.createdAt.toISOString(),
            autorNome: n.usuario.nome ?? n.usuario.emailOuLogin,
          }))}
        />
      )}
    </div>
  );
}
