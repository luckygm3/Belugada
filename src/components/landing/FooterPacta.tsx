import { PactaLogo } from "../PactaLogo";

export function FooterPacta() {
  return (
    <footer className="bg-[var(--pt-petrol-950)] text-[var(--pt-claro-suave)] py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
        <div>
          <PactaLogo
            variante="horizontal"
            idPrefix="footer"
            className="h-10 w-auto text-[var(--pt-claro)]"
          />
          <p className="mt-4 text-sm italic">
            Pacta sunt servanda — os acordos devem ser cumpridos.
          </p>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} PACTA. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
