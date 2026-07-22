import type { Metadata } from "next";
import { Cinzel, Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
// ...mantém os outros imports que já existem

// Carregadas na raiz para ficarem disponíveis em qualquer rota (landing, admin, empresa, auth).
// A landing carrega as mesmas fontes localmente por só usar seu próprio wrapper — Next.js
// deduplica a fonte pelo hash da especificação, então isso não gera download duplicado.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fonte do sistema de design do painel admin (linha Material/Workspace) — separada
// da Montserrat/Cinzel da marca PACTA (landing/login), que não usam esta variável.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${cinzel.variable} ${montserrat.variable} ${roboto.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "PACTA",
  description: "Documentação trabalhista organizada e gerada automaticamente, com consultoria especializada.",
};
