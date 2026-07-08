export function BotaoWhatsapp() {
  const numero = "5545998182943";
  const mensagem = encodeURIComponent("Olá! Quero saber mais sobre a plataforma.");

  return (
    <a href={`https://wa.me/${numero}?text=${mensagem}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50" aria-label="Falar no WhatsApp">
      💬
    </a>
  );
}