import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import FuncionarioForm from "@/components/FuncionarioForm";
import { OperandoComoEmpresa } from "@/components/OperandoComoEmpresa";

export default async function AdminNovoFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") redirect("/login");

  const { id: empresaId } = await params;

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { razaoSocial: true } });
  if (!empresa) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <OperandoComoEmpresa empresaId={empresaId} empresaNome={empresa.razaoSocial} />
      <FuncionarioForm modo="criar" empresaId={empresaId} />
    </div>
  );
}
