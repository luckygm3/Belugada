import { Navbar } from "@/components/Navbar";
import { BotaoWhatsapp } from "@/components/BotaoWhatsapp";
import { BannerCookies } from "@/components/BannerCookies";

export default function Home() {
  return (
    <>
      <Navbar />

      <section className="max-w-4xl mx-auto text-center px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Prevenção jurídica para sua empresa</h1>
        <p className="text-lg text-gray-600 mb-8">
          Cadastre seus funcionários e gere automaticamente todos os documentos de rotina, com a segurança de uma consultoria especializada.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href="#planos" className="bg-black text-white px-6 py-3 rounded-md">Ver planos</a>
          <a href="https://wa.me/5511999999999" target="_blank" className="border border-gray-300 px-6 py-3 rounded-md">Falar no WhatsApp</a>
        </div>
      </section>

      <section id="como-funciona" className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { titulo: "Consultoria", texto: "Definimos com você os documentos certos" },
              { titulo: "Cadastro", texto: "Sua equipe cadastra os funcionários" },
              { titulo: "Geração", texto: "O sistema gera os documentos automaticamente" },
              { titulo: "Prevenção", texto: "Sua empresa protegida, sempre em dia" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3">{i + 1}</div>
                <h3 className="font-semibold mb-1">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-8">
              <h3 className="font-semibold text-xl mb-2">Mensal</h3>
              <p className="text-3xl font-bold mb-4">R$ XXX<span className="text-base font-normal">/mês</span></p>
              <a href="/login" className="block text-center bg-black text-white py-3 rounded-md">Assinar</a>
            </div>
            <div className="border-2 border-black rounded-lg p-8">
              <h3 className="font-semibold text-xl mb-2">Anual</h3>
              <p className="text-3xl font-bold mb-4">R$ XXX<span className="text-base font-normal">/mês</span></p>
              <p className="text-sm text-green-600 mb-4">Economize com o plano anual</p>
              <a href="/login" className="block text-center bg-black text-white py-3 rounded-md">Assinar</a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-gray-50 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas frequentes</h2>
          <div className="space-y-3">
            {[
              { p: "Como funciona a consultoria inicial?", r: "Nossa equipe jurídica analisa sua empresa e define os documentos necessários." },
              { p: "Posso cancelar quando quiser?", r: "Sim, sem multa, respeitando o período já contratado." },
              { p: "Os dados dos funcionários são seguros?", r: "Sim, seguimos as diretrizes da LGPD com criptografia e controle de acesso." },
            ].map((item, i) => (
              <details key={i} className="border rounded-md p-4 bg-white">
                <summary className="font-medium cursor-pointer">{item.p}</summary>
                <p className="text-gray-600 mt-2 text-sm">{item.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SuaMarca. Todos os direitos reservados.
      </footer>

      <BotaoWhatsapp />
      <BannerCookies />
    </>
  );
}