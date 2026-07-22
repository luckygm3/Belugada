import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { BotaoWhatsapp } from "@/components/BotaoWhatsapp";
import { BannerCookies } from "@/components/BannerCookies";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { HeaderPacta } from "@/components/landing/HeaderPacta";
import { HeroPacta } from "@/components/landing/HeroPacta";
import { SecaoRisco } from "@/components/landing/SecaoRisco";
import { SecaoSolucao } from "@/components/landing/SecaoSolucao";
import { SecaoPlanos } from "@/components/landing/SecaoPlanos";
import { SecaoFaq } from "@/components/landing/SecaoFaq";
import { FooterPacta } from "@/components/landing/FooterPacta";

// Mesmas famílias usadas na arte do logo (Cinzel no "PACTA", Montserrat no restante)
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

export const metadata: Metadata = {
  title: "PACTA — Documentação trabalhista sem risco",
  description:
    "Consultoria especializada em direito trabalhista + plataforma que gera e organiza a documentação de cada funcionário. Proteja sua empresa antes do processo chegar.",
};

export default function Home() {
  return (
    <div className={`landing-pacta ${cinzel.variable} ${montserrat.variable}`}>
      <SmoothScroll />
      <HeaderPacta />
      <main>
        <HeroPacta />
        <SecaoRisco />
        <SecaoSolucao />
        <SecaoPlanos />
        <SecaoFaq />
      </main>
      <FooterPacta />
      <BotaoWhatsapp mensagem="Olá! Quero saber mais sobre a PACTA." />
      <BannerCookies />
    </div>
  );
}
