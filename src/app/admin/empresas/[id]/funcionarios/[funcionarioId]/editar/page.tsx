import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import FuncionarioForm from "@/components/FuncionarioForm";
import { OperandoComoEmpresa } from "@/components/OperandoComoEmpresa";

function formatarData(data: Date | null): string {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

export default async function AdminEditarFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string; funcionarioId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") redirect("/login");

  const { id: empresaId, funcionarioId } = await params;

  const [empresa, funcionario] = await Promise.all([
    prisma.empresa.findUnique({ where: { id: empresaId }, select: { razaoSocial: true } }),
    prisma.funcionario.findUnique({ where: { id: funcionarioId } }),
  ]);

  if (!empresa || !funcionario || funcionario.empresaId !== empresaId) notFound();

  const dependentes =
    (funcionario.dependentes as unknown as { nome: string; parentesco: string; dataNascimento: string }[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <OperandoComoEmpresa empresaId={empresaId} empresaNome={empresa.razaoSocial} />
      <FuncionarioForm
        modo="editar"
        funcionarioId={funcionario.id}
        empresaId={empresaId}
        dadosIniciais={{
          nomeCompleto: funcionario.nomeCompleto,
          cpf: funcionario.cpf,
          rg: funcionario.rg || "",
          dataNascimento: formatarData(funcionario.dataNascimento),
          estadoCivil: funcionario.estadoCivil || "",
          nacionalidade: funcionario.nacionalidade || "",
          logradouro: funcionario.logradouro || "",
          numero: funcionario.numero || "",
          bairro: funcionario.bairro || "",
          cidade: funcionario.cidade || "",
          uf: funcionario.uf || "",
          cep: funcionario.cep || "",
          telefone: funcionario.telefone || "",
          email: funcionario.email || "",
          cargo: funcionario.cargo || "",
          departamento: funcionario.departamento || "",
          ctpsNumero: funcionario.ctpsNumero || "",
          ctpsSerie: funcionario.ctpsSerie || "",
          dataAdmissao: formatarData(funcionario.dataAdmissao),
          dataTerminoContrato: formatarData(funcionario.dataTerminoContrato),
          tipoContrato: funcionario.tipoContrato || "CLT",
          salarioBaseCentavos: funcionario.salarioBase ? Math.round(funcionario.salarioBase * 100).toString() : "",
          dependentes,
        }}
      />
    </div>
  );
}
