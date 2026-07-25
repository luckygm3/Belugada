interface BotaoWhatsappProps {
  mensagem?: string;
  variante?: "fixo" | "inline";
}

export const NUMERO_WHATSAPP = "5545998182943";

export function BotaoWhatsapp({
  mensagem = "Olá! Quero saber mais sobre a plataforma.",
  variante = "fixo",
}: BotaoWhatsappProps = {}) {
  const numero = NUMERO_WHATSAPP;
  const mensagemCodificada = encodeURIComponent(mensagem);

  const classeFixo =
    "fixed bottom-5 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50";
  const classeInline =
    "inline-flex items-center gap-2 rounded-pa-md bg-green-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-green-700";

  return (
    <a
      href={`https://wa.me/${numero}?text=${mensagemCodificada}`}
      target="_blank"
      rel="noopener noreferrer"
      className={variante === "fixo" ? classeFixo : classeInline}
      aria-label="Falar no WhatsApp"
    >
      {variante === "fixo" ? "💬" : <>💬 Falar no WhatsApp</>}
    </a>
  );
}