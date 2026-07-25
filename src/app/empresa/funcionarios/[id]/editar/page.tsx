import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FuncionarioForm from "@/components/FuncionarioForm";

function formatarData(data: Date | null): string {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

export default async function EditarFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const funcionario = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionario || funcionario.empresaId !== session!.user.empresaId) notFound();

  const dependentes =
    (funcionario.dependentes as unknown as { nome: string; parentesco: string; dataNascimento: string }[]) || [];

  return (
    <FuncionarioForm
      modo="editar"
      funcionarioId={funcionario.id}
      dadosIniciais={{
        nomeCompleto: funcionario.nomeCompleto,
        cpf: funcionario.cpf,
        rg: funcionario.rg || "",
        dataNascimento: formatarData(funcionario.dataNascimento),
        estadoCivil: funcionario.estadoCivil || "",
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
        dataAdmissao: formatarData(funcionario.dataAdmissao),
        dataTerminoContrato: formatarData(funcionario.dataTerminoContrato),
        tipoContrato: funcionario.tipoContrato || "CLT",
        salarioBaseCentavos: funcionario.salarioBase ? Math.round(funcionario.salarioBase * 100).toString() : "",
        dependentes,
      }}
    />
  );
}
