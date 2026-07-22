const PERGUNTAS = [
  {
    p: "Como funciona a consultoria inicial?",
    r: "Uma advogada especialista em direito trabalhista analisa sua empresa — porte, tipos de contratação, jornadas — e define quais documentos cada funcionário precisa ter. Essa definição vira a configuração da sua conta na plataforma.",
  },
  {
    p: "Preciso entender de direito trabalhista para usar?",
    r: "Não. Você só cadastra os dados do funcionário; o que deve ser gerado, e com qual conteúdo, já foi definido pela consultoria. A plataforma cuida do resto.",
  },
  {
    p: "Os documentos valem juridicamente?",
    r: "Os documentos são gerados a partir de modelos elaborados e revisados pela consultoria jurídica, personalizados com os dados de cada funcionário, prontos para impressão e assinatura.",
  },
  {
    p: "Os dados dos funcionários são seguros?",
    r: "Sim. Seguimos as diretrizes da LGPD, com criptografia, controle de acesso por empresa e armazenamento em infraestrutura segura.",
  },
  {
    p: "Posso cancelar quando quiser?",
    r: "Sim, sem multa, respeitando o período já contratado.",
  },
];

export function SecaoFaq() {
  return (
    <section id="faq" className="bg-white border-t border-[var(--pt-linha-clara)] py-20 sm:py-28 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="fonte-display text-3xl sm:text-4xl text-[var(--pt-ink)] text-balance">
          Perguntas frequentes
        </h2>
        <div className="mt-10 divide-y divide-[var(--pt-linha-clara)] border-y border-[var(--pt-linha-clara)]">
          {PERGUNTAS.map((item) => (
            <details key={item.p} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-[var(--pt-ink)]">
                {item.p}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[var(--pt-dourado)] text-xl leading-none transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[var(--pt-ink-suave)] max-w-[65ch]">{item.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
