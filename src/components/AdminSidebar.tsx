import { Sidebar } from "./Sidebar";

const LINKS = [
  { href: "/admin/empresas", rotulo: "Empresas" },
  { href: "/admin/funcionarios", rotulo: "Funcionários" },
  { href: "/admin/documentos", rotulo: "Documentos gerados" },
  { href: "/admin/templates-padrao", rotulo: "Biblioteca de documentos" },
  { href: "/admin/notificacoes", rotulo: "Atividades" },
  { href: "/admin/feedback", rotulo: "Feedback" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
];

export function AdminSidebar() {
  return <Sidebar links={LINKS} hrefInicio="/admin" idPrefix="admin-sidebar" />;
}
