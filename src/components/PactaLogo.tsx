import {
  LOGO_VIEWBOX,
  EMBLEMA_PATHS,
  TEXTO_PACTA,
  TEXTO_SUNT,
  TEXTO_TAGLINE,
} from "./pacta-logo-paths";

interface PactaLogoProps {
  /** "completo" inclui a tagline em cinza; "horizontal" omite (ilegível em tamanhos pequenos) */
  variante?: "completo" | "horizontal";
  className?: string;
  /** ids nos grupos para animação GSAP externa (ex.: "hero") */
  idPrefix?: string;
}

export function PactaLogo({ variante = "completo", className, idPrefix }: PactaLogoProps) {
  const pfx = idPrefix ? `${idPrefix}-` : "";

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={className}
      role="img"
      aria-label="PACTA — Sunt Servanda: os acordos devem ser cumpridos"
      fill="currentColor"
      style={{ fillRule: "evenodd", clipRule: "evenodd" }}
    >
      <g id={`${pfx}logo-emblema`}>
        {EMBLEMA_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g id={`${pfx}logo-pacta`}>
        {TEXTO_PACTA.map((g, i) => (
          <path key={i} d={g.d} transform={g.transform} />
        ))}
      </g>
      <g id={`${pfx}logo-sunt`}>
        {TEXTO_SUNT.map((g, i) => (
          <path key={i} d={g.d} transform={g.transform} />
        ))}
      </g>
      {variante === "completo" && (
        <g id={`${pfx}logo-tagline`} opacity="0.55">
          {TEXTO_TAGLINE.map((g, i) => (
            <path key={i} d={g.d} transform={g.transform} />
          ))}
        </g>
      )}
    </svg>
  );
}
