import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { HeaderPacta } from "@/components/landing/HeaderPacta";
import { FooterPacta } from "@/components/landing/FooterPacta";

// ATENÇÃO: texto placeholder gerado pra ter uma política de verdade linkada
// no banner de consentimento — precisa de revisão jurídica (Beatriz) antes
// de qualquer lançamento em produção. Não é aconselhamento legal.

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Política de Cookies — PACTA",
  description: "Como a PACTA usa cookies e como você pode gerenciar suas preferências.",
};

export default function PoliticaDeCookiesPage() {
  return (
    <div className={`landing-pacta ${cinzel.variable} ${montserrat.variable}`}>
      <HeaderPacta />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--pt-ink)]">Política de Cookies</h1>
        <p className="mt-2 text-sm text-[var(--pt-ink-suave)]">Última atualização: julho de 2026</p>

        <div className="mt-10 space-y-8 text-[var(--pt-ink)] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">O que são cookies</h2>
            <p>
              Cookies são pequenos arquivos que um site salva no seu navegador pra lembrar informações entre
              visitas — como preferências de exibição ou dados de login. A PACTA usa cookies pra fazer o sistema
              funcionar e, com sua permissão, pra melhorar sua experiência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Categorias de cookies que usamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Essenciais</h3>
                <p>
                  Necessários pro funcionamento do sistema — autenticação, manutenção da sessão e segurança. Não
                  podem ser desativados porque, sem eles, o sistema não funciona. Não dependem do seu consentimento
                  (base legal: execução do contrato / cumprimento de obrigação legal, conforme Art. 7º da LGPD).
                </p>
              </div>
              <div>
                <h3 className="font-medium">Preferências</h3>
                <p>
                  Lembram escolhas como o tema (claro/escuro) do painel entre uma visita e outra. Só são usados com
                  seu consentimento.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Analytics</h3>
                <p>
                  Nos ajudariam a entender, de forma agregada e anônima, como o site é usado — pra melhorar a
                  experiência. Ainda não ativamos nenhuma ferramenta de analytics nesta versão do site; se
                  ativarmos, essa categoria passa a valer e você pode revisar sua escolha a qualquer momento.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Como gerenciar suas preferências</h2>
            <p>
              Você pode revisar ou alterar sua escolha a qualquer momento clicando em &ldquo;Preferências de
              cookies&rdquo; no rodapé do site. Você também pode bloquear cookies diretamente nas configurações do
              seu navegador —
              nesse caso, algumas partes do sistema podem não funcionar corretamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Seus direitos (LGPD)</h2>
            <p>
              Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a confirmação da
              existência de tratamento, acesso, correção, anonimização, portabilidade e eliminação dos seus dados,
              além de revogar o consentimento dado a qualquer momento. Pra exercer esses direitos ou tirar dúvidas,
              fale com a gente pelo WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contato</h2>
            <p>Dúvidas sobre esta política podem ser enviadas pelo WhatsApp indicado no site.</p>
          </section>
        </div>
      </main>
      <FooterPacta />
    </div>
  );
}
