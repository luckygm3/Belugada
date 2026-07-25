import { Sidebar } from "./Sidebar";

const LINKS = [
  { href: "/admin/empresas", rotulo: "Empresas" },
  { href: "/admin/templates-padrao", rotulo: "Biblioteca de documentos" },
  { href: "/admin/notificacoes", rotulo: "Atividades" },
];

export function AdminSidebar() {
  return <Sidebar links={LINKS} hrefInicio="/admin" idPrefix="admin-sidebar" />;
}
