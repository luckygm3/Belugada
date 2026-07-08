"use client";

import { useEffect, useState } from "react";

export function BannerCookies() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aceitou = localStorage.getItem("cookies-aceitos");
    if (!aceitou) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage, só existe no client
      setVisivel(true);
    }
  }, []);

  function aceitar() {
    localStorage.setItem("cookies-aceitos", "true");
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col md:flex-row items-center justify-between gap-3 z-50">
      <p className="text-sm">
        Usamos cookies para melhorar sua navegação. Ao continuar, você concorda com nossa política de privacidade.
      </p>
      <button onClick={aceitar} className="bg-white text-gray-900 px-4 py-2 rounded-md shrink-0">
        Entendi
      </button>
    </div>
  );
}