"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(valor: T, atrasoMs = 400): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setValorDebounced(valor), atrasoMs);
    return () => clearTimeout(timer);
  }, [valor, atrasoMs]);

  return valorDebounced;
}
