"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className ?? "text-sm text-gray-600 hover:text-black"}
    >
      Sair
    </button>
  );
}
