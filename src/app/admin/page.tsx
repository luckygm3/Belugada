"use client";

import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  return (
    <div>
      <h1>Painel Admin — funcionou!</h1>
      <button onClick={() => signOut({ callbackUrl: "/login" })}>
        Sair
      </button>
    </div>
  );
}